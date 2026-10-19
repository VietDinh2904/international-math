"""Extract the exact Day 1-4 reading passages from Daily Science Grades 4-6.

The books share the same pagination: each Big Idea starts 30 pages after the
previous one, and each teaching week occupies six pages (teacher page plus
Days 1-5). Unit Review weeks are intentionally skipped.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader


def normalize(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_reading(page_text: str, *, grade: int, page_number: int) -> str:
    parts = re.split(r"Weekly Question", page_text, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) != 2:
        raise ValueError(f"Grade {grade} page {page_number}: Weekly Question not found")

    # Every weekly title in these books is a question. The reading starts
    # immediately after that title and ends when the first student activity
    # begins (A. or 1.).
    after_heading = parts[1]
    question_end = after_heading.find("?")
    if question_end < 0:
        raise ValueError(f"Grade {grade} page {page_number}: question title not found")
    body = after_heading[question_end + 1 :]
    activity = re.search(
        r"\s(?:"
        r"A\.|1\."
        r"|Use (?:the|information)"
        r"|Check the"
        r"|Complete the"
        r"|Number the"
        r"|List (?:three|two|four|five)"
        r"|Fill in"
        r"|Answer (?:the|each|these)"
        r"|Choose (?:the|a)"
        r"|Match (?:the|each)"
        r"|Circle (?:the|each)"
        r"|Underline (?:the|each)"
        r"|Draw (?:a|an|the)"
        r"|Write (?:a|an|the|your)"
        r"|Label (?:the|each)"
        r"|Look at"
        r"|Read (?:the|each)"
        r"|Discuss (?:the|with)"
        r"|Vocabulary\b"
        r"|This chart shows"
        r"|Periodic Table of the Elements"
        r")",
        body,
    )
    if activity:
        body = body[: activity.start()]
    body = re.split(r"\sWEEK\s+\d", body, maxsplit=1, flags=re.IGNORECASE)[0]
    reading = normalize(body)
    if len(reading.split()) < 18:
        raise ValueError(
            f"Grade {grade} page {page_number}: extracted reading is too short: {reading!r}"
        )
    return reading


def extract_grade(grade: int, pdf_path: Path) -> dict[str, dict[str, dict[str, object]]]:
    reader = PdfReader(str(pdf_path))
    readings: dict[str, dict[str, dict[str, object]]] = {}
    for big_idea in range(1, 7):
        unit_start = 8 + (big_idea - 1) * 30
        for week in range(1, 5):
            teacher_page = unit_start + (week - 1) * 6
            curriculum_week = (big_idea - 1) * 4 + week
            week_readings = readings.setdefault(str(curriculum_week), {})
            for day in range(1, 5):
                printed_page = teacher_page + day
                page_text = reader.pages[printed_page - 1].extract_text() or ""
                week_readings[str(day)] = {
                    "page": printed_page,
                    "text": extract_reading(
                        page_text, grade=grade, page_number=printed_page
                    ),
                }
    return readings


def write_javascript(
    readings: dict[str, dict[str, dict[str, dict[str, object]]]], output: Path
) -> None:
    payload = json.dumps(readings, ensure_ascii=False, separators=(",", ":"))
    source = f'''(()=>{{
  "use strict";
  const readings={payload};
  const weeks=window.ScienceDiscovery?.weeks||window.ScienceExpansion?.weeks;
  if(!weeks)return;
  Object.values(weeks).forEach(week=>{{
    const source=week?.source;
    const grade=Number(source?.grade),bigIdea=Number(source?.bigIdea),bookWeek=Number(source?.bookWeek);
    if(!source||!Number.isInteger(grade)||grade<4||grade>6||source.review)return;
    const curriculumWeek=(bigIdea-1)*4+bookWeek;
    source.curriculumWeek=curriculumWeek;
    for(let dayNumber=1;dayNumber<=4;dayNumber+=1){{
      const day=week.days?.[dayNumber],entry=readings[String(grade)]?.[String(curriculumWeek)]?.[String(dayNumber)];
      if(!day||!entry)continue;
      day.story=entry.text;
      day.title=week.title;
      day.short=`Day ${{dayNumber}}`;
      day.guideLine="";
      day.bookPage=entry.page;
      (day.words||[]).forEach(word=>{{word.example=""}});
    }}
  }});
  window.ScienceBookReadings=readings;
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

    readings: dict[str, dict[str, dict[str, dict[str, object]]]] = {}
    for grade, pdf_path in ((4, args.grade4), (5, args.grade5), (6, args.grade6)):
        readings[str(grade)] = extract_grade(grade, pdf_path)
    count = sum(
        len(days)
        for grade_readings in readings.values()
        for days in grade_readings.values()
    )
    if count != 288:
        raise ValueError(f"Expected 288 readings, extracted {count}")
    write_javascript(readings, args.output)
    print(f"Extracted {count} book readings to {args.output}")


if __name__ == "__main__":
    main()
