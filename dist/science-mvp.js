(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const normalize = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const state = {
    grade: Number(localStorage.getItem("dailyScienceGrade")) || 4,
    weekKey: localStorage.getItem("dailyScienceWeek") || "",
    day: Number(localStorage.getItem("dailyScienceDay")) || 1,
    vietnamese: localStorage.getItem("dailyScienceLanguage") === "vi",
    query: "", answered: {}
  };
  const progress = JSON.parse(localStorage.getItem("dailyScienceMvpProgressV1") || "{}");
  window.ScienceBooks?.bindWeeks?.(window.ScienceExpansion?.weeks || {});

  const imageRows = [
    [4,1,["beaver-dam-v2","fruit-v2","bees-honey-v2","winter-food-v2"]],
    [4,2,["garbage-smell-v2","cavities-v2","germs-v2","moldy-food-v2"]],
    [4,3,["grand-canyon","glacier","volcano","earthquake"]],
    [4,4,["rock-mineral","rock-cycle","valuable-rocks","space-rocks"]],
    [4,5,["toaster","digital-clock","hearing-aid","electric-car"]],
    [4,6,["ramp","nail-screw","elevator","wheelbarrow"]],
    [5,1,["bone-muscle-v2","wrinkled-skin-v2","swallowed-gum-v2","blood-donation-v2"]],
    [5,2,["earthworms-soil-v2","panda-polar-diet-v2","lion-savanna-v2","rainforest-plants-v2"]],
    [5,3,["dinosaur-water","rivers-lakes","desert-dry","water-scarcity"]],
    [5,4,["earth-moon-weight","ocean-tides","planets-round","planet-orbits"]],
    [5,5,["thermometer","microwave","hurricane","thermos"]],
    [5,6,["soda-fizz","metal-rust","batteries-die","match-once"]],
    [6,1,["horse-zebra-hybrid-v2","left-handed-v2","corn-colors-v2","identical-twins-v2"]],
    [6,2,["extinction-v2","crocodile-survival-v2","polar-bear-adapt-v2","humans-ice-age-v2"]],
    [6,3,["weather","equator-hurricanes","cold-poles","reversed-seasons"]],
    [6,4,["continent-fit","earth-interior","continent-collision","future-earth"]],
    [6,5,["atoms","periodic-table","water-molecules","living-nonliving"]],
    [6,6,["windmill-electricity","popcorn","firefly-glow","fireworks"]]
  ];
  const imageMap = {};
  imageRows.forEach(([grade, idea, names]) => names.forEach((name, index) => {
    imageMap[`${grade}-${idea}-${index + 1}`] = `assets/science-realistic/g${grade}-bi${idea}-w${index + 1}-${name}.webp`;
  }));
  const titleMap = {
    "4-1-1":"Why do beavers build dams?", "4-1-2":"Why do some plants have fruit?",
    "4-1-3":"Do all bees make honey?", "4-1-4":"Where do animals get food in the winter?",
    "4-2-1":"Why does garbage smell?", "4-2-2":"How do bacteria create cavities?",
    "4-2-3":"Are all germs bad?", "4-2-4":"Is it safe to eat moldy food?",
    "5-2-1":"Why do earthworms like dirt?"
  };

  function sourceWeeks() {
    const all = [];
    Object.values(window.SciencePrimary?.weeks || {}).forEach(week => all.push({...week, key:`primary-${week.number}`}));
    Object.values(window.ScienceExpansion?.weeks || {}).forEach(week => {
      if (!week?.source || week.source.review) return;
      const grade = Number(week.source.grade), bigIdea = Number(week.source.bigIdea), bookWeek = Number(week.source.bookWeek);
      if (grade < 4 || grade > 6 || !bigIdea || !bookWeek) return;
      all.push({...week, key:`expansion-${week.number}`});
    });
    const discovery = window.ScienceDiscovery?.weeks || {};
    [[1,1],[2,2],[3,3],[4,4],[8,5],[9,6],[10,7],[11,8]].forEach(([number, curriculumWeek]) => {
      const original = discovery[number]; if (!original) return;
      const bigIdea = curriculumWeek <= 4 ? 1 : 2, bookWeek = curriculumWeek <= 4 ? curriculumWeek : curriculumWeek - 4;
      const readings = window.ScienceBookReadings?.["4"]?.[String(curriculumWeek)];
      const questions = window.ScienceBookQuestions?.["4"]?.[String(curriculumWeek)];
      const days = [null, ...original.days.slice(1,5).map((day, index) => ({
        ...day,
        story: readings?.[String(index + 1)]?.text || day.story,
        bookPage: readings?.[String(index + 1)]?.page || day.bookPage,
        bookQuestionGroups: questions?.[String(index + 1)]?.groups || day.bookQuestionGroups
      }))];
      all.push({...original, key:`discovery-${number}`, title:titleMap[`4-${bigIdea}-${bookWeek}`] || original.title, days,
        source:{grade:4,bigIdea,bookWeek,pages:`${days[1]?.bookPage || ""}–${days[4]?.bookPage || ""}`,publisher:"Evan-Moor Daily Science"}});
    });
    [{grade:5,bigIdea:2,bookWeek:1}].forEach(source => {
      const sourceKey = `${source.grade}-${source.bigIdea}-${source.bookWeek}`;
      if (all.some(week => `${week.source?.grade}-${week.source?.bigIdea}-${week.source?.bookWeek}` === sourceKey)) return;
      const curriculumWeek = (source.bigIdea-1)*4+source.bookWeek;
      const readings = window.ScienceBookReadings?.[String(source.grade)]?.[String(curriculumWeek)] || {};
      const questions = window.ScienceBookQuestions?.[String(source.grade)]?.[String(curriculumWeek)] || {};
      const days = [null, ...[1,2,3,4].map(dayNumber => ({
        day:dayNumber, title:`Day ${dayNumber}`, short:`Book Day ${dayNumber}`,
        story:readings[String(dayNumber)]?.text || "Read this day in the Daily Science book.",
        bookPage:readings[String(dayNumber)]?.page, bookQuestionGroups:questions[String(dayNumber)]?.groups || [],
        words:[], image:imageMap[sourceKey]
      }))];
      all.push({key:`book-${sourceKey}`,number:sourceKey,title:titleMap[sourceKey],subtitle:`Grade ${source.grade} · Big Idea ${source.bigIdea} · Week ${source.bookWeek}`,
        hero:imageMap[sourceKey],days,source:{...source,pages:`${days[1].bookPage}–${days[4].bookPage}`,publisher:"Evan-Moor Daily Science"}});
    });
    const unique = new Map();
    all.forEach(week => {
      const s = week.source || {}, signature = `${s.grade}-${s.bigIdea}-${s.bookWeek}`, existing = unique.get(signature);
      if (!existing || week.key.startsWith("discovery-")) unique.set(signature, week);
    });
    return [...unique.values()].sort((a,b) => Number(a.source.grade)-Number(b.source.grade) || Number(a.source.bigIdea)-Number(b.source.bigIdea) || Number(a.source.bookWeek)-Number(b.source.bookWeek));
  }

  const weeks = sourceWeeks(), grades = [1,2,3,4,5,6];
  const weeksForGrade = grade => weeks.filter(week => Number(week.source?.grade) === grade);
  const signature = week => `${week.source.grade}-${week.source.bigIdea}-${week.source.bookWeek}`;
  const dayKey = (week, day) => `${signature(week)}-${day}`;
  const currentWeek = () => weeks.find(week => week.key === state.weekKey) || weeksForGrade(state.grade)[0] || weeks[0];
  const currentDay = () => currentWeek()?.days?.[state.day] || currentWeek()?.days?.slice(1)[0];

  function saveState() {
    localStorage.setItem("dailyScienceGrade", String(state.grade));
    localStorage.setItem("dailyScienceWeek", state.weekKey);
    localStorage.setItem("dailyScienceDay", String(state.day));
    localStorage.setItem("dailyScienceLanguage", state.vietnamese ? "vi" : "en");
    localStorage.setItem("dailyScienceMvpProgressV1", JSON.stringify(progress));
  }
  function ensureSelection() {
    const options = weeksForGrade(state.grade);
    if (!options.some(week => week.key === state.weekKey)) state.weekKey = options[0]?.key || weeks[0]?.key;
    state.day = Math.min(Math.max(1,(currentWeek()?.days?.length || 2)-1), Math.max(1,state.day));
    saveState();
  }
  function weekImage(week) {
    const s = week.source || {};
    return imageMap[`${s.grade}-${s.bigIdea}-${s.bookWeek}`] || week.hero || week.days?.[1]?.image || "assets/science-earth-lab-v1.png";
  }
  function dayImage(week, day) {
    return Number(week.source?.grade) <= 3 ? (day.image || week.hero) : weekImage(week);
  }
  function dayTitle(day) {
    if (state.vietnamese && day.viTitle) return day.viTitle;
    if (day.title && !/^Day \d+$/i.test(day.title)) return day.title;
    const lead = String((state.vietnamese ? day.vi : day.story) || "").split(/[.!?]/)[0].trim();
    return lead.length > 64 ? `Day ${day.day}` : (lead || `Day ${day.day}`);
  }

  function renderGradePicker() {
    $("gradePicker").innerHTML = grades.map(grade => `<button type="button" role="tab" aria-selected="${state.grade===grade}" data-grade="${grade}" aria-label="Grade ${grade}">${grade}</button>`).join("");
    $("gradePicker").querySelectorAll("[data-grade]").forEach(button => button.onclick = () => {
      state.grade = Number(button.dataset.grade); state.weekKey = ""; state.day = 1; ensureSelection(); render();
    });
  }
  function renderWeekList() {
    const filtered = weeksForGrade(state.grade).filter(week => normalize(week.title).includes(normalize(state.query)) || normalize(week.viTitle).includes(normalize(state.query)));
    let idea = 0;
    $("weekList").innerHTML = filtered.map(week => {
      const s = week.source, group = s.bigIdea !== idea ? `<p class="week-group-label">Big Idea ${s.bigIdea}</p>` : ""; idea = s.bigIdea;
      const done = week.days.slice(1).filter(day => progress[dayKey(week,day.day)]).length;
      const title = state.vietnamese && week.viTitle ? week.viTitle : week.title;
      return `${group}<button class="week-link ${week.key===state.weekKey?"active":""}" type="button" data-week="${week.key}"><span>${s.bookWeek}</span><div><strong>${title}</strong><small>${done}/${week.days.length-1} days complete</small></div></button>`;
    }).join("") || `<p>No matching weeks.</p>`;
    $("weekList").querySelectorAll("[data-week]").forEach(button => button.onclick = () => {
      state.weekKey = button.dataset.week; state.day = 1; saveState(); render();
      if (innerWidth < 781) { $("curriculumPanel").classList.remove("open"); $("mobileMenuButton").setAttribute("aria-expanded","false"); }
    });
  }
  function renderProgress() {
    $("gradeProgress").innerHTML = grades.map(grade => {
      const gradeWeeks = weeksForGrade(grade), total = gradeWeeks.reduce((sum,w) => sum+w.days.length-1,0);
      const done = gradeWeeks.reduce((sum,w) => sum+w.days.slice(1).filter(d => progress[dayKey(w,d.day)]).length,0);
      const percent = total ? Math.round(done/total*100) : 0;
      return `<div class="grade-progress-row"><span>G${grade}</span><i style="--progress:${percent}%"></i><b>${percent}%</b></div>`;
    }).join("");
  }
  function renderHero(week) {
    const s = week.source, days = week.days.slice(1), done = days.filter(day => progress[dayKey(week,day.day)]).length;
    $("weekHero").style.setProperty("--hero", `url('${weekImage(week)}')`);
    $("weekBreadcrumb").textContent = `Grade ${s.grade}  /  Big Idea ${s.bigIdea}  /  Week ${s.bookWeek}`;
    $("weekTitle").textContent = state.vietnamese && week.viTitle ? week.viTitle : week.title;
    $("weekObjective").textContent = state.vietnamese ? "Mục tiêu: đọc bằng chứng và giải thích câu hỏi lớn của tuần." : "Goal: use evidence from each day to explain this week's big question.";
    $("sourceLine").innerHTML = `<span>Evan-Moor Daily Science</span><span>Book pages ${s.pages || "—"}</span><span>${days.length} reading days</span>`;
    $("weekProgressRing").innerHTML = `<strong>${done}/${days.length}</strong><span>days complete</span>`;
  }
  function renderDayTabs(week) {
    const days = week.days.slice(1); $("dayTabs").style.setProperty("--day-count", Math.min(days.length,5));
    $("dayTabs").innerHTML = days.map(day => `<button type="button" class="day-tab ${day.day===state.day?"active":""} ${progress[dayKey(week,day.day)]?"complete":""}" data-day="${day.day}" aria-current="${day.day===state.day?"step":"false"}"><strong>Day ${day.day}</strong><small>${dayTitle(day)}</small></button>`).join("");
    $("dayTabs").querySelectorAll("[data-day]").forEach(button => button.onclick = () => { state.day=Number(button.dataset.day); saveState(); render(); scrollTo({top:0,behavior:"smooth"}); });
  }
  function renderVocabulary(day) {
    const words = day.words || [];
    $("vocabularyList").innerHTML = words.length ? words.map(word => `<article class="vocab-card"><strong>${word.en}</strong><small>${word.pos || "science term"}</small><p>${word.meaning || "Meaning from today's reading."}</p>${word.vi ? `<p class="vi-meaning">VI · ${word.vi}${word.meaningVi ? ` — ${word.meaningVi}` : ""}</p>` : ""}</article>`).join("") : `<p>Key words are explained in the reading.</p>`;
  }
  function firstQuestion(day) {
    if (day.bookQuestionGroups?.length) return {kind:"book",value:day.bookQuestionGroups[0]};
    if (day.questions?.length) return {kind:"interactive",value:day.questions[0]};
    return {kind:"reflection",value:{prompt:"What is one piece of evidence you learned today?"}};
  }
  const formatBookPrompt = prompt => String(prompt || "").replace(/\s+(?=\d+\.\s)/g,"\n");
  function renderQuestion(week, day) {
    const entry = firstQuestion(day), key = `${dayKey(week,day.day)}-q1`, saved = state.answered[key];
    if (entry.kind === "interactive") {
      const q = entry.value, choices = q.type === "truefalse" ? ["True","False"] : (q.choices || []);
      if (choices.length) {
        const right = q.type === "truefalse" ? (q.booleanAnswer?0:1) : Number(q.right || 0);
        $("questionArea").innerHTML = `<div class="question-card"><p>${state.vietnamese&&q.vi?q.vi:(q.gapPrompt||q.statement||q.prompt)}</p><div class="choice-list">${choices.map((choice,index)=>`<button class="choice-button ${saved!==undefined&&index===saved?(index===right?"correct":"wrong"):""}" type="button" data-answer="${index}"><span>${String.fromCharCode(65+index)}</span>${choice}</button>`).join("")}</div><div class="answer-reveal ${saved===right?"good":""}" ${saved===undefined?"hidden":""}>${saved===right?"Correct. ":"Try again. "}${q.why||"Return to the reading and find the evidence."}</div></div>`;
        $("questionArea").querySelectorAll("[data-answer]").forEach(button => button.onclick = () => { state.answered[key]=Number(button.dataset.answer); renderQuestion(week,day); }); return;
      }
    }
    if (entry.kind === "book") {
      const q = entry.value;
      const prompt = formatBookPrompt(state.vietnamese&&q.viPrompt?q.viPrompt:q.prompt);
      $("questionArea").innerHTML = `<div class="question-card"><p class="book-question-lines">${q.label?`${q.label}.\n`:""}${prompt}</p><button class="book-answer-button" type="button" id="bookAnswerButton">${saved?"Hide book answer":"Check with the book answer"}</button>${saved?`<div class="answer-reveal"><strong>Answer key</strong><br>${state.vietnamese&&q.viAnswer?q.viAnswer:(q.answer||"Discuss your evidence with a learning partner.")}</div>`:""}</div>`;
      $("bookAnswerButton").onclick = () => { state.answered[key]=!saved; renderQuestion(week,day); }; return;
    }
    $("questionArea").innerHTML = `<div class="question-card"><p>${entry.value.prompt}</p><p>Say your answer aloud, then point to the sentence that supports it.</p></div>`;
  }
  function renderGuide(week, day) {
    const firstWord = day.words?.[0]?.en || "key detail", story = state.vietnamese ? (day.vi||day.story) : day.story;
    const first = String(story||"").split(/[.!?]/).filter(Boolean), question = firstQuestion(day).value;
    $("guideImage").src = dayImage(week,day); $("guideImage").alt = `Illustration for ${dayTitle(day)} in ${week.title}`;
    const steps = [
      ["Observe","Look closely at the image. What system, organism or material do you notice?"],
      ["Name",`Find “${firstWord}” in the reading and connect it to the illustration.`],
      ["Explain",first[0]?`${first[0].trim()}.`:"Retell the main cause and effect in your own words."],
      ["Check",question.prompt||question.statement||"Use one fact from the reading as evidence."]
    ];
    $("guideSteps").innerHTML = steps.map(([title,text]) => `<li><div><strong>${title}</strong><span>${text}</span></div></li>`).join("");
    $("mediaTranscript").textContent = `Visual guide for Day ${day.day}. The image supports the reading “${dayTitle(day)}.” Observe the main subject, identify the important parts, follow the process described in the text, and use the final question to check your explanation.`;
  }
  function renderLesson() {
    const week=currentWeek(), day=currentDay(); renderHero(week); renderDayTabs(week);
    $("dayLabel").textContent=`Reading from the book · Day ${day.day}`; $("dayTitle").textContent=dayTitle(day);
    $("pageChip").textContent=day.bookPage?`Book p. ${day.bookPage}`:`Day ${day.day}`;
    $("readingText").textContent=state.vietnamese&&day.vi?day.vi:day.story;
    renderVocabulary(day); renderQuestion(week,day); renderGuide(week,day);
    const completed=!!progress[dayKey(week,day.day)];
    $("completeDayButton").textContent=completed?"✓ Day complete":"Mark day complete"; $("completeDayButton").classList.toggle("completed",completed); $("saveNote").textContent=completed?"Saved in this browser.":"";
    const days=week.days.slice(1), index=days.findIndex(item=>item.day===day.day), next=days[index+1];
    $("nextStepTitle").textContent=next?`Day ${next.day}: ${dayTitle(next)}`:"Review the weekly question";
    $("nextStepText").textContent=next?"Continue when you can explain today's idea in one sentence.":`Use evidence from all ${days.length} days to answer: ${week.title}`;
    $("nextDayButton").textContent=next?`Open Day ${next.day}`:"Return to Day 1";
    $("nextDayButton").onclick=()=>{state.day=next?next.day:1;saveState();render();scrollTo({top:0,behavior:"smooth"});};
    $("completeDayButton").onclick=()=>{progress[dayKey(week,day.day)]=!completed;saveState();render();$("saveNote").textContent=progress[dayKey(week,day.day)]?"Progress saved.":"Completion removed.";};
  }
  function render() {
    ensureSelection(); document.documentElement.lang=state.vietnamese?"vi":"en";
    $("languageButton").setAttribute("aria-pressed",String(state.vietnamese)); $("languageButton").innerHTML=state.vietnamese?`VI <span>→</span> EN`:`EN <span>→</span> VI`;
    renderGradePicker(); renderWeekList(); renderProgress(); renderLesson();
  }
  $("languageButton").onclick=()=>{state.vietnamese=!state.vietnamese;saveState();render();};
  $("weekSearch").oninput=event=>{state.query=event.target.value;renderWeekList();};
  $("mobileMenuButton").onclick=()=>{const open=$("curriculumPanel").classList.toggle("open");$("mobileMenuButton").setAttribute("aria-expanded",String(open));};
  addEventListener("keydown",event=>{if(event.key==="Escape"){$("curriculumPanel").classList.remove("open");$("mobileMenuButton").setAttribute("aria-expanded","false");}});
  render();
})();
