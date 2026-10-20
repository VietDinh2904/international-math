global.window = {};
global.document = {
  body: { classList: { add() {}, remove() {} } },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
};
global.MutationObserver = class { observe() {} };

for (const file of [
  "science-expansion.js",
  "science-books.js",
  "science-full-curriculum.js",
  "science-discovery.js",
]) {
  require(`../dist/${file}`);
}

const curriculumWeek = (week) =>
  Number(week.source?.curriculumWeek)
  || ((Number(week.source?.bigIdea) - 1) * 4 + Number(week.source?.bookWeek));

const weeks = Object.values(window.ScienceDiscovery?.weeks || {})
  .filter((week) => week.source?.grade && week.source?.bookWeek && !week.source?.review)
  .sort((a, b) => Number(a.source.grade) - Number(b.source.grade)
    || curriculumWeek(a) - curriculumWeek(b))
  .map((week) => {
    const terms = [...new Map(
      week.days.slice(1, 5).flatMap((day) => (day.words || []).map((word) => [
        String(word.en).trim().toLowerCase(),
        { en: String(word.en).trim(), meaning: String(word.meaning || "").trim() },
      ])),
    ).values()];
    const count = terms.length;
    const cols = count <= 4 ? count : count <= 6 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const grade = Number(week.source.grade);
    const number = curriculumWeek(week);
    return {
      key: `g${grade}-w${number}`,
      grade,
      week: number,
      title: week.title,
      terms,
      cols,
      rows,
      image: `assets/vocabulary-atlases/g${grade}-w${number}-watercolor-v1.webp`,
    };
  });

process.stdout.write(JSON.stringify(weeks));
