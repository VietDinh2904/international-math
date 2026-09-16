import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "dist" / "assets" / "timo-grade-3.pdf"
ASSET_DIR = ROOT / "dist" / "assets" / "timo"
OUT_JS = ROOT / "dist" / "timo-remaining.js"

PAPERS = [
    ("TIMO-P2", "TIMO Preliminary Paper 2", 5, 9, list("BDACDABCBBACDBC AADBADCACD".replace(" ", ""))),
    ("TIMO-P3", "TIMO Preliminary Paper 3", 10, 13, list("CABBCDADCABACBDCBA CABACCB".replace(" ", ""))),
    ("TIMO-P4", "TIMO Preliminary Paper 4", 14, 17, list("BBCADACDAD CABACDBDCBAACDB".replace(" ", ""))),
    ("TIMO-P5", "TIMO Preliminary Paper 5", 18, 21, list("CBAADDCBAABDDBC CACBDACBCA".replace(" ", ""))),
    ("TIMO-H1", "TIMO Heat 2020-2021", 22, 25, ["3", "7", "Saturday", "110", "40", "2870", "113", "225", "297", "840000", "210", "231", "Odd", "6", "21", "24", "398", "108", "8", "24", "57", "21", "20", "66", "63"]),
    ("TIMO-H2", "TIMO Heat 2019-2020", 26, 28, ["25", "69", "Thursday", "6", "113", "370", "1820", "390", "887112", "87", "960", "119", "240", "25", "24", "22", "32", "30", "16", "8", "37", "97538", "10", "17", "6"]),
    ("TIMO-H3", "TIMO Heat 2018-2019", 29, 31, ["12", "79", "24", "Saturday", "Wednesday", "4999", "2300", "1234321", "200", "400000000", "21", "952", "796", "44", "120", "22", "48", "15", "1521", "15", "34", "48", "20468", "40", "17"]),
    ("TIMO-H4", "TIMO Heat 2017-2018", 32, 34, ["125", "55", "22", "285", "105", "210", "2500", "147741", "4983", "16000000", "256", "1619", "390", "1110", "105", "47", "2017", "3", "9", "10", "11", "36", "21", "9864", "10"]),
    ("TIMO-H5", "TIMO Heat 2016-2017", 35, 38, ["Amy", "69", "Blue", "827", "210", "1900", "123454321", "165", "26", "121000", "152", "104", "54", "72", "108", "193", "35", "60", "52", "36", "13", "12", "15", "20398", "7"]),
]

ACCENTED = re.compile(r"[À-ỹĐđ]")
QUESTION_NUMBER = re.compile(r"(?:[1-9]|1\d|2[0-5])\.")
SECTION_MARKERS = ("Arithmetic /", "Number Theory /", "Number theory /", "Geometry /", "Combinatorics /")
FIGURE_WORDS = re.compile(
    r"\b(figure|diagram|table|map|pattern shown below|pattern below|right-hand side|right side|symbols? below|grid)\b",
    re.I,
)


def grouped_lines(words):
    rows = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        row = next((line for line in reversed(rows[-4:]) if abs(line["top"] - word["top"]) <= 2.6), None)
        if row is None:
            row = {"top": word["top"], "bottom": word["bottom"], "words": []}
            rows.append(row)
        row["words"].append(word)
        row["bottom"] = max(row["bottom"], word["bottom"])
    for row in rows:
        row["words"].sort(key=lambda item: item["x0"])
        row["text"] = " ".join(item["text"] for item in row["words"])
        row["x0"] = min(item["x0"] for item in row["words"])
        row["x1"] = max(item["x1"] for item in row["words"])
    return sorted(rows, key=lambda row: row["top"])


def normalize_space(value):
    return re.sub(r"\s+", " ", value).strip()


def clean_option(value):
    value = re.split(r"\s+(?:Arithmetic|Number Theory|Number theory|Geometry|Combinatorics)\s*/", value, 1)[0]
    value = re.split(r"\s+(?:TUYỂN TẬP|KỲ THI|ĐĂNG KÝ)\b", value, 1)[0]
    value = re.sub(r"\s+\d{1,2}$", "", value)
    value = value.split(" / ", 1)[0]
    value = re.sub(r"\s+", " ", value).strip(" .\n\r\t")
    return value


def parse_options(block_text):
    text = normalize_space(block_text)
    matches = list(re.finditer(r"(?:^|\s)([ABCD])\.\s*", text))
    if len(matches) < 4:
        return []
    options = []
    for index, match in enumerate(matches[:4]):
        end = matches[index + 1].start() if index < 3 else len(text)
        options.append(clean_option(text[match.end():end]))
    return options if all(options) else []


