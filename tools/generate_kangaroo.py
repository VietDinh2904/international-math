import json
import re
from pathlib import Path

import pdfplumber
from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "dist" / "assets" / "kangaroo"
FIGURE_ROOT = ASSET_ROOT / "figures"
OUT_JS = ROOT / "dist" / "kangaroo.js"

ANSWERS = {
    2023: list("DCCECACEEADADCBDDBBDBBDE"),
    2024: list("ECCCEBDDCABDABEDDAEDDCEE"),
    2025: list("EAAECB DAB CDBBCDECDBCB DAC".replace(" ", "")),
}

START_RE = re.compile(r"^(?:[1-9]|1\d|2[0-4])\.$")
OPTION_RE = re.compile(r"^\(([A-E])\)$")
HEADER_RE = re.compile(r"^(?:K.nguru|Level |Austria |Name:|[345] Points|. [345] Point Examples)", re.I)


def grouped_lines(words):
    rows = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        row = next((candidate for candidate in reversed(rows[-5:]) if abs(candidate["top"] - word["top"]) <= 2.8), None)
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


def clean_text(value):
    return re.sub(r"\s+", " ", value).strip()


def question_starts(pdf):
    starts = []
    for page_index, page in enumerate(pdf.pages):
        words = page.extract_words(extra_attrs=["fontname", "size"], use_text_flow=False)
        for word in words:
            if START_RE.fullmatch(word["text"]) and word["x0"] < 135:
                number = int(word["text"][:-1])
                starts.append({"number": number, "page": page_index, "top": word["top"]})
    unique = {}
    for item in sorted(starts, key=lambda item: (item["number"], item["page"], item["top"])):
        unique.setdefault(item["number"], item)
    result = [unique[number] for number in range(1, 25) if number in unique]
    if len(result) != 24:
        raise RuntimeError(f"Detected {len(result)} question starts: {starts}")
    return result


def block_for(pdf, starts, index, year):
    start = starts[index]
    page = pdf.pages[start["page"]]
    next_start = starts[index + 1] if index + 1 < len(starts) else None
    line_bottom = page.height - 28
    visual_bottom = page.height - 28
    if next_start and next_start["page"] == start["page"]:
        line_bottom = next_start["top"] - 5
        visual_bottom = next_start["top"] - (35 if year == 2025 and next_start["number"] == 2 else 18)
    first_on_page = index == 0 or starts[index - 1]["page"] != start["page"]
    needs_leading_figure = year == 2025 and start["number"] == 2
    visual_top = start["top"] - (35 if first_on_page or needs_leading_figure else 18)
    if start["number"] == 1:
        visual_top = start["top"] - 3
    words = [
        word for word in page.extract_words(extra_attrs=["fontname", "size"], use_text_flow=False)
        if start["top"] - 2 <= word["top"] < line_bottom
    ]
    return page, max(0, visual_top), max(start["top"] + 8, visual_bottom), grouped_lines(words)


def split_prompt_and_options(lines, number):
    option_tokens = []
    for row in lines:
        for word in row["words"]:
            match = OPTION_RE.fullmatch(word["text"])
            if match:
                option_tokens.append((match.group(1), word, row))

    first_option_top = min((word["top"] for _, word, _ in option_tokens), default=10_000)
    prompt_lines = []
    for row in lines:
        if row["top"] >= first_option_top:
            continue
        text = row["text"]
        if not prompt_lines:
            text = re.sub(rf"^{number}\.\s*", "", text)
        if HEADER_RE.match(text):
            continue
        prompt_lines.append(text)
    prompt = clean_text(" ".join(prompt_lines))

    options = []
    for letter in "ABCDE":
        current = next((item for item in option_tokens if item[0] == letter), None)
        if not current:
            options.append("See figure")
            continue
        _, word, row = current
        next_x = min((other[1]["x0"] for other in option_tokens if other[2] is row and other[1]["x0"] > word["x0"]), default=page_width(lines) + 1)
        content = [item["text"] for item in row["words"] if item["x0"] > word["x1"] and item["x0"] < next_x]
        value = clean_text(" ".join(content)).strip(".;")
        if value.lower() in {"and", "or"}:
            value = ""
        options.append(value if value else "See figure")
    return prompt, options, first_option_top


def page_width(lines):
    return max((row["x1"] for row in lines), default=595)


