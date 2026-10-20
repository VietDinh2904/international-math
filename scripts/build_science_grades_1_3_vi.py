"""Build the bilingual Grade 1-3 Daily Science catalogue from the supplied PDFs.

The source passages and activities are extracted from the user-provided books.
Vietnamese is stored next to the English text so the site can switch languages
without altering the book wording. Unit-review weeks and Day 5 are omitted.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


reading_tools = load_module("science_reading_tools", ROOT / "scripts" / "extract_science_book_readings.py")
question_tools = load_module("science_question_tools", ROOT / "scripts" / "extract_science_book_questions.py")


def normalize(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:?])", r"\1", text)
    return text.strip()


def weekly_title(page_text: str) -> str:
    after = re.split(r"Weekly Question", page_text, maxsplit=1, flags=re.IGNORECASE)[1]
    end = after.find("?")
    return normalize(after[: end + 1])


def reading_text(page_text: str, grade: int, page: int) -> str:
    try:
        value = reading_tools.extract_reading(page_text, grade=grade, page_number=page)
    except ValueError as error:
        match = re.search(r"extracted reading is too short: '(.+)'", str(error))
        if not match:
            raise
        value = match.group(1)
    return re.sub(r"\s+[a-z]\s*$", "", normalize(value)).strip()


def teacher_vocabulary(teacher_text: str) -> dict[int, list[str]]:
    labels = {"One": 1, "Two": 2, "Three": 3, "Four": 4}
    matches = list(re.finditer(r"Day\s+(One|Two|Three|Four|Five)\b", teacher_text, re.IGNORECASE))
    result: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: []}
    for index, match in enumerate(matches):
        label = match.group(1).capitalize()
        if label not in labels:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(teacher_text)
        block = teacher_text[match.end() : end]
        vocab = re.search(
            r"Vocabulary\s*:\s*(.*?)(?:\n\s*(?:Materials|Distribute|Tell|Hold|Ask|Show|Have|Read|Point|Invite)\b)",
            block,
            re.IGNORECASE | re.DOTALL,
        )
        if not vocab:
            continue
        terms = normalize(vocab.group(1)).replace(" and ", ", ")
        result[labels[label]] = [item.strip() for item in terms.split(",") if item.strip()]
    return result


def vocabulary_with_definitions(page_text: str, terms: list[str]) -> list[dict[str, str]]:
    if not terms:
        return []
    parts = re.split(r"\bVocabulary\b", page_text, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) != 2:
        return [{"en": term, "meaning": "science vocabulary from the book"} for term in terms]
    block = re.split(r"\b(?:WEEK|Idea|Big Idea)\s+\d+", parts[1], maxsplit=1, flags=re.IGNORECASE)[0]
    block = normalize(block)
    starts: list[tuple[int, str]] = []
    cursor = 0
    for term in terms:
        match = re.search(rf"\b{re.escape(term)}\b", block[cursor:], re.IGNORECASE)
        if not match:
            starts.append((-1, term))
            continue
        position = cursor + match.start()
        starts.append((position, term))
        cursor = cursor + match.end()
    words: list[dict[str, str]] = []
    for index, (start, term) in enumerate(starts):
        if start < 0:
            meaning = "science vocabulary from the book"
        else:
            definition_start = start + len(term)
            next_positions = [position for position, _ in starts[index + 1 :] if position >= 0]
            definition_end = next_positions[0] if next_positions else len(block)
            meaning = normalize(block[definition_start:definition_end]).strip(" -–—")
        words.append({"en": term, "meaning": meaning or "science vocabulary from the book"})
    return words


def fallback_activity(page_text: str) -> str:
    after = re.split(r"Weekly Question", page_text, maxsplit=1, flags=re.IGNORECASE)[1]
    question_end = after.find("?")
    body = after[question_end + 1 :]
    match = re.search(r"(?:^|\n)\s*(?:[A-D]\s*\.\s+|1\s*\.\s+)", body)
    if not match:
        return ""
    activity = body[match.start() :]
    activity = re.split(r"\bVocabulary\b", activity, maxsplit=1, flags=re.IGNORECASE)[0]
    return question_tools.clean_pdf_text(activity)


def activity_groups(page_text: str, grade: int, page: int) -> list[dict[str, str]]:
    try:
        body = question_tools.student_body(page_text, grade=grade, page_number=page)
    except ValueError:
        body = fallback_activity(page_text)
    groups = question_tools.split_groups(body) if body else []
    return groups or [{"label": "Questions", "prompt": "Review the activity on this page in the book."}]


def grade1_answers(reader: PdfReader) -> dict[int, str]:
    text = "\n".join((page.extract_text() or "") for page in reader.pages[-8:])
    matches = list(re.finditer(r"\bPage\s+(\d+)\b", text, re.IGNORECASE))
    result: dict[int, str] = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[int(match.group(1))] = normalize(text[match.end() : end])
    return result


def google_translate(text: str) -> str:
    if not text.strip():
        return ""
    query = urllib.parse.quote(text)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q={query}"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            return normalize("".join(part[0] for part in payload[0] if part and part[0]))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1.5 * (attempt + 1))
    return text


def translate_records(records: list[dict], cache_path: Path) -> None:
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
    targets: dict[str, tuple[dict, str]] = {}
    for record in records:
        for key in ("title", "story", "prompt", "answer", "term", "meaning"):
            value = str(record.get(key, "")).strip()
            if not value:
                continue
            digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
            if digest in cache:
                record[f"vi_{key}"] = cache[digest]
            else:
                targets.setdefault(digest, (record, key))
    print(f"Translating {len(targets)} new strings ({len(cache)} cached)", flush=True)
    items = list(targets.items())
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(google_translate, record[key]): (digest, record, key) for digest, (record, key) in items}
        for number, future in enumerate(concurrent.futures.as_completed(futures), 1):
            digest, record, key = futures[future]
            translated = future.result()
            cache[digest] = translated
            record[f"vi_{key}"] = translated
            if number % 50 == 0 or number == len(futures):
                print(f"Translated {number}/{len(futures)}", flush=True)
                cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    # Populate every duplicate occurrence, not only the first record that
    # scheduled a translation request for a given source string.
    for record in records:
        for key in ("title", "story", "prompt", "answer", "term", "meaning"):
            value = str(record.get(key, "")).strip()
            if value:
                record[f"vi_{key}"] = cache[hashlib.sha256(value.encode("utf-8")).hexdigest()]


def build_grade(grade: int, path: Path) -> dict[str, dict]:
    reader = PdfReader(str(path))
    answer_map = grade1_answers(reader) if grade == 1 else {}
    heading_answers = {}
    if grade > 1:
        try:
            heading_answers = question_tools.answer_entries(reader)
        except ValueError:
            heading_answers = {}
    result: dict[str, dict] = {}
    for big_idea in range(1, 7):
        unit_start = 8 + (big_idea - 1) * 30
        for book_week in range(1, 5):
            curriculum_week = (big_idea - 1) * 4 + book_week
            teacher_page = unit_start + (book_week - 1) * 6
            teacher_text = reader.pages[teacher_page - 1].extract_text() or ""
            terms_by_day = teacher_vocabulary(teacher_text)
            days = []
            title = ""
            for day in range(1, 5):
                printed_page = teacher_page + day
                page_text = reader.pages[printed_page - 1].extract_text() or ""
                title = title or weekly_title(page_text)
                groups = activity_groups(page_text, grade, printed_page)
                raw_answer = answer_map.get(printed_page, "")
                heading_answer = heading_answers.get((big_idea, book_week, day), "")
                paired = question_tools.pair_answers(groups, heading_answer) if heading_answer else [
                    {**group, "answer": raw_answer or "The printed answer is in the book answer key."} for group in groups
                ]
                days.append({
                    "day": day,
                    "page": printed_page,
                    "story": reading_text(page_text, grade, printed_page),
                    "words": vocabulary_with_definitions(page_text, terms_by_day.get(day, [])),
                    "questions": paired,
                })
            result[str(curriculum_week)] = {
                "grade": grade,
                "bigIdea": big_idea,
                "bookWeek": book_week,
                "title": title,
                "teacherPage": teacher_page,
                "days": days,
            }
    return result


def add_translations(data: dict[str, dict], cache_path: Path) -> None:
    records: list[dict] = []
    for grade_data in data.values():
        for week in grade_data.values():
            week_record = {"title": week["title"]}
            records.append(week_record)
            week["_translation"] = week_record
            for day in week["days"]:
                day_record = {"story": day["story"]}
                records.append(day_record)
                day["_translation"] = day_record
                for word in day["words"]:
                    record = {"term": word["en"], "meaning": word["meaning"]}
                    records.append(record)
                    word["_translation"] = record
                for question in day["questions"]:
                    record = {"prompt": question["prompt"], "answer": question["answer"]}
                    records.append(record)
                    question["_translation"] = record
    translate_records(records, cache_path)
    for grade_data in data.values():
        for week in grade_data.values():
            week["viTitle"] = week.pop("_translation")["vi_title"]
            for day in week["days"]:
                day["vi"] = day.pop("_translation")["vi_story"]
                for word in day["words"]:
                    translated = word.pop("_translation")
                    word["vi"] = translated["vi_term"]
                    word["meaningVi"] = translated["vi_meaning"]
                for question in day["questions"]:
                    translated = question.pop("_translation")
                    question["viPrompt"] = translated["vi_prompt"]
                    question["viAnswer"] = translated["vi_answer"]


def write_javascript(data: dict[str, dict], output: Path) -> None:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    source = f'''(()=>{{
  "use strict";
  const source={payload};
  const art=[
    "assets/watercolor-backgrounds/watercolor-microscope-tree-v1.webp",
    "assets/watercolor-backgrounds/watercolor-botany-study-v1.webp",
    "assets/watercolor-backgrounds/watercolor-floral-lab-v1.webp",
    "assets/watercolor-backgrounds/watercolor-seasonal-botany-v1.webp",
    "assets/watercolor-backgrounds/watercolor-science-library-v1.webp"
  ];
  const weeks={{}};
  Object.values(source).forEach(gradeData=>Object.values(gradeData).forEach(entry=>{{
    const curriculumWeek=(Number(entry.bigIdea)-1)*4+Number(entry.bookWeek),number=1000+entry.grade*100+curriculumWeek;
    const hero=`assets/science-primary-weeks/g${{entry.grade}}-w${{String(curriculumWeek).padStart(2,"0")}}-v1.webp`;
    const days=[null,...entry.days.map(day=>({{
      day:day.day,title:`Day ${{day.day}}`,viTitle:`Ngày ${{day.day}}`,short:day.words[0]?.en||`Book Day ${{day.day}}`,viShort:day.words[0]?.vi||`Bài ${{day.day}}`,story:day.story,vi:day.vi,
      image:hero,words:day.words.map(word=>({{en:word.en,vi:word.vi,meaning:word.meaning,meaningVi:word.meaningVi,pos:"science term"}})),
      bookPage:day.page,bookQuestionPage:day.page,bookQuestionGroups:day.questions
    }}))];
    weeks[number]={{number,title:entry.title,viTitle:entry.viTitle,subtitle:`Grade ${{entry.grade}} · Big Idea ${{entry.bigIdea}} · Week ${{entry.bookWeek}}`,guide:"Daily Science",hero,days,source:{{grade:entry.grade,bigIdea:entry.bigIdea,bookWeek:entry.bookWeek,curriculumWeek:(entry.bigIdea-1)*4+entry.bookWeek,pages:`${{entry.teacherPage}}–${{entry.teacherPage+5}}`,review:false,language:"bilingual"}},overview:days.slice(1).map(day=>day.short)}};
  }}));
  window.SciencePrimary={{weeks,source}};
}})();
'''
    output.write_text(source, encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    for grade in range(1, 4):
        parser.add_argument(f"--grade{grade}", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--cache", type=Path, default=ROOT / "scripts" / ".science-primary-vi-cache.json")
    args = parser.parse_args()
    data = {str(grade): build_grade(grade, getattr(args, f"grade{grade}")) for grade in range(1, 4)}
    add_translations(data, args.cache)
    write_javascript(data, args.output)
    count = sum(len(week["days"]) for grade in data.values() for week in grade.values())
    print(f"Wrote {count} bilingual reading days to {args.output}")


if __name__ == "__main__":
    main()