def parse_english(lines, number, preliminary):
    content = []
    accent_index = None
    for index, line in enumerate(lines):
        text = line["text"]
        if not content:
            text = re.sub(rf"^{number}\.\s*", "", text)
        if any(text.startswith(marker) for marker in SECTION_MARKERS):
            break
        if ACCENTED.search(text):
            accent_index = index
            break
        if re.match(r"^[ABCD]\.\s*", text):
            break
        content.append(text)
    result = normalize_space(" ".join(content))
    if accent_index is not None and re.search(r"\b(?:pattern|sequence|blank|star)\b", result, re.I):
        supporting = []
        for line in lines[accent_index + 1:]:
            text = normalize_space(line["text"])
            if re.match(r"^[ABCD]\.\s*", text) or any(text.startswith(marker) for marker in SECTION_MARKERS):
                break
            if ACCENTED.search(text):
                continue
            if re.search(r"[,、…]|\d.*\d", text) and not re.match(r"^(?:KỲ THI|FERMAT|Email|TUYỂN TẬP)", text):
                supporting.append(text)
        if supporting:
            result += " " + " ".join(supporting[:2])
    result = (
        result.replace("", "×")
        .replace("", "÷")
        .replace("−", "-")
        .replace("", "marked symbols")
        .replace("", "⊗")
        .replace("", "⊕")
        .replace("", "≠")
        .replace("", "★")
    )
    return result or f"Question {number}"


def skill_for(number):
    if number <= 5:
        return "Logical Thinking"
    if number <= 10:
        return "Arithmetic"
    if number <= 15:
        return "Number Theory"
    if number <= 20:
        return "Geometry"
    return "Combinatorics"


def guidance_for(skill, final_answer):
    guidance = {
        "Logical Thinking": (
            "Look for the rule or test each clue one at a time.",
            ["Write the clues or the repeating rule in a short list.", "Check each possible answer against every clue."],
        ),
        "Arithmetic": (
            "Calculate multiplication and division before addition and subtraction.",
            ["Copy the expression carefully.", "Work from the simplest multiplication or division to the final total."],
        ),
        "Number Theory": (
            "Turn the number relationship into equal parts or a short number sentence.",
            ["Write the relationship using equal parts or a number sentence.", "Solve the small number sentence, then check it in the question."],
        ),
        "Geometry": (
            "Mark the known lengths or count each shape systematically so none is repeated.",
            ["Label the important lengths, faces, edges or shapes.", "Use the matching perimeter, area or counting rule."],
        ),
        "Combinatorics": (
            "List choices in an organised order and avoid counting the same case twice.",
            ["Start with one fixed choice and list all possibilities.", "Repeat for the other choices, then add the groups."],
        ),
    }
    hint, steps = guidance[skill]
    return hint, [*steps, f"Answer: {final_answer}"]


def crop_supporting_figure(page, block_lines, block_top, block_bottom, english, output_path, preliminary):
    if not FIGURE_WORDS.search(english):
        return False
    option_top = min((line["top"] for line in block_lines if re.match(r"^A\.\s*", line["text"])), default=block_bottom)
    accented_lines = [
        line for line in block_lines
        if ACCENTED.search(line["text"])
        and line["top"] < option_top
        and line["top"] < block_bottom - 42
        and not re.match(r"^(?:KỲ THI|FERMAT|Email|TUYỂN TẬP|ĐĂNG KÝ)", line["text"])
    ]
    if preliminary:
        start = max((line["bottom"] for line in accented_lines), default=block_top + 25) + 2
        end = option_top - 3
        x0, x1 = 70, page.width - 35
        if end - start < 22 and re.search(r"right|table", english, re.I):
            start, end = block_top, block_bottom
            x0 = page.width * 0.48
    else:
        glossary_bottom = max((line["bottom"] for line in accented_lines), default=block_top + 28)
        start, end = glossary_bottom + 2, block_bottom - 2
        x0, x1 = 70, page.width - 35
        if end - start < 24 and re.search(r"right", english, re.I):
            start, end = block_top, block_bottom
            x0 = page.width * 0.55
    if end - start < 18:
        return False
    cropped = page.crop((x0, max(0, start), x1, min(page.height, end))).to_image(resolution=180).original.convert("RGB")
    grayscale = cropped.convert("L")
    dark_pixels = sum(1 for px in grayscale.getdata() if px < 220)
    if dark_pixels < 140:
        return False
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(output_path, quality=92, optimize=True)
    return True


def crop_continuation(page, top, bottom, output_path):
    if bottom - top < 20:
        return False
    cropped = page.crop((70, max(0, top), page.width - 35, min(page.height, bottom))).to_image(resolution=180).original.convert("RGB")
    grayscale = cropped.convert("L")
    dark_pixels = sum(1 for px in grayscale.getdata() if px < 220)
    if dark_pixels < 140:
        return False
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(output_path, quality=92, optimize=True)
    return True


