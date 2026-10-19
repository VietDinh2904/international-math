"""Extract the printed Daily Science activities and answer-key entries.

The Grade 4-6 books use the same six-page teaching-week layout. This script
keeps the wording from the student page, skips Day 5 review pages, and pairs
each activity group with the corresponding entry in the publisher answer key.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader


HEADING_RE = re.compile(
    r"B\s*i\s*g\s+I\s*d\s*e\s*a\s+(\d+)\s*:\s*W\s*e\s*e\s*k\s+(\d+)\s*[•·]\s*D\s*a\s*y\s+(\d+)",
    re.IGNORECASE,
)
GROUP_RE = re.compile(r"(?<!\w)([A-D])\s*\.\s+|(?<!\w)(TALK)\s*:\s*", re.IGNORECASE)


def clean_pdf_text(text: str) -> str:
    replacements = {
        "\u00ad": "",
        "/uni2752": "□",
        "\uf0a3": "□",
        "\uf0d8": "•",
        "’": "’",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def one_line(text: str) -> str:
    text = clean_pdf_text(text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:?])", r"\1", text)
    # PDF letter-spacing artifacts such as "B erlin" and "3 .".
    text = re.sub(r"\b(\d+)\s+\.", r"\1.", text)
    for word in (
        "true", "false", "the", "that", "are", "and", "can", "for", "read", "use",
        "water", "answers", "will", "vary", "rock", "mineral", "beavers", "berlin",
        "into", "electric", "electrical", "pulley", "beaver", "bacteria", "produce",
        "antibodies", "penicillin", "dams", "deep", "hiding", "place",
    ):
        def join_ocr_word(match: re.Match[str], expected: str = word) -> str:
            original = match.group(0)
            if not re.search(r"\s", original):
                return original
            return expected.capitalize() if original[0].isupper() else expected

        text = re.sub(
            r"\b" + r"\s*".join(map(re.escape, word)) + r"\b",
            join_ocr_word,
            text,
            flags=re.IGNORECASE,
        )
    return text.strip()


def student_body(page_text: str, *, grade: int, page_number: int) -> str:
    parts = re.split(r"Weekly Question", page_text, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) != 2:
        raise ValueError(f"Grade {grade} page {page_number}: Weekly Question not found")
    after_heading = parts[1]
    question_end = after_heading.find("?")
    if question_end < 0:
        raise ValueError(f"Grade {grade} page {page_number}: weekly question not found")
    raw_body = after_heading[question_end + 1 :]
    raw_body = re.sub(r"(?<=[A-Za-z0-9]) {2,}(?=[A-Za-z.])", " _____ ", raw_body)
    body = clean_pdf_text(raw_body)
    start = re.search(
        r"(?:^|\n|\s{2,})(?:A\s*\.\s+|1\s*\.\s+|Use (?:the|information)|Check the|Complete the|"
        r"Number the|List (?:three|two|four|five)|Fill in|Answer (?:the|each|these)|"
        r"Choose (?:the|a)|Match (?:the|each)|Circle (?:the|each)|Underline (?:the|each)|"
        r"Draw (?:a|an|the)|Write (?:a|an|the|your)|Label (?:the|each)|Look at|Read (?:the|each)|"
        r"Discuss (?:the|with)|This chart shows|The pictures? below|Using information|All the items)",
        body,
        flags=re.IGNORECASE,
    )
    if not start:
        raise ValueError(f"Grade {grade} page {page_number}: activity not found")
    activity = body[start.start() :]
    activity = re.split(r"\sV\s*o\s*c\s*a\s*b\s*u\s*l\s*a\s*r\s*y\b", activity, maxsplit=1)[0]
    activity = re.split(
        r"\n(?:Vocabulary\b|WEEK\s+\d+|Idea\s+\d+|Big Idea\s+\d+|© Evan-Moor|Name\s+_{2,}|\d{4}\.indb)",
        activity,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]
    return clean_pdf_text(activity)


def split_groups(text: str) -> list[dict[str, str]]:
    talk_prompt = ""
    flattened = one_line(text)
    talk = re.search(r"(?:^|(?<=[.!]))\s*((?:[^.!?]*\?\s*)+)Talk\s*$", flattened, re.IGNORECASE)
    if talk:
        talk_prompt = talk.group(1).strip()
        text = flattened[: talk.start()].strip()
    matches = list(GROUP_RE.finditer(text))
    if not matches:
        prompt = one_line(text)
        groups = [{"label": "Questions", "prompt": prompt}] if prompt else []
        if talk_prompt:
            groups.append({"label": "TALK", "prompt": talk_prompt})
        return groups
    prefix = one_line(text[: matches[0].start()])
    groups: list[dict[str, str]] = []
    for index, match in enumerate(matches):
        label = (match.group(1) or match.group(2) or "Questions").upper()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        prompt = one_line(text[match.end() : end])
        if index == 0 and prefix:
            prompt = f"{prefix} {prompt}".strip()
        if prompt:
            groups.append({"label": label, "prompt": prompt})
    if talk_prompt:
        groups.append({"label": "TALK", "prompt": talk_prompt})
    return groups


def answer_entries(reader: PdfReader) -> dict[tuple[int, int, int], str]:
    # Answer keys are at the end of each volume. Limiting extraction to the
    # final pages avoids re-reading all 180 student pages a second time.
    first_candidate = max(0, len(reader.pages) - 32)
    pages = [page.extract_text() or "" for page in reader.pages[first_candidate:]]
    answer_start = next(
        (index for index, text in enumerate(pages) if re.search(r"\bAnswer Key\b", text)),
        None,
    )
    if answer_start is None:
        raise ValueError("Answer Key not found")
    text = "\n".join(pages[answer_start:])
    matches = list(HEADING_RE.finditer(text))
    entries: dict[tuple[int, int, int], str] = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[match.end() : end]
        # Some answer-key pages place a reduced copy of the student page in the
        # text layer between two answer fragments. Remove that copied page while
        # retaining labels printed after it as the diagram answer.
        body = re.sub(
            r"Daily Science\s+Day\s+\d+\s+Weekly Question.*?Name\s+_{2,}",
            "",
            body,
            flags=re.IGNORECASE | re.DOTALL,
        )
        body = re.sub(r"\n?\d{4}AK\.indd[^\n]*", "", body, flags=re.IGNORECASE)
        body = re.sub(r"\n?\d+\s+Daily Science[^\n]*", "", body, flags=re.IGNORECASE)
        body = re.sub(r"\n?© Evan-Moor[^\n]*", "", body, flags=re.IGNORECASE)
        entries[tuple(map(int, match.groups()))] = clean_pdf_text(body)
    return entries


def pair_answers(groups: list[dict[str, str]], answer_text: str) -> list[dict[str, str]]:
    answers = split_groups(answer_text)
    by_label = {item["label"]: item["prompt"] for item in answers}
    whole_answer = one_line(answer_text)
    paired: list[dict[str, str]] = []
    for index, group in enumerate(groups):
        answer = by_label.get(group["label"], "")
        if not answer and len(groups) == 1:
            answer = whole_answer
        if not answer and len(answers) == len(groups) and all(item["label"] == "Questions" for item in answers):
            answer = answers[index]["prompt"]
        if not answer:
            answer = (
                "The PDF answer key presents this answer as a diagram or has no selectable text. "
                "Compare your work with the answer-key page in the book."
            )
        paired.append({**group, "answer": answer})
    return paired


def extract_grade(grade: int, pdf_path: Path) -> dict[str, dict[str, object]]:
    reader = PdfReader(str(pdf_path))
    answer_map = answer_entries(reader)
    result: dict[str, dict[str, object]] = {}
    errors: list[str] = []
    for big_idea in range(1, 7):
        unit_start = 8 + (big_idea - 1) * 30
        for book_week in range(1, 5):
            curriculum_week = (big_idea - 1) * 4 + book_week
            teacher_page = unit_start + (book_week - 1) * 6
            week = result.setdefault(str(curriculum_week), {})
            for day in range(1, 5):
                printed_page = teacher_page + day
                page_text = reader.pages[printed_page - 1].extract_text() or ""
                try:
                    groups = split_groups(student_body(page_text, grade=grade, page_number=printed_page))
                except ValueError as error:
                    errors.append(str(error))
                    continue
                if not groups:
                    raise ValueError(f"Grade {grade} page {printed_page}: no question groups")
                answer_key = (big_idea, book_week, day)
                if answer_key not in answer_map:
                    # A few diagram-heavy pages have no usable text layer in
                    # the answer key. The printed question is still retained;
                    # the interface will direct the learner back to the book.
                    answers = ""
                else:
                    answers = answer_map[answer_key]
                week[str(day)] = {
                    "page": printed_page,
                    "groups": pair_answers(groups, answers),
                }
    if errors:
        raise ValueError("\n".join(errors))
    return result


def write_javascript(data: dict[str, object], output: Path) -> None:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    source = f'''(()=>{{
  "use strict";
  const questions={payload};
  const weeks=window.ScienceDiscovery?.weeks||window.ScienceExpansion?.weeks;
  if(!weeks)return;
  Object.values(weeks).forEach(week=>{{
    const source=week?.source;
    const grade=Number(source?.grade),bigIdea=Number(source?.bigIdea),bookWeek=Number(source?.bookWeek);
    if(!source||!Number.isInteger(grade)||grade<4||grade>6||source.review)return;
    const curriculumWeek=(bigIdea-1)*4+bookWeek;
    for(let dayNumber=1;dayNumber<=4;dayNumber+=1){{
      const day=week.days?.[dayNumber],entry=questions[String(grade)]?.[String(curriculumWeek)]?.[String(dayNumber)];
      if(!day||!entry)continue;
      day.bookQuestionGroups=entry.groups;
      day.bookQuestionPage=entry.page;
    }}
  }});
  window.ScienceBookQuestions=questions;
}})();
'''
    output.write_text(source, encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--grade4", type=Path, required=True)
    parser.add_argument("--grade5", type=Path, required=True)
    parser.add_argument("--grade6", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    data: dict[str, object] = {}
    for grade, path in ((4, args.grade4), (5, args.grade5), (6, args.grade6)):
        data[str(grade)] = extract_grade(grade, path)
    count = sum(len(days) for weeks in data.values() for days in weeks.values())
    groups = sum(len(day["groups"]) for weeks in data.values() for days in weeks.values() for day in days.values())
    if count != 288:
        raise ValueError(f"Expected 288 day entries, extracted {count}")
    write_javascript(data, args.output)
    print(f"Extracted {groups} printed question groups across {count} reading days")


if __name__ == "__main__":
    main()