def visual_crop(page, top, bottom, lines, prompt, options, output_path):
    resolution = 190
    scale = resolution / 72
    crop = page.crop((24, max(0, top), page.width - 24, min(page.height, bottom)))
    image = crop.to_image(resolution=resolution, antialias=True).original.convert("RGB")
    draw = ImageDraw.Draw(image)
    first_option_top = min(
        (word["top"] for row in lines for word in row["words"] if OPTION_RE.fullmatch(word["text"])),
        default=10_000,
    )
    visual_options = sum(value == "See figure" for value in options) >= 3

    for row in lines:
        row_is_prompt = row["top"] < first_option_top
        row_has_option = any(OPTION_RE.fullmatch(word["text"]) for word in row["words"])
        row_words = sum(1 for word in row["words"] if re.search(r"[A-Za-z]{2,}", word["text"]))
        for word in row["words"]:
            erase = False
            if row_is_prompt and (row_words >= 2 or row["text"].rstrip().endswith(("?", ".", ":"))):
                erase = True
            elif row_has_option and not visual_options:
                erase = True
            elif row_has_option and visual_options and not OPTION_RE.fullmatch(word["text"]):
                # Keep the standard A-E labels and erase stray prose around visual choices.
                erase = bool(re.search(r"[A-Za-z]{2,}", word["text"]))
            if erase:
                x0 = int((word["x0"] - 24) * scale) - 2
                x1 = int((word["x1"] - 24) * scale) + 2
                y0 = int((word["top"] - top) * scale) - 2
                y1 = int((word["bottom"] - top) * scale) + 2
                draw.rectangle((x0, y0, x1, y1), fill="white")

    background = Image.new("RGB", image.size, "white")
    diff = ImageChops.difference(image, background).convert("L")
    diff = diff.point(lambda pixel: 255 if pixel > 22 else 0)
    bbox = diff.getbbox()
    if not bbox:
        return False
    left, upper, right, lower = bbox
    if (right - left) * (lower - upper) < 10_000:
        return False
    margin = 16
    bbox = (max(0, left - margin), max(0, upper - margin), min(image.width, right + margin), min(image.height, lower + margin))
    result = image.crop(bbox)
    if result.height < 45 or result.width < 90:
        return False
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path, quality=92, optimize=True)
    return True


def skill_for(number):
    if number <= 8:
        return "3-point challenge"
    if number <= 16:
        return "4-point challenge"
    return "5-point challenge"


def title_for(prompt):
    words = re.findall(r"[A-Za-z0-9'-]+", prompt)
    title = " ".join(words[:7])
    return title[:1].upper() + title[1:] if title else "Kangaroo challenge"


def guidance(answer, visual):
    if visual:
        return (
            "Look at one feature at a time, then cross out choices that do not match.",
            [
                "Study the given picture and identify the rule or condition.",
                "Compare choices A-E in order and eliminate any choice that breaks it.",
                f"The remaining choice is {answer}.",
            ],
        )
    return (
        "Write the important numbers or clues first, then test the choices.",
        [
            "Turn the information into a short number sentence or ordered list.",
            "Work carefully and compare the result with choices A-E.",
            f"The matching choice is {answer}.",
        ],
    )


def generate_year(year):
    pdf_path = ASSET_ROOT / f"kangaroo-ecolier-{year}.pdf"
    questions = []
    with pdfplumber.open(pdf_path) as pdf:
        starts = question_starts(pdf)
        for index, start in enumerate(starts):
            number = start["number"]
            page, top, bottom, lines = block_for(pdf, starts, index, year)
            prompt, options, _ = split_prompt_and_options(lines, number)
            if year == 2023 and number == 19:
                options = ["1", "2", "3", "4", "6"]
            if year == 2023 and number == 21:
                options = ["3", "4", "5", "6", "7"]
            visual = sum(value == "See figure" for value in options) >= 3
            image_path = FIGURE_ROOT / str(year) / f"q{number:02}.jpg"
            has_image = visual_crop(page, top, bottom, lines, prompt, options, image_path)
            option_text = " ".join(f"({letter}) {value}" for letter, value in zip("ABCDE", options))
            answer = ANSWERS[year][number - 1]
            hint, steps = guidance(answer, visual or has_image)
            accepted = [answer, f"option{answer.lower()}"]
            questions.append({
                "n": number,
                "skill": skill_for(number),
                "title": title_for(prompt),
                "en": clean_text(f"{prompt} {option_text}"),
                "vi": "",
                "answer": answer,
                "accepted": accepted,
                "unit": "",
                "hint": hint,
                "steps": steps,
                "image": f"assets/kangaroo/figures/{year}/q{number:02}.jpg" if has_image else None,
                "ready": True,
            })
    return questions


def main():
    data = {f"KANGAROO-{year}": generate_year(year) for year in (2025, 2024, 2023)}
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    OUT_JS.write_text(f"window.questionsKangaroo={payload};\n", encoding="utf-8")
    for key, questions in data.items():
        images = sum(bool(question["image"]) for question in questions)
        print(f"{key}: {len(questions)} questions, {images} figure crops")


if __name__ == "__main__":
    main()