def extract_blocks(pdf, start_page, end_page):
    starts = []
    page_lines = {}
    for page_number in range(start_page, end_page + 1):
        page = pdf.pages[page_number - 1]
        words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
        lines = grouped_lines(words)
        page_lines[page_number] = lines
        for word in words:
            if word["x0"] < 135 and QUESTION_NUMBER.fullmatch(word["text"]):
                starts.append({"number": int(word["text"][:-1]), "page": page_number, "top": word["top"]})
    starts.sort(key=lambda item: item["number"])
    if [item["number"] for item in starts] != list(range(1, 26)):
        raise RuntimeError(f"Could not identify all questions on pages {start_page}-{end_page}")
    blocks = []
    for index, start in enumerate(starts):
        page = pdf.pages[start["page"] - 1]
        next_start = starts[index + 1] if index + 1 < len(starts) else None
        next_on_page = next_start if next_start and next_start["page"] == start["page"] else None
        bottom = next_on_page["top"] - 4 if next_on_page else min(page.height - 92, 700)
        lines = [line for line in page_lines[start["page"]] if line["top"] >= start["top"] - 2 and line["top"] < bottom]
        bbox = (65, max(0, start["top"] - 2), page.width - 30, bottom)
        block_text = page.crop(bbox).extract_text(x_tolerance=2, y_tolerance=3) or ""
        continuations = []
        if next_start and next_start["page"] > start["page"]:
            for continuation_page in range(start["page"] + 1, next_start["page"] + 1):
                continuation_bottom = next_start["top"] - 4 if continuation_page == next_start["page"] else min(
                    pdf.pages[continuation_page - 1].height - 92,
                    700,
                )
                continuation_top = 42
                continuation_lines = [
                    line for line in page_lines[continuation_page]
                    if line["top"] >= continuation_top and line["top"] < continuation_bottom
                ]
                section_top = min(
                    (line["top"] for line in continuation_lines if any(line["text"].startswith(marker) for marker in SECTION_MARKERS)),
                    default=continuation_bottom,
                )
                continuation_bottom = min(continuation_bottom, section_top - 2)
                continuation_lines = [line for line in continuation_lines if line["top"] < continuation_bottom]
                continuation_text = pdf.pages[continuation_page - 1].crop(
                    (65, continuation_top, pdf.pages[continuation_page - 1].width - 30, continuation_bottom)
                ).extract_text(x_tolerance=2, y_tolerance=3) or ""
                block_text += "\n" + continuation_text
                continuations.append({
                    "page": continuation_page,
                    "top": continuation_top,
                    "bottom": continuation_bottom,
                    "lines": continuation_lines,
                })
        blocks.append({**start, "bottom": bottom, "lines": lines, "text": block_text, "continuations": continuations})
    return blocks


def build_question(page, paper_id, block, answer, preliminary):
    number = block["number"]
    english = parse_english(block["lines"], number, preliminary)
    options = parse_options(block["text"]) if preliminary else []
    shown_text = english
    if options:
        shown_text += "\n" + "\n".join(f"({letter}) {option}" for letter, option in zip("ABCD", options))
    elif preliminary:
        shown_text += "\n" + "\n".join(f"({letter}) See figure" for letter in "ABCD")
    accepted = [str(answer)]
    final_answer = str(answer)
    if preliminary:
        answer_index = "ABCD".index(answer)
        option_answer = options[answer_index] if len(options) == 4 else ""
        if option_answer:
            accepted.append(option_answer)
            final_answer = f"{answer}. {option_answer}"
    filename = f"{paper_id.lower()}-q{number:02}.png"
    output_path = ASSET_DIR / filename
    has_image = crop_supporting_figure(
        page,
        block["lines"],
        block["top"],
        block["bottom"],
        english,
        output_path,
        preliminary,
    )
    if not has_image and FIGURE_WORDS.search(english):
        for continuation in block.get("continuations", []):
            continuation_page = PDF_HANDLE.pages[continuation["page"] - 1]
            if crop_continuation(continuation_page, continuation["top"], continuation["bottom"], output_path):
                has_image = True
                break
    if not has_image and FIGURE_WORDS.search(english):
        has_image = crop_continuation(page, block["top"] + 32, block["bottom"] - 2, output_path)
    skill = skill_for(number)
    hint, steps = guidance_for(skill, final_answer)
    question = {
        "n": number,
        "skill": skill,
        "title": f"Question {number}",
        "en": shown_text,
        "vi": "",
        "answer": str(answer),
        "accepted": accepted,
        "unit": "",
        "hint": hint,
        "steps": steps,
    }
    if has_image:
        question["image"] = f"assets/timo/{filename}"
    return question


def main():
    global PDF_HANDLE
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    for old_crop in ASSET_DIR.glob("*.png"):
        old_crop.unlink()
    output = {}
    with pdfplumber.open(PDF_PATH) as pdf:
        PDF_HANDLE = pdf
        for paper_id, _name, start_page, end_page, answers in PAPERS:
            if len(answers) != 25:
                raise RuntimeError(f"{paper_id} answer key has {len(answers)} entries")
            blocks = extract_blocks(pdf, start_page, end_page)
            preliminary = paper_id.startswith("TIMO-P")
            output[paper_id] = [
                build_question(pdf.pages[block["page"] - 1], paper_id, block, answers[index], preliminary)
                for index, block in enumerate(blocks)
            ]
    payload = "window.questionsTimoRemaining = " + json.dumps(output, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(payload, encoding="utf-8", newline="\n")
    print(f"Generated {sum(len(items) for items in output.values())} questions across {len(output)} papers")
    print(f"Generated {len(list(ASSET_DIR.glob('*.png')))} supporting figure crops")


if __name__ == "__main__":
    main()
