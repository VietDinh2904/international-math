import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "dist" / "timo-remaining.js"
PREFIX = "window.questionsTimoRemaining = "


SOLUTIONS = {
    ("TIMO-P2", 1): ["Tomorrow is Monday, so today is Sunday.", "123 ÷ 7 leaves remainder 4, so move back 4 days from Sunday.", "Sunday → Saturday → Friday → Thursday → Wednesday."],
    ("TIMO-P2", 2): ["Read the two alternating letter patterns separately.", "Capital letters: C, D, E, F, G. Lower-case letters: m, n, o, p, so the next lower-case letter is q."],
    ("TIMO-P2", 3): ["Write each term as two consecutive numbers multiplied together.", "12 = 3 × 4, 20 = 4 × 5, 30 = 5 × 6, 42 = 6 × 7, 56 = 7 × 8.", "The next term is 8 × 9 = 72."],
    ("TIMO-P2", 4): ["Count the marked symbols in Groups 1–4 and write the totals in order.", "Continue the same increase to Group 5. The total is 12."],
    ("TIMO-P2", 5): ["Compare the completed rows and columns in the table.", "Apply the same operation to the row containing the blank. The missing number is 4."],
    ("TIMO-P3", 1): ["From the 4th term onward, each number is the sum of the previous three numbers.", "1 + 2 + 3 = 6; 2 + 3 + 6 = 11; 3 + 6 + 11 = 20.", "Next: 6 + 11 + 20 = 37."],
    ("TIMO-P3", 2): ["Yesterday was Tuesday, so today is Wednesday.", "124 ÷ 7 leaves remainder 5, so move forward 5 days.", "Wednesday → Thursday → Friday → Saturday → Sunday → Monday."],
    ("TIMO-P3", 3): ["Sammy's age in 3 years equals Joseph's age 6 years ago.", "Sammy + 3 = Joseph - 6, so Joseph is 9 years older.", "When Joseph is 18, Sammy is 18 - 9 = 9."],
    ("TIMO-P3", 4): ["15 trees make 14 equal gaps, not 15 gaps.", "14 × 25 m = 350 m."],
    ("TIMO-P3", 5): ["Count the symbols in the first groups and record how many new symbols are added each time.", "Extend that increase to Group 9. The count is 65."],
    ("TIMO-P4", 1): ["Each new term equals the previous two terms plus 1.", "1 + 1 + 1 = 3; 1 + 3 + 1 = 5; 3 + 5 + 1 = 9; 5 + 9 + 1 = 15.", "Next: 9 + 15 + 1 = 25."],
    ("TIMO-P4", 2): ["Yesterday was Thursday, so today is Friday.", "87 ÷ 7 leaves remainder 3, so move forward 3 days.", "Friday → Saturday → Sunday → Monday."],
    ("TIMO-P4", 3): ["Alice in 11 years equals Peter in 5 years.", "Alice + 11 = Peter + 5, so Peter is 6 years older.", "When Alice is 18, Peter is 18 + 6 = 24."],
    ("TIMO-P4", 4): ["Alice is 18th from the front in a line of 37.", "Students behind Alice = 37 - 18 = 19."],
    ("TIMO-P4", 5): ["Count the first groups and compare how many new objects are added each time.", "Continue the same growth to Group 6. The total is 72."],
    ("TIMO-P5", 1): ["The difference is always 6.", "1, 7, 13, 19, 25, 31, so the next number is 31 + 6 = 37."],
    ("TIMO-P5", 2): ["Tomorrow is Friday, so today is Thursday.", "20 ÷ 7 leaves remainder 6, so move forward 6 days from Thursday.", "Thursday → Friday → Saturday → Sunday → Monday → Tuesday → Wednesday."],
    ("TIMO-P5", 3): ["Sammy 5 years ago equals Joseph 9 years ago.", "Sammy - 5 = Joseph - 9, so Sammy is 4 years younger.", "When Joseph is 23, Sammy is 23 - 4 = 19."],
    ("TIMO-P5", 4): ["10 trees make 9 equal gaps.", "9 × 12 m = 108 m."],
    ("TIMO-P5", 5): ["Find the repeating cycle of the group labels, then divide 115 by the cycle length.", "Use the remainder to locate Group 115 in the cycle. It matches 1."],
    ("TIMO-H1", 1): ["Look at the differences: -3, -5, -7, -9.", "The subtracted odd numbers increase by 2, so subtract 11 next.", "14 - 11 = 3."],
    ("TIMO-H1", 2): ["Match the front, side and top views one layer at a time.", "Place the minimum marbles needed for every visible black square, without counting the same marble twice.", "The three views are satisfied by 7 marbles."],
    ("TIMO-H1", 3): ["25 ÷ 7 leaves remainder 4.", "Move back 4 days from Wednesday: Tuesday, Monday, Sunday, Saturday."],
    ("TIMO-H1", 4): ["Compare the completed parts of the table and identify the repeated row rule.", "Apply that same rule to the row with the question mark. The missing value is 110."],
    ("TIMO-H1", 5): ["Count the # symbols in the shown groups and record the increase between groups.", "Continue the same increase to Group 7. The total is 40."],
    ("TIMO-H2", 1): ["Alice is 37th from the front among 62 students.", "Students behind her = 62 - 37 = 25."],
    ("TIMO-H2", 2): ["The increases are +14, +15 and +16.", "Increase by 17 next: 52 + 17 = 69."],
    ("TIMO-H2", 3): ["15 ÷ 7 leaves remainder 1.", "Move back 1 day from Friday to Thursday."],
    ("TIMO-H2", 4): ["Bruce 9 years ago equals Peter 3 years later.", "Bruce - 9 = Peter + 3, so Peter = Bruce - 12.", "Peter = 18 - 12 = 6."],
    ("TIMO-H2", 5): ["Count the symbols in Groups 1–4 and write the total for each group.", "Continue the same growth rule to Group 8. The total is 113."],
    ("TIMO-H3", 1): ["Every month has a 28th day.", "There are 12 months, so the answer is 12."],
    ("TIMO-H3", 2): ["Separate the symbols into the repeating groups shown in the diagram.", "Count the circles in complete groups first, then count the circles in the remaining symbols.", "The total number of circles is 79."],
    ("TIMO-H3", 3): ["Samuel 4 years ago equals Joseph 5 years ago.", "Samuel - 4 = Joseph - 5, so Joseph is 1 year older.", "Joseph is 23 + 1 = 24."],
    ("TIMO-H3", 4): ["Count the days from 14 October to 29 December: 17 + 30 + 29 = 76 days.", "76 ÷ 7 leaves remainder 6.", "Six days after Sunday is Saturday."],
    ("TIMO-H3", 5): ["101 ÷ 7 leaves remainder 3.", "Move back 3 days from Saturday: Friday, Thursday, Wednesday."],
    ("TIMO-H4", 1): ["Compare the completed rows of the table to find the operation used each time.", "Use the same operation on the row containing the question mark. The value is 125."],
    ("TIMO-H4", 2): ["Break the symbol string into the growing groups shown in the question.", "Count circles in the complete groups, then add the circles in the final partial group.", "The total is 55."],
    ("TIMO-H4", 3): ["Write the age clue as an equation and keep the same age difference over time.", "Substitute Samuel's current age of 12. Joseph is 22."],
    ("TIMO-H4", 4): ["Use 189: one digit is correct and in the correct place.", "Use 172: one digit is correct but in the wrong place. Use 975 to fix one more correct position.", "Test the remaining arrangement with three different digits: 285 satisfies all clues."],
    ("TIMO-H4", 5): ["Count the symbols in the first shown groups and find how the increase changes.", "Continue the rule to Group 10. The total is 105."],
    ("TIMO-H5", 1): ["The soldier is younger than both Amy and Peter.", "The student is also younger than Amy. Match the three people to the three different jobs without repeating a job.", "The only consistent person left for merchant is Amy."],
    ("TIMO-H5", 2): ["Separate the symbols into the repeating or growing blocks shown.", "Count the circles in complete blocks, then include the partial last block up to symbol 103.", "There are 69 circles."],
    ("TIMO-H5", 3): ["Test each possible colour against the three statements.", "If the shoes are blue: Peter is true, John is true and Andy is false.", "Exactly one person is wrong, so the shoes are blue."],
    ("TIMO-H5", 4): ["From 782, the digits are 7, 8 and 2, but all are in the wrong positions.", "Use 178 to place two of those digits in new positions, then use 123 to check the one correct position.", "827 satisfies all three clues."],
    ("TIMO-H5", 5): ["The groups form triangular totals: 1, 1 + 2, 1 + 2 + 3, and so on.", "Group 20 has 1 + 2 + … + 20 = 20 × 21 ÷ 2 = 210 circles."],
}


