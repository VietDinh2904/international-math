(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const normalize = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const state = {
    grade: Number(localStorage.getItem("dailyScienceGrade")) || 4,
    weekKey: localStorage.getItem("dailyScienceWeek") || "",
    day: Number(localStorage.getItem("dailyScienceDay")) || 1,
    vietnamese: localStorage.getItem("dailyScienceLanguage") === "vi",
    query: "", answered: {},
    view: ["cards","games"].includes(localStorage.getItem("dailyScienceView")) ? localStorage.getItem("dailyScienceView") : "lessons",
    cardFilter: "all", cardQuery: "", gameType: "match", gameSession: null
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
    localStorage.setItem("dailyScienceView", state.view);
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
  const numberedParts = prompt => {
    const parts = [];
    String(prompt || "").replace(/(?:^|\s)(\d+)\.(?:\s*|$)([\s\S]*?)(?=\s+\d+\.(?:\s|$)|$)/g,(_,number,text) => {
      parts.push({number:Number(number),text:text.trim()}); return _;
    });
    return parts;
  };
  const answerMap = (answer, values) => {
    const found = {};
    const pattern = new RegExp(`(\\d+)\\.\\s*(${values.join("|")})`,"gi");
    String(answer || "").replace(pattern,(_,number,value) => { found[Number(number)] = value.toLowerCase(); return _; });
    return found;
  };
  const matchingActivity = question => {
    const prompt = String(question.prompt || ""), answer = String(question.answer || "");
    if (!/(match|draw (?:a )?line|draw lines)/i.test(prompt) || !/(?:match:|lines to match:)/i.test(answer)) return null;
    const pairText = (answer.match(/(?:match:|lines to match:)\s*([^)]*)/i) || [])[1];
    if (!pairText) return null;
    const pairs = pairText.split(",").map(pair => pair.split("/").map(item => item.replace(/[^a-zA-ZÀ-ỹ -]/g,"").trim())).filter(pair => pair.length===2 && pair[0] && pair[1]);
    if (pairs.length < 2) return null;
    const first = numberedParts(prompt)[0]?.text || prompt;
    const instruction = (first.match(/^.*?\.(?:\s|$)/) || [first])[0].trim();
    const orderByPrompt = items => [...items].sort((a,b) => {
      const ai=prompt.toLowerCase().indexOf(a.toLowerCase()), bi=prompt.toLowerCase().indexOf(b.toLowerCase());
      return (ai<0?9999:ai)-(bi<0?9999:bi);
    });
    const left = orderByPrompt(pairs.map(pair=>pair[0]));
    const right = orderByPrompt(pairs.map(pair=>pair[1]));
    const correct = left.map(item => right.findIndex(target => target.toLowerCase()===pairs.find(pair=>pair[0].toLowerCase()===item.toLowerCase())?.[1].toLowerCase()));
    return {instruction,left,right,correct};
  };
  const trueFalseActivity = question => {
    const prompt = String(question.prompt || "");
    if (!/(write|mark|choose)\s+(?:each\s+statement\s+)?true\s+or\s+false/i.test(prompt)) return null;
    const parts = numberedParts(prompt), answers = answerMap(question.answer,["true","false"]);
    if (parts.length < 2 || Object.keys(answers).length < 2) return null;
    const firstNumber = prompt.search(/(?:^|\s)1\.\s/);
    return {instruction:prompt.slice(0,firstNumber).trim(),statements:parts.map(part=>part.text),correct:parts.map(part=>answers[part.number]==="true")};
  };
  const compactAnswer = value => normalize(String(value || "").replace(/\s+/g,""));
  const cleanChoiceText = value => String(value || "")
    .replace(/_{3,}\.?/g,"")
    .replace(/\btr ee\b/gi,"tree")
    .replace(/\bmushr oom\b/gi,"mushroom")
    .replace(/\bi nclined\b/gi,"inclined")
    .replace(/\bl ever\b/gi,"lever")
    .replace(/\s+/g," ")
    .trim();
  const analogyChoiceActivity = question => {
    const prompt=String(question.prompt||"");
    if(!/analogy/i.test(prompt))return null;
    let instruction="",choices=[];
    if((prompt.match(/\s+r\s+/gi)||[]).length>=2){
      const pieces=prompt.split(/\s+r\s+/i);
      instruction=pieces.shift(); choices=pieces;
    }else if(/[□❒]/.test(prompt)){
      const pieces=prompt.split(/\s*[□❒]\s*/);
      instruction=pieces.shift(); choices=pieces;
    }else return null;
    instruction=instruction.replace(/^C omplete/i,"Complete").replace(/\s+/g," ").trim();
    choices=choices.map(cleanChoiceText).filter(Boolean);
    if(choices.length<2)return null;
    const expected=compactAnswer(question.answer);
    const right=choices.findIndex(choice=>expected.includes(compactAnswer(choice))||compactAnswer(choice).includes(expected));
    if(right<0)return null;
    return {instruction,choices,right};
  };
  let matchingResizeObserver;
  function drawMatchingLines(board, matches, correct, checked) {
    const svg=board?.querySelector(".matching-lines"); if(!svg)return;
    const box=board.getBoundingClientRect(); svg.setAttribute("viewBox",`0 0 ${box.width} ${box.height}`); svg.innerHTML="";
    Object.entries(matches || {}).forEach(([leftIndex,rightIndex])=>{
      const left=board.querySelector(`[data-match-left="${leftIndex}"]`), right=board.querySelector(`[data-match-right="${rightIndex}"]`);
      if(!left||!right)return;
      const a=left.getBoundingClientRect(), b=right.getBoundingClientRect(), line=document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1",a.right-box.left); line.setAttribute("y1",a.top+a.height/2-box.top);
      line.setAttribute("x2",b.left-box.left); line.setAttribute("y2",b.top+b.height/2-box.top);
      line.setAttribute("class",checked ? (correct[Number(leftIndex)]===Number(rightIndex)?"correct":"wrong") : "pending");
      svg.appendChild(line);
    });
  }
  function renderMatchingQuestion(question, key, saved, target=$("questionArea")) {
    const activity=matchingActivity(question); if(!activity)return false;
    const work=saved && typeof saved==="object" && saved.type==="matching" ? saved : {type:"matching",matches:{},selected:null,checked:false,fill:"",fillChecked:false};
    state.answered[key]=work;
    const second=numberedParts(question.prompt)[1], fillAnswer=(String(question.answer||"").match(/(?:^|\s)2\.\s*([a-zA-ZÀ-ỹ -]+?)(?=\s+\d+\.|$)/)||[])[1]?.trim();
    const matchedCount=Object.keys(work.matches).length, correctCount=Object.entries(work.matches).filter(([left,right])=>activity.correct[Number(left)]===Number(right)).length;
    target.innerHTML=`<div class="question-card interactive-book-card"><p class="activity-label">${escapeHtml(question.label||"1")} · MATCH</p><h4>${escapeHtml(activity.instruction)}</h4><p class="activity-hint">Select one item on the left, then its match on the right. A straight line will join them.</p><div class="matching-board"><svg class="matching-lines" aria-hidden="true"></svg><div class="matching-column">${activity.left.map((item,index)=>`<button type="button" class="match-item ${work.selected===index?"selected":""}" data-match-left="${index}" aria-pressed="${work.selected===index}">${escapeHtml(item)}<span class="match-port" aria-hidden="true"></span></button>`).join("")}</div><div class="matching-column matching-column-right">${activity.right.map((item,index)=>`<button type="button" class="match-item" data-match-right="${index}"><span class="match-port" aria-hidden="true"></span>${escapeHtml(item)}</button>`).join("")}</div></div><div class="activity-actions"><button class="secondary-action" type="button" data-role="reset-matches">Reset</button><button class="book-answer-button" type="button" data-role="check-matches">Check matches</button></div>${work.checked?`<div class="answer-reveal ${correctCount===activity.left.length?"good":""}" role="status"><strong>${correctCount}/${activity.left.length} correct.</strong> ${correctCount===activity.left.length?"Great work—every match is correct.":"Look back at the reading, then change the lines that do not fit."}</div>`:""}${second&&fillAnswer?`<div class="fill-activity"><p class="activity-label">2 · COMPLETE</p><h4>${escapeHtml(second.text)}</h4><div class="fill-answer-row"><label><span>Your answer</span><input data-role="book-fill" value="${escapeHtml(work.fill)}" autocomplete="off" spellcheck="false"></label><button class="book-answer-button" type="button" data-role="check-fill">Check</button></div>${work.fillChecked?`<div class="answer-reveal ${normalize(work.fill)===normalize(fillAnswer)?"good":""}" role="status">${normalize(work.fill)===normalize(fillAnswer)?"Correct!":"Try again. Find the key word in the reading."}</div>`:""}</div>`:""}</div>`;
    const board=target.querySelector(".matching-board"), redraw=()=>drawMatchingLines(board,work.matches,activity.correct,work.checked);
    requestAnimationFrame(redraw); matchingResizeObserver?.disconnect(); matchingResizeObserver=new ResizeObserver(redraw); matchingResizeObserver.observe(board);
    board.querySelectorAll("[data-match-left]").forEach(button=>button.onclick=()=>{work.selected=Number(button.dataset.matchLeft);work.checked=false;renderMatchingQuestion(question,key,work,target);});
    board.querySelectorAll("[data-match-right]").forEach(button=>button.onclick=()=>{if(work.selected===null)return;Object.keys(work.matches).forEach(left=>{if(work.matches[left]===Number(button.dataset.matchRight))delete work.matches[left];});work.matches[work.selected]=Number(button.dataset.matchRight);work.selected=null;work.checked=false;renderMatchingQuestion(question,key,work,target);});
    target.querySelector('[data-role="reset-matches"]').onclick=()=>{work.matches={};work.selected=null;work.checked=false;renderMatchingQuestion(question,key,work,target);};
    target.querySelector('[data-role="check-matches"]').onclick=()=>{work.checked=true;renderMatchingQuestion(question,key,work,target);};
    const fillInput=target.querySelector('[data-role="book-fill"]'), fillButton=target.querySelector('[data-role="check-fill"]');
    if(fillInput){fillInput.oninput=event=>{work.fill=event.target.value;work.fillChecked=false;};fillButton.onclick=()=>{work.fill=fillInput.value;work.fillChecked=true;renderMatchingQuestion(question,key,work,target);};}
    return true;
  }
  function renderTrueFalseQuestion(question, key, saved, target=$("questionArea")) {
    const activity=trueFalseActivity(question); if(!activity)return false;
    const work=saved && typeof saved==="object" && saved.type==="truefalse" ? saved : {type:"truefalse",marks:{},checked:false}; state.answered[key]=work;
    const correctCount=activity.correct.filter((answer,index)=>work.marks[index]===answer).length;
    target.innerHTML=`<div class="question-card interactive-book-card"><p class="activity-label">${escapeHtml(question.label||"A")} · TRUE / FALSE</p><h4>${escapeHtml(activity.instruction)}</h4><div class="tf-list">${activity.statements.map((statement,index)=>`<div class="tf-row ${work.checked?(work.marks[index]===activity.correct[index]?"correct":"wrong"):""}"><p><span>${index+1}</span>${escapeHtml(statement)}</p><div class="tf-marks" role="group" aria-label="Statement ${index+1}"><button type="button" data-tf-index="${index}" data-tf-value="true" aria-pressed="${work.marks[index]===true}" class="${work.marks[index]===true?"selected":""}"><b>T</b><small>True</small></button><button type="button" data-tf-index="${index}" data-tf-value="false" aria-pressed="${work.marks[index]===false}" class="${work.marks[index]===false?"selected":""}"><b>F</b><small>False</small></button></div></div>`).join("")}</div><button class="book-answer-button" type="button" data-role="check-true-false">Check answers</button>${work.checked?`<div class="answer-reveal ${correctCount===activity.statements.length?"good":""}" role="status"><strong>${correctCount}/${activity.statements.length} correct.</strong> ${correctCount===activity.statements.length?"You found all the evidence.":"Reread the passage and change the marked boxes that need another answer."}</div>`:""}</div>`;
    target.querySelectorAll("[data-tf-index]").forEach(button=>button.onclick=()=>{work.marks[Number(button.dataset.tfIndex)]=button.dataset.tfValue==="true";work.checked=false;renderTrueFalseQuestion(question,key,work,target);});
    target.querySelector('[data-role="check-true-false"]').onclick=()=>{work.checked=true;renderTrueFalseQuestion(question,key,work,target);}; return true;
  }
  function renderAnalogyChoiceQuestion(question,key,saved,target=$("questionArea")){
    const activity=analogyChoiceActivity(question);if(!activity)return false;
    const work=saved&&typeof saved==="object"&&saved.type==="analogy-choice"?saved:{type:"analogy-choice",selected:null,checked:false};state.answered[key]=work;
    const correct=work.selected===activity.right, isInclinedPlane=/inclined plane is to simple machine/i.test(activity.instruction);
    const success=isInclinedPlane?"An inclined plane is a type of simple machine, just as a triangle is a type of shape.":"The chosen pair has the same relationship as the pair in the question.";
    target.innerHTML=`<div class="question-card interactive-book-card analogy-card"><p class="activity-label">${escapeHtml(question.label||"A")} · MULTIPLE CHOICE</p><h4>${escapeHtml(activity.instruction)}</h4><p class="activity-hint">Choose the pair that has the same relationship. Ask how the first two ideas are connected, then find the same connection below.</p><div class="choice-list">${activity.choices.map((choice,index)=>`<button class="choice-button ${work.checked&&index===work.selected?(index===activity.right?"correct":"wrong"):""}" type="button" data-analogy-answer="${index}" aria-pressed="${work.selected===index}"><span>${String.fromCharCode(65+index)}</span>${escapeHtml(choice)}</button>`).join("")}</div><button class="book-answer-button" type="button" data-role="check-analogy" ${work.selected===null?"disabled":""}>Check answer</button>${work.checked?`<div class="answer-reveal ${correct?"good":""}" role="status"><strong>${correct?"Correct!":"Try again."}</strong> ${correct?escapeHtml(success):"Look for a choice with the same kind of connection as the first pair."}</div>`:""}</div>`;
    target.querySelectorAll("[data-analogy-answer]").forEach(button=>button.onclick=()=>{work.selected=Number(button.dataset.analogyAnswer);work.checked=false;renderAnalogyChoiceQuestion(question,key,work,target);});
    target.querySelector('[data-role="check-analogy"]').onclick=()=>{work.checked=true;renderAnalogyChoiceQuestion(question,key,work,target);};return true;
  }
  function indexedAnswers(answer) {
    const result={};
    String(answer||"").replace(/(?:^|\s)(\d+)\.(?:\s*|$)([\s\S]*?)(?=\s+\d+\.(?:\s|$)|$)/g,(_,number,text)=>{result[Number(number)]=text.trim();return _;});
    return result;
  }
  function renderBookResponseQuestion(question,key,saved,target) {
    const prompt=state.vietnamese&&question.viPrompt?question.viPrompt:question.prompt, answer=state.vietnamese&&question.viAnswer?question.viAnswer:question.answer;
    const trailingPlaceholders=String(prompt).match(/((?:\d+\.\s*){2,})$/), placeholderParts=trailingPlaceholders?trailingPlaceholders[1].match(/\d+(?=\.)/g).map(number=>({number:Number(number),text:""})):null;
    const parts=placeholderParts||numberedParts(prompt), firstNumber=trailingPlaceholders?String(prompt).length-trailingPlaceholders[1].length:String(prompt).search(/(?:^|\s)1\.(?:\s|$)/), instruction=(firstNumber>=0?String(prompt).slice(0,firstNumber):String(prompt)).trim();
    const rows=parts.length?parts:[{number:1,text:firstNumber<0?"":String(prompt).slice(firstNumber).trim()}], answers=indexedAnswers(answer);
    const work=saved&&typeof saved==="object"&&saved.type==="response"?saved:{type:"response",responses:{},checked:false};state.answered[key]=work;
    const answerMatches=(response,expected)=>String(expected||"").split(/\s*(?:\/|;|\bor\b)\s*/i).some(option=>normalize(response)===normalize(option));
    const configs=rows.map(row=>{const expected=answers[row.number]||"", isOpen=/(draw|describe|explain|why|what do you think|answers? will vary)/i.test(`${row.text} ${expected}`);const fill=/_{2,}/.test(row.text)||(!isOpen&&/(complete|fill in|write (?:a|the|one) (?:word|vocabulary word))/i.test(`${instruction} ${row.text}`));return {...row,expected,fill,gradable:fill&&!!expected};});
    const gradable=configs.filter(row=>row.gradable), openRows=configs.filter(row=>!row.gradable), correctCount=gradable.filter(row=>answerMatches(work.responses[row.number],row.expected)).length;
    const mode=gradable.length&&openRows.length?"MIXED":gradable.length?"COMPLETE":"WRITE";
    target.innerHTML=`<div class="question-card interactive-book-card response-card"><p class="activity-label">${escapeHtml(question.label||"QUESTION")} · ${mode}</p><h4>${escapeHtml(instruction||"Write your answer using evidence from the reading.")}</h4><div class="response-list">${configs.map((row,index)=>`<label class="response-row ${work.checked&&row.gradable?(answerMatches(work.responses[row.number],row.expected)?"correct":"wrong"):""}"><span class="response-number">${row.number||index+1}</span><span class="response-copy">${row.text?`<strong>${escapeHtml(row.text)}</strong>`:""}${row.fill?`<input data-response-number="${row.number}" value="${escapeHtml(work.responses[row.number]||"")}" placeholder="Type the missing word…" autocomplete="off">`:`<textarea data-response-number="${row.number}" rows="${configs.length===1?4:2}" placeholder="Write answer ${index+1} here…">${escapeHtml(work.responses[row.number]||"")}</textarea>`}</span></label>`).join("")}</div><button class="book-answer-button" type="button" data-role="check-response">${gradable.length&&openRows.length?"Check and compare":gradable.length?"Check answers":"Compare with the book"}</button>${work.checked?`<div class="answer-reveal ${gradable.length&&correctCount===gradable.length?"good":""}" role="status">${gradable.length?`<strong>${correctCount}/${gradable.length} checkable ${gradable.length===1?"answer":"answers"} correct.</strong> ${correctCount===gradable.length?"The checkable answers match the reading.":"Review the highlighted response, then try again."}`:""}${openRows.length?`${gradable.length?"<br><br>":""}<strong>Book feedback</strong><br>${escapeHtml(answer||"Discuss your evidence with a learning partner.")}`:""}</div>`:""}</div>`;
    target.querySelectorAll("[data-response-number]").forEach(field=>field.oninput=event=>{work.responses[Number(field.dataset.responseNumber)]=event.target.value;work.checked=false;});
    target.querySelector('[data-role="check-response"]').onclick=()=>{target.querySelectorAll("[data-response-number]").forEach(field=>{work.responses[Number(field.dataset.responseNumber)]=field.value;});work.checked=true;renderBookResponseQuestion(question,key,work,target);};return true;
  }
  function renderBookQuestionGroups(week,day) {
    const groups=day.bookQuestionGroups||[], base=dayKey(week,day.day);
    $("questionArea").innerHTML=`<div class="book-question-stack">${groups.map((_,index)=>`<div data-book-group="${index}"></div>`).join("")}</div>`;
    groups.forEach((question,index)=>{
      const target=$("questionArea").querySelector(`[data-book-group="${index}"]`), key=`${base}-book-${index}`, saved=state.answered[key];
      if(!state.vietnamese&&renderMatchingQuestion(question,key,saved,target))return;
      if(!state.vietnamese&&renderTrueFalseQuestion(question,key,saved,target))return;
      if(!state.vietnamese&&renderAnalogyChoiceQuestion(question,key,saved,target))return;
      renderBookResponseQuestion(question,key,saved,target);
    });
  }
  function renderQuestion(week, day) {
    const entry = firstQuestion(day), key = `${dayKey(week,day.day)}-q1`, saved = state.answered[key];
    if(day.bookQuestionGroups?.length){renderBookQuestionGroups(week,day);return;}
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
      if(!state.vietnamese && renderMatchingQuestion(q,key,saved))return;
      if(!state.vietnamese && renderTrueFalseQuestion(q,key,saved))return;
      if(!state.vietnamese && renderAnalogyChoiceQuestion(q,key,saved))return;
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
    $("mediaCaptionDay").textContent = `Day ${day.day}`; $("mediaCaptionTitle").textContent = dayTitle(day);
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
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const cardGroup = card => {
    if (card.collection === "plant" || card.attribute === "plant") return "plants";
    if (["microscopic","fungus"].includes(card.collection) || ["bacterium","virus","fungus"].includes(card.attribute)) return "micro";
    return "animals";
  };
  const rarity = card => Number(card.rarityStars) || (String(card.id).split("").reduce((sum,char)=>sum+char.charCodeAt(0),0)%5)+1;
  function atlasStyle(card) {
    const cols=Number(card.atlasCols)||1, rows=Number(card.atlasRows)||1, index=Number(card.atlasIndex)||0;
    const column=index%cols, row=Math.floor(index/cols)%rows;
    const x=cols>1?column/(cols-1)*100:50, y=rows>1?row/(rows-1)*100:50;
    return `background-image:url('${card.atlasAsset}');background-size:${cols*100}% ${rows*100}%;background-position:${x}% ${y}%`;
  }
  function renderCardLibrary() {
    const cards=window.EncyclopediaData?.cards||[], groups={all:"All cards",animals:"Animals",plants:"Plants",micro:"Microscopic life"};
    const counts={animals:cards.filter(card=>cardGroup(card)==="animals").length,plants:cards.filter(card=>cardGroup(card)==="plants").length,micro:cards.filter(card=>cardGroup(card)==="micro").length};
    $("atlasTotals").innerHTML=`<div class="atlas-total"><strong>${cards.length}</strong><span>species records</span></div><div class="atlas-total"><strong>${counts.plants+counts.micro}</strong><span>plants & microbes</span></div>`;
    $("cardFilters").innerHTML=Object.entries(groups).map(([key,label])=>`<button class="card-filter ${state.cardFilter===key?"active":""}" type="button" data-card-filter="${key}">${label}${key==="all"?` · ${cards.length}`:` · ${counts[key]}`}</button>`).join("");
    $("cardFilters").querySelectorAll("[data-card-filter]").forEach(button=>button.onclick=()=>{state.cardFilter=button.dataset.cardFilter;renderCardLibrary();});
    const query=normalize(state.cardQuery), visible=cards.filter(card=>(state.cardFilter==="all"||cardGroup(card)===state.cardFilter)&&(!query||normalize(`${card.name} ${card.scientificName} ${card.habitat}`).includes(query)));
    $("speciesCardGrid").innerHTML=visible.map(card=>{
      const stars=rarity(card);
      return `<button class="species-card" type="button" data-species-id="${escapeHtml(card.id)}"><span class="species-art" style="${atlasStyle(card)}" role="img" aria-label="${escapeHtml(card.name)} in its habitat"></span><span class="species-card-copy"><h3>${escapeHtml(card.name)}</h3><em>${escapeHtml(card.scientificName)}</em><span class="species-card-meta"><span>${escapeHtml(cardGroup(card)==="micro"?card.attribute:card.habitat?.split(",")[0]||card.attribute)}</span><span class="species-stars" aria-label="${stars} field stars">${"★".repeat(stars)}${"☆".repeat(5-stars)}</span></span></span></button>`;
    }).join("");
    $("cardEmpty").hidden=visible.length>0;
    $("speciesCardGrid").querySelectorAll("[data-species-id]").forEach(button=>button.onclick=()=>openSpeciesRecord(cards.find(card=>card.id===button.dataset.speciesId)));
  }
  function openSpeciesRecord(card) {
    if(!card)return;
    const fields=[["Habitat",card.habitat],["Diet",card.diet],["Origin",card.origin],["Activity",card.activity],["Behavior",card.behavior],["Lifespan",card.lifespan]];
    $("speciesDialogContent").innerHTML=`<article class="species-record"><div class="species-record-art" style="${atlasStyle(card)}" role="img" aria-label="${escapeHtml(card.name)} habitat illustration"></div><div class="species-record-copy"><p class="record-type">${escapeHtml(cardGroup(card))} · ${rarity(card)} field stars</p><h2 id="speciesDialogTitle">${escapeHtml(card.name)}</h2><em class="record-scientific">${escapeHtml(card.scientificName)}</em><p class="record-fact">${escapeHtml(card.summary||card.fact||"Open this field record to learn how the species lives.")}</p><div class="record-grid">${fields.filter(([,value])=>value).map(([label,value])=>`<div><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join("")}</div></div></article>`;
    $("speciesDialog").showModal();
  }
  const gameCatalog = [
    {id:"match",icon:"↔",title:"Connect the Clues",time:"2 min · vocabulary"},
    {id:"truefalse",icon:"✓",title:"True or False Trail",time:"3 min · evidence"},
    {id:"fill",icon:"✎",title:"Missing Word Lab",time:"2 min · key terms"},
    {id:"order",icon:"≡",title:"Sequence the Science",time:"4 min · reading order"},
    {id:"clues",icon:"?",title:"Clue Sprint",time:"3 min · quick quiz"},
    {id:"memory",icon:"◇",title:"Memory Field Cards",time:"4 min · recall"}
  ];
  function weekVocabulary(week) {
    const seen=new Set(), result=[];
    week.days.slice(1).forEach(day=>(day.words||[]).forEach(word=>{
      const term=String(word.en||"").trim(), meaning=String(word.meaning||"").trim();
      if(term&&meaning&&!seen.has(normalize(term))){seen.add(normalize(term));result.push({term,meaning});}
    }));
    return result.slice(0,4);
  }
  function weekTrueFalse(week) {
    for(const day of week.days.slice(1)){
      for(const question of day.bookQuestionGroups||[]){const parsed=trueFalseActivity(question);if(parsed)return parsed;}
      for(const question of day.questions||[]){
        if(question.type==="truefalse")return {instruction:"Read the statement. Mark True or False.",statements:[question.statement||question.prompt],correct:[!!question.booleanAnswer]};
      }
    }
    const statements=String(week.days[1]?.story||"").split(/(?<=[.!?])\s+/).filter(Boolean).slice(0,3);
    return {instruction:"Does each statement appear in the reading?",statements,correct:statements.map(()=>true)};
  }
  function gameSequence(week) {
    const day=week.days[state.day]||week.days[1];
    return String(day.story||"").split(/(?<=[.!?])\s+/).map(text=>text.trim()).filter(text=>text.length>18).slice(0,4);
  }
  function gameSession(type, week) {
    const key=`${signature(week)}-${state.day}-${type}`;
    if(!state.gameSession||state.gameSession.key!==key)state.gameSession={key,type,matches:{},selected:null,marks:{},fill:"",order:[],choices:{},flipped:[],matched:[],moves:0,checked:false};
    return state.gameSession;
  }
  function gameFeedback(correct,total) {
    return `<div class="answer-reveal ${correct===total?"good":""}" role="status"><strong>${correct}/${total} correct.</strong> ${correct===total?"Mission complete—excellent evidence work!":"Try again, then return to the reading for a clue."}</div>`;
  }
  function renderMatchGame(week) {
    let words=weekVocabulary(week);
    if(words.length<2)words=[{term:"evidence",meaning:"information that helps support an explanation"},{term:"observe",meaning:"to look carefully"},{term:"habitat",meaning:"the natural home of a plant or animal"}];
    const rights=[...words.map(word=>word.meaning)]; if(rights.length>1)rights.push(rights.shift());
    const correct=words.map(word=>rights.indexOf(word.meaning)), work=gameSession("match",week);
    const score=Object.entries(work.matches).filter(([left,right])=>correct[Number(left)]===Number(right)).length;
    $("gameStage").innerHTML=`<div class="matching-board game-matching-board"><svg class="matching-lines" aria-hidden="true"></svg><div class="matching-column">${words.map((word,index)=>`<button type="button" class="match-item ${work.selected===index?"selected":""}" data-match-left="${index}">${escapeHtml(word.term)}<span class="match-port"></span></button>`).join("")}</div><div class="matching-column matching-column-right">${rights.map((meaning,index)=>`<button type="button" class="match-item" data-match-right="${index}"><span class="match-port"></span>${escapeHtml(meaning)}</button>`).join("")}</div></div><div class="activity-actions"><button class="secondary-action" id="gameReset" type="button">Reset</button><button class="book-answer-button" id="gameCheck" type="button">Check connections</button></div>${work.checked?gameFeedback(score,words.length):""}`;
    const board=$("gameStage").querySelector(".matching-board"), redraw=()=>drawMatchingLines(board,work.matches,correct,work.checked);requestAnimationFrame(redraw);matchingResizeObserver?.disconnect();matchingResizeObserver=new ResizeObserver(redraw);matchingResizeObserver.observe(board);
    board.querySelectorAll("[data-match-left]").forEach(button=>button.onclick=()=>{work.selected=Number(button.dataset.matchLeft);work.checked=false;renderMatchGame(week);});
    board.querySelectorAll("[data-match-right]").forEach(button=>button.onclick=()=>{if(work.selected===null)return;Object.keys(work.matches).forEach(left=>{if(work.matches[left]===Number(button.dataset.matchRight))delete work.matches[left];});work.matches[work.selected]=Number(button.dataset.matchRight);work.selected=null;work.checked=false;renderMatchGame(week);});
    $("gameReset").onclick=()=>{work.matches={};work.selected=null;work.checked=false;renderMatchGame(week);};$("gameCheck").onclick=()=>{work.checked=true;renderMatchGame(week);};
  }
  function renderTrueFalseGame(week) {
    const activity=weekTrueFalse(week), work=gameSession("truefalse",week), score=activity.correct.filter((answer,index)=>work.marks[index]===answer).length;
    $("gameStage").innerHTML=`<div class="tf-list">${activity.statements.map((statement,index)=>`<div class="tf-row ${work.checked?(work.marks[index]===activity.correct[index]?"correct":"wrong"):""}"><p><span>${index+1}</span>${escapeHtml(statement)}</p><div class="tf-marks" role="group" aria-label="Statement ${index+1}"><button type="button" data-game-tf="${index}" data-value="true" aria-pressed="${work.marks[index]===true}" class="${work.marks[index]===true?"selected":""}"><b>T</b><small>True</small></button><button type="button" data-game-tf="${index}" data-value="false" aria-pressed="${work.marks[index]===false}" class="${work.marks[index]===false?"selected":""}"><b>F</b><small>False</small></button></div></div>`).join("")}</div><button class="book-answer-button" id="gameCheck" type="button">Check evidence</button>${work.checked?gameFeedback(score,activity.statements.length):""}`;
    $("gameStage").querySelectorAll("[data-game-tf]").forEach(button=>button.onclick=()=>{work.marks[Number(button.dataset.gameTf)]=button.dataset.value==="true";work.checked=false;renderTrueFalseGame(week);});$("gameCheck").onclick=()=>{work.checked=true;renderTrueFalseGame(week);};
  }
  function renderFillGame(week) {
    const words=weekVocabulary(week), target=words[0]||{term:"habitat",meaning:"the natural home of a plant or animal"}, work=gameSession("fill",week), right=normalize(work.fill)===normalize(target.term);
    $("gameStage").innerHTML=`<div class="game-fill-card"><blockquote>Which science word means “${escapeHtml(target.meaning)}”?</blockquote><label><span>Type the missing word</span><input id="gameFillInput" value="${escapeHtml(work.fill)}" autocomplete="off" spellcheck="false"></label><div class="activity-actions"><button class="book-answer-button" id="gameCheck" type="button">Check word</button></div>${work.checked?gameFeedback(right?1:0,1):""}</div>`;
    $("gameFillInput").oninput=event=>{work.fill=event.target.value;work.checked=false;};$("gameFillInput").onkeydown=event=>{if(event.key==="Enter")$("gameCheck").click();};$("gameCheck").onclick=()=>{work.fill=$("gameFillInput").value;work.checked=true;renderFillGame(week);};
  }
  function renderOrderGame(week) {
    const correct=gameSequence(week), shuffled=correct.map((text,index)=>({text,index})); if(shuffled.length>2)shuffled.push(shuffled.shift());
    const work=gameSession("order",week), remaining=shuffled.filter(item=>!work.order.includes(item.index)), score=work.order.filter((value,index)=>value===index).length;
    $("gameStage").innerHTML=`<p class="activity-hint">Choose the sentences in the order they appear in the reading.</p><div class="sequence-bank">${remaining.map(item=>`<button type="button" class="sequence-item" data-sequence-add="${item.index}"><span>+</span>${escapeHtml(item.text)}</button>`).join("")||"All steps selected."}</div><div class="sequence-answer">${work.order.map((index,position)=>`<button type="button" class="sequence-item" data-sequence-remove="${index}"><span>${position+1}</span>${escapeHtml(correct[index])}</button>`).join("")||"Choose the first sentence above."}</div><div class="activity-actions"><button class="secondary-action" id="gameReset" type="button">Reset</button><button class="book-answer-button" id="gameCheck" type="button">Check sequence</button></div>${work.checked?gameFeedback(score,correct.length):""}`;
    $("gameStage").querySelectorAll("[data-sequence-add]").forEach(button=>button.onclick=()=>{work.order.push(Number(button.dataset.sequenceAdd));work.checked=false;renderOrderGame(week);});$("gameStage").querySelectorAll("[data-sequence-remove]").forEach(button=>button.onclick=()=>{work.order=work.order.filter(value=>value!==Number(button.dataset.sequenceRemove));work.checked=false;renderOrderGame(week);});$("gameReset").onclick=()=>{work.order=[];work.checked=false;renderOrderGame(week);};$("gameCheck").onclick=()=>{work.checked=true;renderOrderGame(week);};
  }
  function gameWords(week){
    const words=weekVocabulary(week);
    return words.length>=3?words:[{term:"evidence",meaning:"information that supports an explanation"},{term:"observe",meaning:"to look carefully"},{term:"habitat",meaning:"the natural home of a plant or animal"},{term:"adaptation",meaning:"a trait that helps an organism survive"}];
  }
  function renderClueGame(week){
    const words=gameWords(week),work=gameSession("clues",week),score=words.filter((word,index)=>Number(work.choices[index])===index).length;
    $("gameStage").innerHTML=`<p class="activity-hint">Read each clue and choose its science word.</p><div class="clue-quiz">${words.map((word,index)=>`<section class="clue-round ${work.checked?(Number(work.choices[index])===index?"correct":"wrong"):""}"><p><span>${index+1}</span>${escapeHtml(word.meaning)}</p><div class="clue-options">${words.map((option,optionIndex)=>`<button type="button" data-clue-row="${index}" data-clue-choice="${optionIndex}" aria-pressed="${Number(work.choices[index])===optionIndex}">${escapeHtml(option.term)}</button>`).join("")}</div></section>`).join("")}</div><div class="activity-actions"><button class="secondary-action" id="gameReset" type="button">Reset</button><button class="book-answer-button" id="gameCheck" type="button">Check clues</button></div>${work.checked?gameFeedback(score,words.length):""}`;
    $("gameStage").querySelectorAll("[data-clue-row]").forEach(button=>button.onclick=()=>{work.choices[Number(button.dataset.clueRow)]=Number(button.dataset.clueChoice);work.checked=false;renderClueGame(week);});
    $("gameReset").onclick=()=>{work.choices={};work.checked=false;renderClueGame(week);};$("gameCheck").onclick=()=>{work.checked=true;renderClueGame(week);};
  }
  function renderMemoryGame(week){
    const words=gameWords(week),cards=[];words.forEach((word,index)=>{cards.push({pair:index,kind:"term",text:word.term});cards.push({pair:index,kind:"meaning",text:word.meaning});});
    const arranged=cards.map((card,index)=>({...card,id:index})).sort((a,b)=>((a.id*5+3)%cards.length)-((b.id*5+3)%cards.length));
    const work=gameSession("memory",week),complete=work.matched.length===words.length;
    $("gameStage").innerHTML=`<div class="memory-status"><strong>${work.matched.length}/${words.length} pairs</strong><span>${work.moves} tries</span></div><div class="memory-grid">${arranged.map(card=>{const open=work.flipped.includes(card.id)||work.matched.includes(card.pair);return `<button type="button" class="memory-card ${open?"open":""} ${work.matched.includes(card.pair)?"matched":""}" data-memory-card="${card.id}" aria-label="${open?escapeHtml(card.text):"Hidden science card"}"><span class="memory-back">?</span><span class="memory-front"><small>${card.kind==="term"?"WORD":"CLUE"}</small>${escapeHtml(card.text)}</span></button>`;}).join("")}</div><div class="activity-actions"><button class="secondary-action" id="gameReset" type="button">New round</button></div>${complete?`<div class="answer-reveal good" role="status"><strong>All pairs found in ${work.moves} tries!</strong> You connected every word to its science meaning.</div>`:""}`;
    $("gameStage").querySelectorAll("[data-memory-card]").forEach(button=>button.onclick=()=>{const id=Number(button.dataset.memoryCard),card=cards[id];if(work.flipped.length>=2||work.flipped.includes(id)||work.matched.includes(card.pair))return;work.flipped.push(id);renderMemoryGame(week);if(work.flipped.length===2){work.moves+=1;const [first,second]=work.flipped.map(cardId=>cards[cardId]);if(first.pair===second.pair&&first.kind!==second.kind){work.matched.push(first.pair);work.flipped=[];setTimeout(()=>renderMemoryGame(week),260);}else setTimeout(()=>{work.flipped=[];renderMemoryGame(week);},850);}});
    $("gameReset").onclick=()=>{work.flipped=[];work.matched=[];work.moves=0;renderMemoryGame(week);};
  }
  function renderGameStage(week) {
    const meta={match:["Vocabulary mission","Connect each science word to its meaning."],truefalse:["Evidence mission","Mark T or F, then check every statement against the reading."],fill:["Word mission","Retrieve the key science word without looking at the answer."],order:["Sequence mission","Rebuild the reading in its scientific order."],clues:["Quick quiz mission","Use the definitions from this week to identify each science word."],memory:["Memory mission","Flip cards and match each word with its meaning."]}[state.gameType];
    $("gameStageType").textContent=meta[0];$("gameStageTitle").textContent=gameCatalog.find(game=>game.id===state.gameType).title;$("gameStageIntro").textContent=meta[1];
    ({match:renderMatchGame,truefalse:renderTrueFalseGame,fill:renderFillGame,order:renderOrderGame,clues:renderClueGame,memory:renderMemoryGame}[state.gameType])(week);
  }
  function renderGames() {
    const week=currentWeek(), source=week.source;
    $("gameHero").style.setProperty("--game-hero",`url('${weekImage(week)}')`);$("gameWeekTitle").textContent=state.vietnamese&&week.viTitle?week.viTitle:week.title;$("gameWeekIntro").textContent="Six short missions turn this week's reading into active science practice.";$("gameHeroMeta").innerHTML=`<span>Grade ${source.grade}</span><span>Big Idea ${source.bigIdea}</span><span>Week ${source.bookWeek}</span><span>Based on the book reading</span>`;
    $("gameMenu").innerHTML=gameCatalog.map(game=>`<button type="button" class="game-tile ${state.gameType===game.id?"active":""}" data-game-type="${game.id}"><span class="game-tile-icon">${game.icon}</span><span><strong>${game.title}</strong><small>${game.time}</small></span></button>`).join("");
    $("gameMenu").querySelectorAll("[data-game-type]").forEach(button=>button.onclick=()=>{state.gameType=button.dataset.gameType;state.gameSession=null;renderGames();});renderGameStage(week);
  }
  function renderMode() {
    const cards=state.view==="cards", games=state.view==="games", lessons=!cards&&!games;
    document.querySelector(".app-shell").classList.toggle("cards-mode",cards);
    document.querySelector(".app-shell").classList.toggle("games-mode",games);
    $("lessonContent").hidden=!lessons; $("cardWorkspace").hidden=!cards; $("gameWorkspace").hidden=!games;
    $("lessonModeButton").classList.toggle("active",lessons); $("lessonModeButton").setAttribute("aria-pressed",String(lessons));
    $("gameModeButton").classList.toggle("active",games); $("gameModeButton").setAttribute("aria-pressed",String(games));
    $("cardModeButton").classList.toggle("active",cards); $("cardModeButton").setAttribute("aria-pressed",String(cards));
    if(cards)renderCardLibrary();
    if(games)renderGames();
  }
  function render() {
    ensureSelection(); document.documentElement.lang=state.vietnamese?"vi":"en";
    $("languageButton").setAttribute("aria-pressed",String(state.vietnamese)); $("languageButton").innerHTML=state.vietnamese?`VI <span>→</span> EN`:`EN <span>→</span> VI`;
    renderGradePicker(); renderWeekList(); renderProgress(); renderLesson(); renderMode();
  }
  $("languageButton").onclick=()=>{state.vietnamese=!state.vietnamese;saveState();render();};
  $("weekSearch").oninput=event=>{state.query=event.target.value;renderWeekList();};
  $("mobileMenuButton").onclick=()=>{const open=$("curriculumPanel").classList.toggle("open");$("mobileMenuButton").setAttribute("aria-expanded",String(open));};
  $("lessonModeButton").onclick=()=>{state.view="lessons";saveState();renderMode();scrollTo({top:0,behavior:"smooth"});};
  $("gameModeButton").onclick=()=>{state.view="games";state.gameSession=null;saveState();renderMode();scrollTo({top:0,behavior:"smooth"});};
  $("cardModeButton").onclick=()=>{state.view="cards";saveState();renderMode();scrollTo({top:0,behavior:"smooth"});};
  $("cardSearch").oninput=event=>{state.cardQuery=event.target.value;renderCardLibrary();};
  $("speciesDialogClose").onclick=()=>$("speciesDialog").close();
  $("speciesDialog").onclick=event=>{if(event.target===$("speciesDialog"))$("speciesDialog").close();};
  addEventListener("keydown",event=>{if(event.key==="Escape"){$("curriculumPanel").classList.remove("open");$("mobileMenuButton").setAttribute("aria-expanded","false");}});
  render();
})();
