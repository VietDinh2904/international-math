(()=>{
  "use strict";

  const STORE="international-math-unified-world-v1";
  const ADVENTURE_STORE="international-math-adventure-v1";
  const GOLD_PER_HOUR=20;
  const MARINE_UNLOCKS={acropora:[12,2],anemone:[12,2],clownfish:[12,3],parrotfish:[12,3],shrimp:[12,4],crab:[12,4],clam:[12,5]};
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const defaults=()=>({screen:"cockpit",labArea:"overview",scienceGrade:4,openWeek:0,openDay:0,selectedTerrain:12,selectedMicro:"",mathSeconds:0,awardedHours:0,robotLevel:1,cardCopies:{},lastSave:0});
  let state=load(STORE,defaults()),adventure=load(ADVENTURE_STORE,{science:{completedByWeek:{}},researchCards:[]}),lastActivity=Date.now(),timerHandle=0;

  function load(key,fallback){try{return{...fallback,...(JSON.parse(localStorage.getItem(key)||"null")||{})}}catch{return{...fallback}}}
  function save(){state.lastSave=Date.now();localStorage.setItem(STORE,JSON.stringify(state))}
  function saveAdventure(){localStorage.setItem(ADVENTURE_STORE,JSON.stringify(adventure))}
  function completedDays(week){return adventure.science?.completedByWeek?.[String(week)]||adventure.science?.completedByWeek?.[week]||[]}
  function isComplete(week,day){return completedDays(week).map(Number).includes(Number(day))}
  function weekProgress(week){return new Set(completedDays(week).map(Number)).size}
  function allWeeks(){return window.ScienceDiscovery?.weeks||window.ScienceExpansion?.weeks||{}}
  function habitats(){return window.ScienceExpansion?.habitats||{}}
  function specimens(){
    const land=(window.KingdomHabitat?.specimens||[]).map(item=>({...item,collection:item.homes?.includes(10)?"microscopic":item.homes?.includes(7)?"lunar":item.type==="plant"?"plant":"terrestrial"}));
    const marine=(window.AquariumDemo?.species||[]).map(item=>({...item,icon:"≈",image:"assets/coral-specimen-atlas-v1.png",unlock:MARINE_UNLOCKS[item.id]||[12,5],collection:"aquatic",clue:item.fact,success:`${item.role}. Depth ${item.depth}. Food: ${item.food}.`,homes:[12]}));
    return [...land,...marine];
  }
  function specimenUnlocked(item){return Array.isArray(item.unlock)&&isComplete(item.unlock[0],item.unlock[1])}
  function gold(){return Number(window.AquariumDemo?.getState?.().gold)||0}
  function addGold(amount,reason){window.AquariumDemo?.addResources?.({gold:amount,reason});toast(`+${amount} Gold · ${reason}`)}
  function spendGold(amount){return window.AquariumDemo?.spendGold?.(amount,"robot-upgrade")||false}
  function timeText(seconds){const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;return hours?`${hours}h ${String(minutes).padStart(2,"0")}m`:`${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`}
  function scienceStats(){const cards=specimens(),open=cards.filter(specimenUnlocked).length;return{open,total:cards.length,lessons:Object.keys(allWeeks()).length}}

  const root=document.createElement("div");root.id="unifiedWorldRoot";root.className="unified-world-root";document.body.appendChild(root);
  const mathReturn=document.createElement("button");mathReturn.id="unifiedMathReturn";mathReturn.className="unified-math-return";mathReturn.textContent="← Math World";mathReturn.hidden=true;document.body.appendChild(mathReturn);
  document.body.classList.add("unified-shell-on");

  function shell(content,{back=false,title="Learning Worlds"}={}){
    const stats=scienceStats();
    root.hidden=false;
    root.innerHTML=`<header class="uw-topbar"><button class="uw-brand" data-go="cockpit"><span>M</span><b>International Math</b></button><div class="uw-location"><small>ORBITAL LEARNING STATION</small><strong>${esc(title)}</strong></div><div class="uw-resources"><span><i>●</i><b>${gold()}</b><small>Gold</small></span><span><i>◈</i><b>${stats.open}/${stats.total}</b><small>Life cards</small></span><span><i>◷</i><b>${timeText(state.mathSeconds)}</b><small>Math study</small></span></div>${back?'<button class="uw-back" data-back>← Back</button>':''}</header><main class="uw-view">${content}</main><div class="uw-toast" id="uwToast" hidden></div>`;
    bindCommon();
  }
  function bindCommon(){
    root.querySelectorAll('[data-go="cockpit"]').forEach(button=>button.onclick=()=>go("cockpit"));
    root.querySelectorAll("[data-back]").forEach(button=>button.onclick=back);
  }
  function toast(message){const node=root.querySelector("#uwToast");if(!node)return;node.textContent=message;node.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{if(node)node.hidden=true},3200)}
  function go(screen){state.screen=screen;if(screen!=="science")state.openWeek=state.openDay=0;save();render()}
  function back(){
    if(state.screen==="science"&&state.openDay){state.openDay=0;save();renderScience();return}
    if(state.screen==="science"&&state.openWeek){state.openWeek=0;save();renderScience();return}
    if(state.screen==="science"&&state.labArea!=="overview"){state.labArea="overview";save();renderScience();return}
    go("cockpit");
  }

  function renderCockpit(){
    const stats=scienceStats();
    shell(`<section class="uw-cockpit"><img src="assets/cockpit-home-v1.png" alt="Bright learning station cockpit"><div class="uw-cockpit-shade"></div><div class="uw-cockpit-copy"><p>WELCOME BACK, EXPLORER</p><h1>Choose a learning world</h1><span>One cockpit. Two active rooms. Two worlds reserved for the next subjects.</span></div><div class="uw-world-grid"><button class="uw-world-card science" data-world="science"><small>ACTIVE ROOM</small><strong>Science Lab</strong><span>Lessons · life cards · terrains · microscope · aquarium</span><em>${stats.lessons} weeks · ${stats.open}/${stats.total} life cards unlocked</em></button><button class="uw-world-card math" data-world="math"><small>ACTIVE ROOM</small><strong>Math World</strong><span>Books · papers · tests · helper robot · ship model</span><em>Study 60 minutes → ${GOLD_PER_HOUR} Gold</em></button><button class="uw-world-card history" data-world="history"><small>RESERVED WORLD</small><strong>History World</strong><span>A protected space for timelines, people and civilizations.</span><em>Background ready · lessons added later</em></button><button class="uw-world-card geography" data-world="geography"><small>RESERVED WORLD</small><strong>Geography World</strong><span>A protected space for maps, places and Earth systems.</span><em>Background ready · lessons added later</em></button></div><div class="uw-cockpit-rule"><b>THE NEW RULE</b><span>Science unlocks the base life card. Math creates Gold for extra specimen copies and helper-robot upgrades. No Mission, Zodiac or Arcade route is needed.</span></div></section>`,{title:"Cockpit"});
    root.querySelectorAll("[data-world]").forEach(button=>button.onclick=()=>go(button.dataset.world));
  }

  function labNav(active){return`<nav class="lab-nav" aria-label="Science Lab areas">${[["overview","Lab map"],["books","Science books"],["cards","Life cards"],["terrain","Terrain world"],["micro","Microscopic world"],["aquarium","Aquarium depths"]].map(([id,label])=>`<button class="${active===id?"active":""}" data-lab-area="${id}">${label}</button>`).join("")}</nav>`}
  function renderScience(){
    if(state.openDay)return renderLesson();
    if(state.openWeek)return renderWeek();
    if(state.labArea==="books")return renderScienceBooks();
    if(state.labArea==="cards")return renderCards();
    if(state.labArea==="terrain")return renderTerrain();
    if(state.labArea==="micro")return renderMicroscope();
    if(state.labArea==="aquarium")return renderAquarium();
    const stats=scienceStats();
    shell(`<section class="uw-lab-home"><img class="uw-room-bg" src="assets/science-earth-lab-v1.png" alt="Modern Science Lab"><div class="uw-room-filter"></div>${labNav("overview")}<div class="uw-room-title"><p>SCIENCE LAB · CENTRAL RESEARCH DECK</p><h1>Learn it. Turn it into a living world.</h1><span>Every science lesson stays in one room and produces a useful card when the reading is completed.</span></div><div class="lab-area-grid"><button data-lab-area="books"><i>▥</i><small>LEARN</small><b>Science Books</b><span>${stats.lessons} weeks from the existing Grade 4, 5 and 6 library.</span></button><button data-lab-area="cards"><i>◈</i><small>COLLECT</small><b>Life Card Archive</b><span>See all ${stats.total} organisms now; unstudied cards remain locked.</span></button><button data-lab-area="terrain"><i>⌁</i><small>BUILD</small><b>Terrain World</b><span>Turn completed chapter habitats into interactive landscape scenes.</span></button><button data-lab-area="micro"><i>◎</i><small>MAGNIFY</small><b>Microscopic World</b><span>Insert an unlocked microbe card to create its culture environment.</span></button><button data-lab-area="aquarium"><i>≈</i><small>DESCEND</small><b>Aquarium Depths</b><span>Scroll from sunlight to deeper water and meet organisms by depth.</span></button></div><aside class="lab-logic-strip"><b>LESSON</b><i>→</i><b>COMPLETION</b><i>→</i><b>SCIENCE CARD</b><i>→</i><b>WORLD</b></aside></section>`,{back:true,title:"Science Lab"});
    bindLabNav();
  }
  function bindLabNav(){root.querySelectorAll("[data-lab-area]").forEach(button=>button.onclick=()=>{state.labArea=button.dataset.labArea;state.openWeek=state.openDay=0;save();renderScience()})}

  function renderScienceBooks(){
    const weeks=Object.values(allWeeks());
    const grade=Number(state.scienceGrade)||4,filtered=weeks.filter(week=>Number(week.source?.grade||4)===grade);
    shell(`<section class="uw-panel science-library"><div class="panel-backdrop" style="--panel-image:url('assets/living-room-infinity-library-v1.png')"></div>${labNav("books")}<header class="panel-heading"><div><p>SCIENCE LAB · READING ARCHIVE</p><h1>Daily Science Books</h1><span>Choose a book, then a week. Every day keeps its original reading, vocabulary, images and questions.</span></div><div class="grade-tabs">${[4,5,6].map(number=>`<button class="${grade===number?"active":""}" data-grade="${number}">Grade ${number}</button>`).join("")}</div></header><div class="science-week-grid">${filtered.map(week=>{const done=weekProgress(week.number);return`<button class="science-week-tile" data-week="${week.number}" style="--week-image:url('${esc(week.hero)}')"><span class="week-photo"></span><div><small>GRADE ${grade} · WEEK ${week.source?.bookWeek||week.number}</small><strong>${esc(week.title)}</strong><em>${done}/5 days complete</em><i><b style="width:${done*20}%"></b></i></div></button>`}).join("")}</div></section>`,{back:true,title:`Science Lab · Grade ${grade}`});
    bindLabNav();
    root.querySelectorAll("[data-grade]").forEach(button=>button.onclick=()=>{state.scienceGrade=Number(button.dataset.grade);save();renderScienceBooks()});
    root.querySelectorAll("[data-week]").forEach(button=>button.onclick=()=>{state.openWeek=Number(button.dataset.week);save();renderWeek()});
  }
  function renderWeek(){
    const week=allWeeks()[state.openWeek];if(!week){state.openWeek=0;return renderScienceBooks()}
    shell(`<section class="uw-panel week-reader" style="--hero:url('${esc(week.hero)}')"><div class="week-hero"><div><p>${esc(week.subtitle)}</p><h1>${esc(week.title)}</h1><span>${esc(week.overview?.join(" · ")||"")}</span></div><b>${weekProgress(week.number)}/5<br><small>DAYS COMPLETE</small></b></div><div class="day-path">${week.days.slice(1).map(day=>`<button data-day="${day.day}" class="${isComplete(week.number,day.day)?"complete":""}"><span>${isComplete(week.number,day.day)?"✓":day.day}</span><div><small>DAY ${day.day} · ${esc(day.short)}</small><strong>${esc(day.title)}</strong><em>${isComplete(week.number,day.day)?"Card created":"Read to unlock its card"}</em></div></button>`).join("")}</div><aside class="week-card-rule"><b>WHAT UNLOCKS?</b><span>Finishing a day records the reading and creates that day's science card. Organism cards only become visible in a world after their matching lesson is complete.</span></aside></section>`,{back:true,title:`Science Week ${week.number}`});
    root.querySelectorAll("[data-day]").forEach(button=>button.onclick=()=>{state.openDay=Number(button.dataset.day);save();renderLesson()});
  }
  function renderLesson(){
    const week=allWeeks()[state.openWeek],day=week?.days?.[state.openDay];if(!day){state.openDay=0;return renderWeek()}
    const sections=day.readingSections?.length?day.readingSections:[{label:"CORE READING",title:day.title,text:day.story},{label:"CHAPTER CONNECTION",title:"Connect the evidence",text:week.overview?.[day.day-1]||day.guideLine||"Use today's observation to answer the weekly question."}];
    shell(`<article class="lesson-reader"><header><img src="${esc(day.image||week.hero)}" alt="${esc(day.title)}"><div><p>SCIENCE LAB · WEEK ${week.number} · DAY ${day.day}</p><h1>${esc(day.title)}</h1><span>${esc(day.guideLine||day.short)}</span></div></header><div class="lesson-columns"><main>${sections.map(section=>`<section><small>${esc(section.label)}</small><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></section>`).join("")}</main><aside><section class="vocab-card"><small>VOCABULARY IN CONTEXT</small>${(day.words||[]).map(word=>`<div><b>${esc(word.en)}</b><span>${esc(word.meaning)}</span><em>${esc(word.example||"")}</em></div>`).join("")}</section><section class="reward-card"><small>SCIENCE CARD OUTPUT</small><b>${esc(day.reward||day.short)}</b><span>${isComplete(week.number,day.day)?"✓ Already created":"Complete the reading to create this card."}</span><button id="finishScienceDay" ${isComplete(week.number,day.day)?"disabled":""}>${isComplete(week.number,day.day)?"Lesson complete":"Finish reading & create card"}</button></section></aside></div></article>`,{back:true,title:`Science Reading · Day ${day.day}`});
    const finish=root.querySelector("#finishScienceDay");if(finish)finish.onclick=()=>completeLesson(week,day);
  }
  function completeLesson(week,day){
    adventure.science=adventure.science||{};adventure.science.completedByWeek=adventure.science.completedByWeek||{};
    const key=String(week.number),days=new Set((adventure.science.completedByWeek[key]||[]).map(Number));days.add(Number(day.day));adventure.science.completedByWeek[key]=[...days].sort((a,b)=>a-b);
    adventure.researchCards=Array.isArray(adventure.researchCards)?adventure.researchCards:[];
    const id=`science-card-${week.number}-${day.day}`;
    if(!adventure.researchCards.some(card=>card.id===id))adventure.researchCards.push({id,name:day.reward||day.short,type:"science",rarity:Number(day.day)===5?"rare":"common",image:day.image||week.hero,lesson:day.story,week:week.number,day:day.day});
    saveAdventure();renderLesson();toast(`Science card created: ${day.reward||day.short}`);
  }

  function renderCards(){
    const cards=specimens(),groups=[["terrestrial","Animals"],["plant","Plants"],["aquatic","Aquatic"],["microscopic","Microscopic"],["lunar","Moon lab"]];
    shell(`<section class="uw-panel card-archive"><div class="panel-backdrop" style="--panel-image:url('assets/science-earth-lab-thumb-v2.png')"></div>${labNav("cards")}<header class="panel-heading"><div><p>SCIENCE LAB · LIFE CARD ARCHIVE</p><h1>Every card has a visible place</h1><span>All species are listed. A gray card shows exactly which lesson must be completed; it cannot be used before then.</span></div></header>${groups.map(([id,label])=>{const set=cards.filter(card=>card.collection===id);return set.length?`<section class="card-category"><h2>${label}<span>${set.filter(specimenUnlocked).length}/${set.length}</span></h2><div>${set.map(card=>lifeCard(card)).join("")}</div></section>`:""}).join("")}</section>`,{back:true,title:"Science Lab · Life Cards"});
    bindLabNav();bindLifeCards();
  }
  function lifeCard(card){const open=specimenUnlocked(card),unlock=card.unlock||[0,0],copies=1+(Number(state.cardCopies?.[card.id])||0);return`<button class="life-card ${open?"unlocked":"locked"}" data-life-card="${esc(card.id)}"><span class="life-card-art" ${open?`style="--card-image:url('${esc(card.image)}')"`:""}>${open?`<i>${esc(card.icon||"◈")}</i>`:"<b>?</b>"}</span><small>${open?"UNLOCKED":"LOCKED"} · ${esc(card.type||card.role||"organism")}</small><strong>${open?esc(card.name):"Unknown specimen"}</strong><em>${open?`Open field record · ${copies} specimen${copies===1?"":"s"}`:`Complete Week ${unlock[0]} · Day ${unlock[1]}`}</em></button>`}
  function bindLifeCards(){root.querySelectorAll("[data-life-card]").forEach(button=>button.onclick=()=>openLifeCard(button.dataset.lifeCard))}
  function openLifeCard(id){
    const card=specimens().find(item=>item.id===id);if(!card)return;const open=specimenUnlocked(card),unlock=card.unlock||[0,0],homeNames=(card.homes||[]).map(n=>habitats()[n]?.name).filter(Boolean),copies=1+(Number(state.cardCopies?.[id])||0),cost=card.collection==="aquatic"||card.collection==="lunar"?25:15;
    const modal=document.createElement("div");modal.className="uw-modal";modal.innerHTML=`<article class="life-record ${open?"":"locked"}"><button class="modal-close">×</button><div class="record-art" ${open?`style="--record-image:url('${esc(card.image)}')"`:""}>${open?`<i>${esc(card.icon||"◈")}</i>`:"<b>?</b>"}</div><div><small>${open?"HOLOGRAM LIFE RECORD":"LOCKED SCIENCE RECORD"}</small><h2>${open?esc(card.name):"Specimen locked"}</h2><p>${open?esc(card.clue||card.fact||""):"The image and full record appear only after the matching Science reading is completed."}</p><dl><div><dt>TYPE / ROLE</dt><dd>${esc(card.type||card.role||"Living organism")}</dd></div><div><dt>WHERE IT GOES</dt><dd>${open?esc(homeNames.join(" · ")||`Aquarium · ${card.depth||"matched depth"}`):`Science Books → Week ${unlock[0]} → Day ${unlock[1]}`}</dd></div><div><dt>HABITAT EVIDENCE</dt><dd>${open?esc(card.success||`Depth ${card.depth}. Food: ${card.food}.`):"Complete the reading first."}</dd></div>${open?`<div><dt>SPECIMEN COPIES</dt><dd>${copies} available · extra copies let this species appear more often in its world.</dd></div>`:""}</dl>${open?`<button class="record-buy" id="buyExtraSpecimen">Buy extra specimen · ${cost} Gold</button>`:""}<button class="record-action" data-open-source="${unlock[0]}:${unlock[1]}">${open?"Review source lesson":"Go to unlock lesson"} →</button></div></article>`;document.body.appendChild(modal);modal.querySelector(".modal-close").onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};modal.querySelector("[data-open-source]").onclick=()=>{modal.remove();state.screen="science";state.labArea="books";state.openWeek=unlock[0];state.openDay=unlock[1];save();renderScience()};const buy=modal.querySelector("#buyExtraSpecimen");if(buy)buy.onclick=()=>{if(!spendGold(cost)){toast(`You need ${cost} Gold. Study Math to earn it.`);return}state.cardCopies=state.cardCopies||{};state.cardCopies[id]=(Number(state.cardCopies[id])||0)+1;save();modal.remove();renderScience();toast(`${card.name}: extra specimen card added.`)};
  }

  function terrainEntries(){const terrainPattern=/World|Forest|Wetland|Pond|Soil|Coral|Garden|Rain|Compost|Moon|Savanna|Rainforest|Tundra|Coast/i;return Object.entries(habitats()).map(([week,item])=>({week:Number(week),...item})).filter(item=>terrainPattern.test(item.name)).slice(0,24)}
  function renderTerrain(){
    const entries=terrainEntries(),selected=entries.find(item=>item.week===Number(state.selectedTerrain))||entries[0],open=weekProgress(selected.week)>=5,inhabitants=specimens().filter(item=>(item.homes||[]).includes(selected.week));
    shell(`<section class="uw-panel terrain-world"><div class="panel-backdrop" style="--panel-image:url('${esc(selected.background)}')"></div>${labNav("terrain")}<header class="terrain-heading"><div><p>SCIENCE LAB · HOLOGRAPHIC TERRAIN WALL</p><h1>${esc(selected.name)}</h1><span>${esc(selected.region)} · ${esc(selected.zone)}</span></div><b>${open?"TERRAIN ACTIVE":`${weekProgress(selected.week)}/5 LESSON DAYS`}</b></header><div class="terrain-layout"><aside>${entries.map(item=>`<button data-terrain="${item.week}" class="${item.week===selected.week?"active":""} ${weekProgress(item.week)>=5?"open":"locked"}" style="--thumb:url('${esc(item.background)}')"><i></i><span><small>WEEK ${item.week}</small><b>${esc(item.name)}</b><em>${weekProgress(item.week)>=5?"Open world":"Locked · finish 5 days"}</em></span></button>`).join("")}</aside><main class="terrain-stage ${open?"open":"locked"}" style="--terrain:url('${esc(selected.background)}')"><div class="terrain-atmosphere">${Array.from({length:12},(_,i)=>`<i style="--i:${i};--x:${6+i*7}%;--y:${14+(i%8)*9}%"></i>`).join("")}</div>${open?inhabitants.map((item,index)=>`<button data-life-card="${item.id}" class="terrain-specimen ${specimenUnlocked(item)?"open":"locked"}" style="--x:${16+(index*23)%72}%;--y:${28+(index*31)%55}%">${specimenUnlocked(item)?item.icon:"?"}<small>${specimenUnlocked(item)?esc(item.name):"Study to reveal"}</small></button>`).join(""):`<div class="world-lock"><b>🔒</b><h2>Terrain locked</h2><p>Complete all five days of Science Week ${selected.week}. The finished chapter becomes this living hologram.</p><button data-open-week="${selected.week}">Open Science Week ${selected.week}</button></div>`}</main></div></section>`,{back:true,title:"Science Lab · Terrain World"});
    bindLabNav();bindLifeCards();root.querySelectorAll("[data-terrain]").forEach(button=>button.onclick=()=>{state.selectedTerrain=Number(button.dataset.terrain);save();renderTerrain()});root.querySelector("[data-open-week]")?.addEventListener("click",e=>{state.labArea="books";state.openWeek=Number(e.currentTarget.dataset.openWeek);save();renderScience()});
  }

  function renderMicroscope(){
    const cards=specimens().filter(item=>item.collection==="microscopic"),selected=cards.find(item=>item.id===state.selectedMicro&&specimenUnlocked(item));
    shell(`<section class="uw-panel micro-world"><div class="panel-backdrop" style="--panel-image:url('assets/microscopic-world-v1.png')"></div>${labNav("micro")}<header class="panel-heading"><div><p>SCIENCE LAB · MICROSCOPIC WORLD</p><h1>Insert a life card into the microscope</h1><span>Each unlocked organism creates a different culture scene. Locked cards show the exact reading needed.</span></div></header><div class="micro-layout"><aside class="micro-card-tray">${cards.map(card=>`<button data-micro="${card.id}" class="${specimenUnlocked(card)?"open":"locked"} ${selected?.id===card.id?"active":""}"><b>${specimenUnlocked(card)?card.icon:"?"}</b><span><strong>${specimenUnlocked(card)?esc(card.name):"Locked specimen"}</strong><small>${specimenUnlocked(card)?"Insert card":`Week ${card.unlock[0]} · Day ${card.unlock[1]}`}</small></span></button>`).join("")}</aside><main class="microscope-stage ${selected?"active":"empty"}" style="--micro-image:url('${esc(selected?.image||"assets/microscopic-world-v1.png")}');--focus:${esc(selected?.focus||"50% 50%")} ">${selected?`<div class="micro-lens"><div>${Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${7+(i%7)*12}%;--y:${8+(i*17)%76}%"></i>`).join("")}</div></div><section><small>${esc(selected.type).toUpperCase()} CULTURE</small><h2>${esc(selected.name)}</h2><p>${esc(selected.clue)}</p><b>${esc(selected.success)}</b></section>`:`<div class="empty-microscope"><span>◎</span><h2>No card inserted</h2><p>Complete a matching Science lesson, then choose its card from the tray.</p></div>`}</main></div></section>`,{back:true,title:"Science Lab · Microscopic World"});
    bindLabNav();root.querySelectorAll("[data-micro]").forEach(button=>button.onclick=()=>{const card=cards.find(item=>item.id===button.dataset.micro);if(!specimenUnlocked(card)){openLifeCard(card.id);return}state.selectedMicro=card.id;save();renderMicroscope()});
  }

  function renderAquarium(){
    const marine=specimens().filter(item=>item.collection==="aquatic"),positions=[8,18,30,44,57,72,87];
    shell(`<section class="uw-panel aquarium-world"><div class="panel-backdrop" style="--panel-image:url('assets/coral-reef-habitat-v1.png')"></div>${labNav("aquarium")}<header class="panel-heading aquarium-heading"><div><p>SCIENCE LAB · AQUATIC OBSERVATORY</p><h1>Scroll through Aquarium Depths</h1><span>The ruler moves from the surface downward. Every creature appears at a plausible depth only after its source lesson is complete.</span></div><b>SCROLL ↓</b></header><div class="depth-window"><div class="depth-stage"><div class="water-light"></div><div class="depth-ruler">${[0,5,10,20,30,40].map((depth,index)=>`<span style="top:${index*19}%">${depth===0?"SURFACE":`−${depth} m`}</span>`).join("")}</div>${Array.from({length:26},(_,i)=>`<i class="bubble" style="--i:${i};--x:${8+(i%13)*7}%;--y:${2+(i*11)%70}%"></i>`).join("")}${marine.map((card,index)=>`<button data-life-card="${card.id}" class="depth-creature ${specimenUnlocked(card)?"open":"locked"}" style="--y:${positions[index]}%;--x:${18+(index*19)%68}%;--ax:${card.ax||"0%"};--ay:${card.ay||"0%"}">${specimenUnlocked(card)?'<span></span>':'<b>?</b>'}<small>${specimenUnlocked(card)?esc(card.name):`Week ${card.unlock[0]} · Day ${card.unlock[1]}`}</small></button>`).join("")}</div></div></section>`,{back:true,title:"Science Lab · Aquarium Depths"});
    bindLabNav();bindLifeCards();
  }

  function helperRobot(){const level=Math.max(1,Math.min(3,state.robotLevel));return`<span class="uw-robot" aria-label="Orbit helper robot level ${level}"><i class="robot-base" style="--part-x:${(level-1)*50}%;--part-y:100%"></i><i class="robot-arms" style="--part-x:${(level-1)*50}%;--part-y:50%"></i><i class="robot-head" style="--part-x:${(level-1)*50}%;--part-y:0%"></i></span>`}
  function renderMath(){
    const next=Math.ceil((state.mathSeconds+1)/3600)*3600,remaining=Math.max(0,next-state.mathSeconds),cost=[0,40,90,160][state.robotLevel]||0;
    shell(`<section class="uw-math-room"><img class="uw-room-bg" src="assets/living-room-infinity-library-v1.png" alt="Modern mathematics library"><div class="uw-room-filter"></div><div class="math-heading"><p>MATHEMATICS WORLD</p><h1>Read. Solve. Build.</h1><span>All existing books and papers stay together here. Active study time is counted only while this room or a Math activity is open.</span></div><div class="math-launch-grid"><button data-math-target="practice"><i>∑</i><b>Interactive Practice</b><span>SMC · TIMO · Kangaroo question library</span></button><button data-math-target="test"><i>◷</i><b>Test Papers</b><span>Timed paper mode with saved answers</span></button><button data-math-target="papers"><i>▤</i><b>Book & PDF Shelf</b><span>Every original paper already uploaded</span></button></div><article class="math-timer-card"><small>REAL STUDY TIMER</small><strong id="mathStudyClock">${timeText(state.mathSeconds)}</strong><span id="mathRewardCountdown">${timeText(remaining)} until the next ${GOLD_PER_HOUR} Gold reward</span><i><b id="mathProgressBar" style="width:${state.mathSeconds%3600/36}%"></b></i><em>Time pauses when the page is hidden or inactive for 3 minutes.</em></article><article class="robot-bay">${helperRobot()}<div><small>ORBIT · HELPER ROBOT</small><h2>Level ${state.robotLevel}/3</h2><p>Orbit keeps books organized and records study time. Gold upgrades its research tools and movement system.</p><button id="upgradeRobot" ${state.robotLevel>=3?"disabled":""}>${state.robotLevel>=3?"Maximum upgrade installed":`Upgrade robot · ${cost} Gold`}</button></div></article><article class="ship-bay"><img src="assets/adventure-ship-v2.png" alt="Learning ship scale model"><div><small>MATHEMATICAL DESIGN MODEL</small><h2>Explorer Ship</h2><p>A display model for future geometry, measurement and engineering lessons. It is not a combat system.</p></div></article></section>`,{back:true,title:"Math World"});
    root.querySelectorAll("[data-math-target]").forEach(button=>button.onclick=()=>openLegacyMath(button.dataset.mathTarget));
    root.querySelector("#upgradeRobot").onclick=()=>{if(state.robotLevel>=3)return;if(!spendGold(cost)){toast(`You need ${cost} Gold. Study Math for 60 minutes to earn more.`);return}state.robotLevel++;save();renderMath();toast("Orbit upgraded and equipped immediately.")};
  }
  function openLegacyMath(target){
    lastActivity=Date.now();document.body.classList.add("unified-legacy-math");root.hidden=true;mathReturn.hidden=false;
    document.getElementById("menuPractice")?.click();
    setTimeout(()=>{if(target==="papers"){location.hash="library";document.getElementById("library")?.scrollIntoView({block:"start"})}else{location.hash="practice";document.getElementById("practice")?.scrollIntoView({block:"start"});if(target==="test")document.getElementById("testModeButton")?.click()}},60);
  }
  function closeLegacyMath(){document.getElementById("exitTestButton")?.click();document.body.classList.remove("unified-legacy-math");mathReturn.hidden=true;state.screen="math";save();render()}

  function renderReserved(kind){const history=kind==="history";shell(`<section class="reserved-world ${kind}"><div class="reserved-orb"><span>${history?"⌛":"⌖"}</span><i></i><i></i><i></i></div><div><p>${history?"HISTORY WORLD":"GEOGRAPHY WORLD"} · RESERVED</p><h1>${history?"Stories across time":"Places across Earth"}</h1><span>${history?"This world is reserved for timelines, civilizations, primary sources and historical reading.":"This world is reserved for maps, landforms, climate, populations and human–environment connections."}</span><aside><b>Background and route are ready.</b><em>No placeholder activities are mixed into Science or Math. Content can be added here later without changing the simple cockpit logic.</em></aside></div></section>`,{back:true,title:history?"History World":"Geography World"})}

  function render(){
    document.body.classList.remove("unified-legacy-math");mathReturn.hidden=true;
    if(state.screen==="science")renderScience();else if(state.screen==="math")renderMath();else if(state.screen==="history"||state.screen==="geography")renderReserved(state.screen);else renderCockpit();
  }

  function timerTick(){
    const active=state.screen==="math"||document.body.classList.contains("unified-legacy-math");
    if(active&&!document.hidden&&Date.now()-lastActivity<180000){
      state.mathSeconds++;
      const hour=Math.floor(state.mathSeconds/3600);
      if(hour>state.awardedHours){state.awardedHours=hour;addGold(GOLD_PER_HOUR,"60 minutes of active Math study")}
      if(state.mathSeconds%15===0)save();
      const clock=document.getElementById("mathStudyClock"),countdown=document.getElementById("mathRewardCountdown"),bar=document.getElementById("mathProgressBar");if(clock)clock.textContent=timeText(state.mathSeconds);if(countdown){const left=3600-(state.mathSeconds%3600||0);countdown.textContent=`${timeText(left)} until the next ${GOLD_PER_HOUR} Gold reward`}if(bar)bar.style.width=`${state.mathSeconds%3600/36}%`;
    }
  }
  ["pointerdown","keydown","touchstart","scroll"].forEach(event=>document.addEventListener(event,()=>{lastActivity=Date.now()},{passive:true}));
  mathReturn.onclick=closeLegacyMath;
  clearInterval(timerHandle);timerHandle=setInterval(timerTick,1000);
  window.addEventListener("beforeunload",save);
  window.UnifiedLearningWorld={go,render,getState:()=>({...state}),getScienceProgress:()=>({...adventure.science?.completedByWeek})};
  render();
})();