def option_summary(question):
    options = re.findall(r"\(([A-E])\)\s*([^\n]+)", question["en"])
    if not options:
        return None
    return "Possible answers: " + "; ".join(f"{letter}. {value.strip()}" for letter, value in options)


def main():
    raw = DATA_PATH.read_text(encoding="utf-8")
    payload = raw.split("=", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    data = json.loads(payload)
    changed = 0
    for paper, questions in data.items():
        for question in questions:
            normalized = re.sub(r"\s*、\s*", ", ", question["en"])
            if normalized != question["en"]:
                question["en"] = normalized
                changed += 1
            key = (paper, question["n"])
            if key not in SOLUTIONS:
                continue
            summary = option_summary(question)
            steps = list(SOLUTIONS[key])
            if summary:
                steps.append(summary)
            answer_value = question.get("accepted", [question["answer"]])[-1]
            if str(answer_value).lower().startswith("option"):
                answer_value = question["answer"]
            steps.append(f"Answer: {question['answer']}. {answer_value}" if re.fullmatch(r"[A-E]", str(question["answer"])) else f"Answer: {question['answer']}")
            question["hint"] = steps[0]
            question["steps"] = steps
            if re.search(r"number in the blank|pattern shown below, what is the number", question["en"], re.I):
                question.pop("image", None)
            changed += 1
    DATA_PATH.write_text(PREFIX + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Updated {changed} TIMO fields")


if __name__ == "__main__":
    main()
