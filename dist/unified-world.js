(()=>{
  "use strict";

  const STORE="international-math-unified-world-v1";
  const ADVENTURE_STORE="international-math-adventure-v1";
  const GOLD_PER_HOUR=20;
  const MARINE_UNLOCKS={acropora:[12,2],anemone:[12,2],clownfish:[12,3],parrotfish:[12,3],shrimp:[12,4],crab:[12,4],clam:[12,5]};
  const SHOP_SPECIMENS=[
    {id:"shop-red-fox",name:"Red Fox",icon:"🦊",atlasIndex:0,type:"animal",collection:"terrestrial",terrain:"Winter Woodland",homes:[4],cost:65,rarity:"Habitat visitor",image:"assets/science-winter-review-v1.png",clue:"A red fox uses keen hearing and an adaptable diet to live in forests, fields and towns.",success:"Place it where shelter, small prey and seasonal cover are available."},
    {id:"shop-snowy-owl",name:"Snowy Owl",icon:"🦉",atlasIndex:1,type:"animal",collection:"terrestrial",terrain:"Winter Woodland",homes:[4],cost:85,rarity:"Habitat visitor",image:"assets/science-winter-review-v1.png",clue:"Snowy owls use pale feathers as camouflage and hunt small mammals in open cold landscapes.",success:"It needs open hunting space and a steady prey population."},
    {id:"shop-river-otter",name:"River Otter",icon:"🦦",atlasIndex:2,type:"animal",collection:"terrestrial",terrain:"Living Wetland",homes:[14],cost:95,rarity:"Habitat visitor",image:"assets/science-wetland-effects-v2.png",clue:"River otters are agile swimmers that hunt fish, frogs and crustaceans.",success:"Clean water, food and sheltered banks make a suitable wetland home."},
    {id:"shop-blue-heron",name:"Great Blue Heron",icon:"🪶",atlasIndex:3,type:"animal",collection:"terrestrial",terrain:"Living Wetland",homes:[14],cost:75,rarity:"Habitat visitor",image:"assets/science-beaver-wetland-v2.png",clue:"A heron stands quietly in shallow water before striking quickly at prey.",success:"It needs shallow feeding areas and safe nesting trees."},
    {id:"shop-giraffe",name:"Giraffe",icon:"🦒",atlasIndex:4,type:"animal",collection:"terrestrial",terrain:"Savanna Food Web",homes:[28],cost:130,rarity:"Habitat visitor",image:"assets/science-winter-migration-v1.png",clue:"A giraffe's long neck and tongue help it browse leaves above many other herbivores.",success:"Open woodland, tall browse and room to move support this large herbivore."},
    {id:"shop-meerkat",name:"Meerkat",icon:"🐾",atlasIndex:5,type:"animal",collection:"terrestrial",terrain:"Savanna Food Web",homes:[28],cost:70,rarity:"Habitat visitor",image:"assets/science-winter-migration-v1.png",clue:"Meerkats live in cooperative groups and use burrows for safety from heat and predators.",success:"Dry open ground, insects and diggable soil are essential."},
    {id:"shop-sloth",name:"Two-toed Sloth",icon:"🦥",atlasIndex:6,type:"animal",collection:"terrestrial",terrain:"Rainforest Layers",homes:[29],cost:110,rarity:"Habitat visitor",image:"assets/garden-room-v1.png",clue:"A sloth moves slowly through the canopy and feeds mainly on leaves.",success:"A connected tree canopy provides food, shelter and travel routes."},
    {id:"shop-toucan",name:"Keel-billed Toucan",icon:"🦜",atlasIndex:7,type:"animal",collection:"terrestrial",terrain:"Rainforest Layers",homes:[29],cost:90,rarity:"Habitat visitor",image:"assets/garden-room-v1.png",clue:"Toucans eat fruit and can spread seeds as they travel through the canopy.",success:"Fruit-bearing trees and nesting cavities support this rainforest bird."},
    {id:"shop-arctic-fox",name:"Arctic Fox",icon:"🐺",atlasIndex:8,type:"animal",collection:"terrestrial",terrain:"Polar Survival",homes:[34],cost:120,rarity:"Habitat visitor",image:"assets/science-winter-review-v1.png",clue:"An Arctic fox has thick fur and changes coat color with the seasons.",success:"Cold habitat, shelter and access to small prey or carrion are needed."},
    {id:"shop-ringed-seal",name:"Ringed Seal",icon:"🦭",atlasIndex:9,type:"animal",collection:"aquatic",terrain:"Polar Coast",homes:[34],cost:140,rarity:"Habitat visitor",image:"assets/science-winter-review-v1.png",clue:"Ringed seals maintain breathing holes in sea ice and feed beneath the surface.",success:"Seasonal sea ice and productive cold water support this marine mammal."},
    {id:"shop-seahorse",name:"Long-snouted Seahorse",icon:"🐴",atlasIndex:10,type:"marine animal",collection:"aquatic",terrain:"Coral Lagoon",homes:[12],cost:105,rarity:"Habitat visitor",image:"assets/coral-reef-habitat-v1.png",clue:"A seahorse uses its curled tail to hold seagrass or coral branches in moving water.",success:"Gentle currents, small prey and gripping places create a suitable habitat."},
    {id:"shop-blue-tang",name:"Blue Tang",icon:"🐠",atlasIndex:11,type:"marine animal",collection:"aquatic",terrain:"Coral Lagoon",homes:[12],cost:100,rarity:"Habitat visitor",image:"assets/coral-reef-habitat-v1.png",clue:"Blue tangs graze algae and help keep reef surfaces from becoming overgrown.",success:"A healthy reef needs algae, hiding crevices and clean warm water."}
  ];
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const defaults=()=>({screen:"cockpit",labArea:"overview",mathArea:"overview",scienceGrade:4,openWeek:0,openDay:0,selectedTerrain:12,selectedMicro:"",mathSeconds:0,awardedHours:0,robotLevel:1,robotConfig:{head:0,arms:0,base:0},ownedRobotModels:[0],shipStyle:0,ownedShipStyles:[0],shopOwned:[],cardCopies:{},rewardedMathQuestions:[],answerLedger:{},scienceExerciseIndex:{},scienceAnswers:{},scienceExerciseFeedback:{},testUnlockAll:true,testGrantApplied:false,lastSave:0});
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
    return [...land,...marine,...SHOP_SPECIMENS.map(item=>({...item,shopOnly:true,unlock:null}))];
  }
  function specimenSprite(card,className=""){if(!Number.isFinite(Number(card?.atlasIndex)))return`<span class="specimen-fallback ${className}">${esc(card?.icon||"◈")}</span>`;const index=Number(card.atlasIndex),x=index%4*100/3,y=Math.floor(index/4)*50;return`<span class="real-specimen ${className}" role="img" aria-label="${esc(card.name)}" style="--specimen-x:${x}%;--specimen-y:${y}%"></span>`}
  function specimenUnlocked(item){if(item.shopOnly)return(Array.isArray(state.shopOwned)?state.shopOwned:[]).includes(item.id);return state.testUnlockAll||(Array.isArray(item.unlock)&&isComplete(item.unlock[0],item.unlock[1]))}
  function gold(){return Number(window.AquariumDemo?.getState?.().gold)||0}
  function updateLegacyResources(earned=false){
    const pill=document.getElementById("legacyMathResources"),value=document.getElementById("legacyMathGold");
    if(value)value.textContent=String(gold());
    if(pill&&earned){pill.classList.remove("earned");void pill.offsetWidth;pill.classList.add("earned");setTimeout(()=>pill.classList.remove("earned"),1200)}
  }
  function addGold(amount,reason){window.AquariumDemo?.addResources?.({gold:amount,reason});updateLegacyResources(true);toast(`${amount>0?"+":""}${amount} Gold · ${reason}`)}
  function spendGold(amount){return window.AquariumDemo?.spendGold?.(amount,"robot-upgrade")||false}
  function timeText(seconds){const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;return hours?`${hours}h ${String(minutes).padStart(2,"0")}m`:`${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`}
  function scienceCompletedCount(){return Object.values(adventure.science?.completedByWeek||{}).reduce((sum,days)=>sum+new Set((Array.isArray(days)?days:[]).map(Number)).size,0)}
  function scienceStats(){const cards=specimens(),open=cards.filter(specimenUnlocked).length,lessons=Object.keys(allWeeks()).length;return{open,total:cards.length,lessons,completed:scienceCompletedCount(),totalReadings:lessons*5}}
  function countWords(text){return String(text||"").trim().split(/\s+/).filter(Boolean).length}
  function scienceGrade(week){return Math.max(1,Math.min(6,Number(week?.source?.grade)||4))}
  function readingTarget(grade){return grade===6?200:150}
  function expandedScienceReading(week,day){
    const grade=scienceGrade(week),target=readingTarget(grade),fact=week.overview?.[day.day-1]||day.guideLine||day.title,previous=day.day>1?week.overview?.[day.day-2]:null,next=day.day<5?week.days?.[day.day+1]?.title:null,terms=(day.words||[]).slice(0,3);
    const candidates=[
      day.story,
      `The main evidence for today's investigation is this: ${fact}`,
      grade<=3?`Young scientists can look closely, name what they notice, and tell how it connects to ${week.title}`:`Scientists study this evidence by observing details, comparing patterns, and connecting each result to the chapter question, “${week.title}”`,
      ...terms.map(word=>`${word.en} means ${word.meaning}. ${word.example||`This word helps explain the evidence in today's lesson.`}`),
      previous?`The previous reading showed that ${previous} Today's observation adds a new piece to that explanation.`:`This is the first step in the week's investigation, so it introduces the evidence that later readings will develop.`,
      next?`Next, students can extend the idea by asking, “${next}” This link helps the five readings form one connected scientific explanation.`:`Because this is the final reading, students should combine evidence from all five days instead of relying on only one fact.`,
      `A strong reader should identify the cause, structure, or relationship described in the text, then support an answer with a detail from the lesson.`,
      grade===6?`At Grade 6 level, the explanation should also consider how the evidence might change under different environmental conditions and distinguish an observation from an inference. This makes the conclusion more precise and scientifically defensible.`:`The goal is not only to remember a word. The goal is to use the word correctly when explaining what happened and why it matters.`
    ].filter(Boolean);
    const chosen=[];let total=0;
    for(const sentence of candidates){const clean=String(sentence).trim().replace(/\s+/g," "),size=countWords(clean);if(total>=target-12&&total+size>target+12)continue;chosen.push(/[.!?]$/.test(clean)?clean:`${clean}.`);total+=size;if(total>=target-8)break}
    const padding=[`Use the picture and the vocabulary clues to check the explanation. Every claim should match something that can be observed, measured, or supported by the reading.`,`After reading, summarize the central idea in one sentence and explain how it contributes to the larger chapter question.`];
    for(const sentence of padding){if(total>=target-10)break;chosen.push(sentence);total+=countWords(sentence)}
    return{text:chosen.join(" "),count:total,target,grade};
  }
  function lessonExercises(week,day){
    const fact=week.overview?.[day.day-1]||day.guideLine||day.story,words=(day.words||[]).slice(0,3),source=(day.questions||[]).find(question=>Array.isArray(question.choices)&&question.choices.length>=2);
    const fallbackChoices=[fact,"The evidence is unrelated to the chapter question.","Only the picture matters; the reading gives no evidence."];
    const first={type:"mcq",prompt:source?.prompt||"Which statement best explains today's evidence?",choices:source?.choices||fallbackChoices,right:Number(source?.right)||0,why:source?.why||fact};
    const vocabulary=words[0]||{en:"evidence",meaning:"information used to support an explanation"},otherMeanings=words.slice(1).map(word=>word.meaning);
    const gapChoices=[vocabulary.meaning,...otherMeanings,"a detail that is not connected to the lesson"].slice(0,4);
    const pairs=words.length?words.map(word=>({left:word.en,right:word.meaning})):[{left:"evidence",right:"information that supports an explanation"},{left:"observe",right:"look carefully and record details"},{left:"compare",right:"look for similarities and differences"}];
    return[
      first,
      {type:"truefalse",prompt:"Decide whether the evidence statement is true or false.",statement:fact,answer:true,why:"The statement comes directly from today's chapter evidence."},
      {type:"gap",prompt:"Complete the vocabulary meaning.",statement:`${vocabulary.en} means _____.`,choices:gapChoices,right:0,why:`${vocabulary.en} means ${vocabulary.meaning}.`},
      {type:"matching",prompt:"Match each science word to its meaning.",pairs,why:"Each word must be connected to the meaning used in the reading."},
      {type:"sequence",prompt:"Put the scientific thinking steps in the best order.",steps:[`Observe the evidence in ${day.short}.`,`Connect the evidence to “${week.title}”`,`Explain the conclusion using a detail from the reading.`],why:"Scientific explanations begin with observations, connect evidence to a question, and end with a supported conclusion."}
    ];
  }
  function scienceExerciseKey(week,day,index){return`science:${week.number}:${day.day}:${index+1}`}
  function scienceAnswerCorrect(exercise,answer){
    if(exercise.type==="truefalse")return answer===exercise.answer;
    if(exercise.type==="matching")return Array.isArray(answer)&&exercise.pairs.every((pair,index)=>answer[index]===pair.right);
    if(exercise.type==="sequence")return Array.isArray(answer)&&exercise.steps.every((step,index)=>answer[index]===step);
    return Number(answer)===Number(exercise.right);
  }

  const root=document.createElement("div");root.id="unifiedWorldRoot";root.className="unified-world-root";document.body.appendChild(root);
  const mathReturn=document.createElement("button");mathReturn.id="unifiedMathReturn";mathReturn.className="unified-math-return";mathReturn.textContent="← Math World";mathReturn.hidden=true;document.body.appendChild(mathReturn);
  document.body.classList.add("unified-shell-on");

  function registerLearningAnswer({key,correct,index=1}={}){
    key=String(key||"");const position=Math.max(1,Number(index)||1);
    if(!key)return{gold:0,duplicate:true};
    state.answerLedger=state.answerLedger&&typeof state.answerLedger==="object"?state.answerLedger:{};
    const entry=state.answerLedger[key]||{rewarded:false,penalized:false};
    if((state.rewardedMathQuestions||[]).includes(key))entry.rewarded=true;
    if(correct){
      if(entry.rewarded)return{gold:0,duplicate:true};
      entry.rewarded=true;state.answerLedger[key]=entry;
      state.rewardedMathQuestions=Array.isArray(state.rewardedMathQuestions)?state.rewardedMathQuestions:[];
      if(key.startsWith("practice:")&&!state.rewardedMathQuestions.includes(key))state.rewardedMathQuestions.push(key);
      save();addGold(position,`Question ${position} correct`);return{gold:position,duplicate:false};
    }
    if(position===1||entry.penalized||entry.rewarded)return{gold:0,duplicate:true};
    const penalty=position-1;entry.penalized=true;state.answerLedger[key]=entry;save();addGold(-penalty,`Question ${position} incorrect`);return{gold:-penalty,duplicate:false};
  }
  window.registerLearningAnswer=registerLearningAnswer;
  window.registerAdventureMathCorrect=questionKey=>registerLearningAnswer({key:questionKey,correct:true,index:Number(String(questionKey).split(":").pop())||1});

  if(!state.testGrantApplied){
    const grant=10000-gold();
    if(grant)window.AquariumDemo?.addResources?.({gold:grant,reason:"Temporary test balance"});
    state.testGrantApplied=true;save();
  }

  function shell(content,{back=false,title="Learning Worlds"}={}){
    const stats=scienceStats();
    const activityResource=state.screen==="science"?`<span><i>✓</i><b>${stats.completed}/${stats.totalReadings}</b><small>Readings</small></span>`:`<span><i>◷</i><b>${timeText(state.mathSeconds)}</b><small>Math study</small></span>`;
    root.hidden=false;
    root.innerHTML=`<header class="uw-topbar"><button class="uw-brand" data-go="cockpit"><span>M</span>${miniRobotAvatar()}<b>International Math</b></button><div class="uw-location"><small>ORBITAL LEARNING STATION</small><strong>${esc(title)}</strong></div><div class="uw-resources"><span><i>●</i><b>${gold()}</b><small>Gold${state.testUnlockAll?" · TEST":""}</small></span><span><i>◈</i><b>${stats.open}/${stats.total}</b><small>Life cards${state.testUnlockAll?" · TEST":""}</small></span>${activityResource}</div>${back?'<button class="uw-back" data-back>← Back</button>':''}</header><main class="uw-view">${content}</main><div class="uw-toast" id="uwToast" hidden></div>`;
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
    if(state.screen==="math"&&state.mathArea!=="overview"){state.mathArea="overview";save();renderMath();return}
    go("cockpit");
  }

  function renderCockpit(){
    const stats=scienceStats();
    shell(`<section class="uw-cockpit"><img src="assets/cockpit-home-v1.png" alt="Bright learning station cockpit"><div class="uw-cockpit-shade"></div><div class="uw-cockpit-copy"><p>WELCOME BACK, EXPLORER</p><h1>Choose a learning world</h1><span>One cockpit. Two active rooms. Two worlds reserved for the next subjects.</span></div><div class="uw-world-grid"><button class="uw-world-card science" data-world="science"><small>ACTIVE ROOM</small><strong>Science Lab</strong><span>Lessons · life cards · terrains · microscope · aquarium</span><em>${stats.lessons} weeks · ${stats.open}/${stats.total} life cards unlocked</em></button><button class="uw-world-card math" data-world="math"><small>ACTIVE ROOM</small><strong>Math World</strong><span>Books · papers · tests · helper robot · ship model</span><em>Practice rewards rise +1, +2, +3… · 60 minutes → ${GOLD_PER_HOUR} Gold</em></button><button class="uw-world-card history" data-world="history"><small>RESERVED WORLD</small><strong>History World</strong><span>A protected space for timelines, people and civilizations.</span><em>Background ready · lessons added later</em></button><button class="uw-world-card geography" data-world="geography"><small>RESERVED WORLD</small><strong>Geography World</strong><span>A protected space for maps, places and Earth systems.</span><em>Background ready · lessons added later</em></button></div><div class="uw-cockpit-rule"><b>ONE REWARD RULE</b><span>In every practice set, Question n gives +n Gold when correct. From Question 2 onward, the first wrong answer deducts n−1 Gold. A question can reward or deduct only once.</span></div></section>`,{title:"Cockpit"});
    root.querySelectorAll("[data-world]").forEach(button=>button.onclick=()=>go(button.dataset.world));
  }

  function labNav(active){return`<nav class="lab-nav" aria-label="Science Lab areas">${[["overview","Lab map"],["books","Science books"],["cards","Life cards"],["shop","Creature shop"],["terrain","Terrain world"],["micro","Microscopic world"],["aquarium","Aquarium depths"]].map(([id,label])=>`<button class="${active===id?"active":""}" data-lab-area="${id}">${label}</button>`).join("")}</nav>`}
  function renderScience(){
    if(state.openDay)return renderLesson();
    if(state.openWeek)return renderWeek();
    if(state.labArea==="books")return renderScienceBooks();
    if(state.labArea==="cards")return renderCards();
    if(state.labArea==="shop")return renderCreatureShop();
    if(state.labArea==="terrain")return renderTerrain();
    if(state.labArea==="micro")return renderMicroscope();
    if(state.labArea==="aquarium")return renderAquarium();
    const stats=scienceStats();
    shell(`<section class="uw-lab-home"><img class="uw-room-bg" src="assets/science-earth-lab-v1.png" alt="Modern Science Lab"><div class="uw-room-filter"></div>${labNav("overview")}<div class="uw-room-title"><p>SCIENCE LAB · CENTRAL RESEARCH DECK</p><h1>Learn it. Turn it into a living world.</h1><span>Every science lesson stays in one room and produces a useful card when the reading is completed.</span></div><div class="lab-area-grid"><button data-lab-area="books"><i>▥</i><small>LEARN</small><b>Science Books</b><span>${stats.lessons} weeks from the existing Grade 4, 5 and 6 library.</span></button><button data-lab-area="cards"><i>◈</i><small>COLLECT</small><b>Life Card Archive</b><span>See all ${stats.total} organisms and review their field records.</span></button><button data-lab-area="shop"><i>●</i><small>SHOP</small><b>Creature Market</b><span>Buy extra lesson specimens and special visitors for each terrain.</span></button><button data-lab-area="terrain"><i>⌁</i><small>BUILD</small><b>Terrain World</b><span>Turn completed chapter habitats into interactive landscape scenes.</span></button><button data-lab-area="micro"><i>◎</i><small>MAGNIFY</small><b>Microscopic World</b><span>Insert an unlocked microbe card to create its culture environment.</span></button><button data-lab-area="aquarium"><i>≈</i><small>DESCEND</small><b>Aquarium Depths</b><span>Scroll from sunlight to deeper water and meet organisms by depth.</span></button></div><aside class="lab-logic-strip"><b>LESSON</b><i>→</i><b>SCIENCE CARD</b><i>→</i><b>WORLD</b><i>+</i><b>SHOP VISITORS</b></aside></section>`,{back:true,title:"Science Lab"});
    bindLabNav();
  }
  function bindLabNav(){root.querySelectorAll("[data-lab-area]").forEach(button=>button.onclick=()=>{state.labArea=button.dataset.labArea;state.openWeek=state.openDay=0;save();renderScience()})}

  function renderScienceBooks(){
    const weeks=Object.values(allWeeks());
    const grade=Number(state.scienceGrade)||4,filtered=weeks.filter(week=>Number(week.source?.grade||4)===grade);
    shell(`<section class="uw-panel science-library"><div class="panel-backdrop" style="--panel-image:url('assets/living-room-infinity-library-v1.png')"></div>${labNav("books")}<header class="panel-heading"><div><p>SCIENCE LAB · READING ARCHIVE</p><h1>Daily Science Books</h1><span>Choose a book, then a week. Grade 4 and 5 readings are about 150 words; Grade 6 readings are about 200 words. Every lesson ends with five different activity types.</span></div><div class="grade-tabs">${[4,5,6].map(number=>`<button class="${grade===number?"active":""}" data-grade="${number}">Grade ${number}</button>`).join("")}</div></header><div class="science-week-grid">${filtered.map(week=>{const done=weekProgress(week.number);return`<button class="science-week-tile" data-week="${week.number}" style="--week-image:url('${esc(week.hero)}')"><span class="week-photo"></span><div><small>GRADE ${grade} · WEEK ${week.source?.bookWeek||week.number}</small><strong>${esc(week.title)}</strong><em>${done}/5 days complete · ${readingTarget(grade)}-word reading</em><i><b style="width:${done*20}%"></b></i></div></button>`}).join("")}</div></section>`,{back:true,title:`Science Lab · Grade ${grade}`});
    bindLabNav();
    root.querySelectorAll("[data-grade]").forEach(button=>button.onclick=()=>{state.scienceGrade=Number(button.dataset.grade);save();renderScienceBooks()});
    root.querySelectorAll("[data-week]").forEach(button=>button.onclick=()=>{state.openWeek=Number(button.dataset.week);save();renderWeek()});
  }
  function renderWeek(){
    const week=allWeeks()[state.openWeek];if(!week){state.openWeek=0;return renderScienceBooks()}
    shell(`<section class="uw-panel week-reader" style="--hero:url('${esc(week.hero)}')"><div class="week-hero"><div><p>${esc(week.subtitle)}</p><h1>${esc(week.title)}</h1><span>${esc(week.overview?.join(" · ")||"")}</span></div><b>${weekProgress(week.number)}/5<br><small>DAYS COMPLETE</small></b></div><div class="day-path">${week.days.slice(1).map(day=>`<button data-day="${day.day}" class="${isComplete(week.number,day.day)?"complete":""}"><span>${isComplete(week.number,day.day)?"✓":day.day}</span><div><small>DAY ${day.day} · ${esc(day.short)}</small><strong>${esc(day.title)}</strong><em>${isComplete(week.number,day.day)?"Card created":"Read to unlock its card"}</em></div></button>`).join("")}</div><aside class="week-card-rule"><b>WHAT UNLOCKS?</b><span>Finishing a day records the reading and creates that day's science card. Organism cards only become visible in a world after their matching lesson is complete.</span></aside></section>`,{back:true,title:`Science Week ${week.number}`});
    root.querySelectorAll("[data-day]").forEach(button=>button.onclick=()=>{state.openDay=Number(button.dataset.day);save();renderLesson()});
  }
  function scienceExerciseMarkup(week,day){
    state.scienceExerciseIndex=state.scienceExerciseIndex&&typeof state.scienceExerciseIndex==="object"?state.scienceExerciseIndex:{};state.scienceAnswers=state.scienceAnswers&&typeof state.scienceAnswers==="object"?state.scienceAnswers:{};state.scienceExerciseFeedback=state.scienceExerciseFeedback&&typeof state.scienceExerciseFeedback==="object"?state.scienceExerciseFeedback:{};
    const lessonKey=`${week.number}:${day.day}`,exercises=lessonExercises(week,day),completeCount=exercises.filter((exercise,index)=>scienceAnswerCorrect(exercise,state.scienceAnswers[scienceExerciseKey(week,day,index)])).length,index=Math.max(0,Math.min(exercises.length-1,Number(state.scienceExerciseIndex[lessonKey])||0));
    if(completeCount===exercises.length)return`<section class="science-practice complete"><small>SCIENCE PRACTICE · 5/5 COMPLETE</small><h2>Excellent evidence work!</h2><p>You completed multiple choice, true or false, gap filling, matching and sequencing.</p><div class="practice-gold-rule"><b>GOLD RULE</b><span>Correct answers: +1, +2, +3, +4, +5 Gold. A first wrong answer from Question 2 onward deducts 1, 2, 3 or 4 Gold.</span></div><button id="finishScienceDay" ${isComplete(week.number,day.day)?"disabled":""}>${isComplete(week.number,day.day)?"Lesson complete · card created":"Complete lesson & create card"}</button></section>`;
    const exercise=exercises[index],key=scienceExerciseKey(week,day,index),answer=state.scienceAnswers[key],good=scienceAnswerCorrect(exercise,answer),feedback=state.scienceExerciseFeedback[key]||"",reward=index+1,penalty=Math.max(0,index);
    let activity="";
    if(exercise.type==="truefalse")activity=`<div class="science-statement"><small>EVIDENCE STATEMENT</small><p>${esc(exercise.statement)}</p></div><div class="science-answer-grid"><button data-science-answer="true" class="${answer===true?"selected":""}">True</button><button data-science-answer="false" class="${answer===false?"selected":""}">False</button></div>`;
    else if(exercise.type==="matching"){
      const options=exercise.pairs.map(pair=>pair.right).reverse();activity=`<div class="structured-exercise">${exercise.pairs.map((pair,row)=>`<label><b>${esc(pair.left)}</b><select data-structured-row="${row}"><option value="">Choose a meaning</option>${options.map(option=>`<option value="${esc(option)}" ${Array.isArray(answer)&&answer[row]===option?"selected":""}>${esc(option)}</option>`).join("")}</select></label>`).join("")}</div><button class="check-structured" id="checkScienceStructured">Check matches</button>`;
    }else if(exercise.type==="sequence"){
      const options=[exercise.steps[1],exercise.steps[2],exercise.steps[0]];activity=`<div class="structured-exercise sequence">${exercise.steps.map((_,row)=>`<label><b>Step ${row+1}</b><select data-structured-row="${row}"><option value="">Choose a step</option>${options.map(option=>`<option value="${esc(option)}" ${Array.isArray(answer)&&answer[row]===option?"selected":""}>${esc(option)}</option>`).join("")}</select></label>`).join("")}</div><button class="check-structured" id="checkScienceStructured">Check order</button>`;
    }else{activity=`${exercise.type==="gap"?`<div class="science-statement"><small>COMPLETE THE GAP</small><p>${esc(exercise.statement)}</p></div>`:""}<div class="science-answer-grid">${exercise.choices.map((choice,choiceIndex)=>`<button data-science-answer="${choiceIndex}" class="${Number(answer)===choiceIndex?"selected":""}"><span>${String.fromCharCode(65+choiceIndex)}</span>${esc(choice)}</button>`).join("")}</div>`}
    return`<section class="science-practice"><header><div><small>SCIENCE PRACTICE · QUESTION ${index+1}/5</small><h2>${esc(exercise.prompt)}</h2></div><span>${completeCount}/5 correct</span></header><div class="practice-type">${({mcq:"MULTIPLE CHOICE",truefalse:"TRUE OR FALSE",gap:"GAP FILLING",matching:"MATCHING",sequence:"SEQUENCING"})[exercise.type]}</div>${activity}<p class="practice-feedback ${good?"good":feedback?"bad":""}">${esc(feedback)}</p><div class="practice-gold-rule"><b>GOLD</b><span>Correct: +${reward}${penalty?` · First wrong: −${penalty}`:" · Question 1 has no wrong-answer penalty"}</span></div>${good?`<button id="scienceNextExercise">${index===exercises.length-1?"Show lesson result":"Next activity →"}</button>`:""}</section>`;
  }
  function submitScienceExercise(week,day,index,answer){
    const exercises=lessonExercises(week,day),exercise=exercises[index],key=scienceExerciseKey(week,day,index),correct=scienceAnswerCorrect(exercise,answer);state.scienceAnswers[key]=answer;
    const result=registerLearningAnswer({key,correct,index:index+1}),goldNote=result.gold?` ${result.gold>0?"+":""}${result.gold} Gold.`:"";
    state.scienceExerciseFeedback[key]=correct?`Correct! ${exercise.why}${goldNote}`:`Not yet. Read the evidence and try again.${goldNote}`;save();renderLesson();
  }
  function bindScienceExercise(week,day){
    const lessonKey=`${week.number}:${day.day}`,index=Math.max(0,Math.min(4,Number(state.scienceExerciseIndex?.[lessonKey])||0)),exercise=lessonExercises(week,day)[index];
    root.querySelectorAll("[data-science-answer]").forEach(button=>button.onclick=()=>{const raw=button.dataset.scienceAnswer,answer=exercise.type==="truefalse"?raw==="true":Number(raw);submitScienceExercise(week,day,index,answer)});
    const structured=root.querySelector("#checkScienceStructured");if(structured)structured.onclick=()=>{const answer=[...root.querySelectorAll("[data-structured-row]")].map(select=>select.value);if(answer.some(value=>!value)){state.scienceExerciseFeedback[scienceExerciseKey(week,day,index)]="Choose an answer for every row before checking.";save();renderLesson();return}submitScienceExercise(week,day,index,answer)};
    const next=root.querySelector("#scienceNextExercise");if(next)next.onclick=()=>{state.scienceExerciseIndex[lessonKey]=Math.min(4,index+1);save();renderLesson()};
    const finish=root.querySelector("#finishScienceDay");if(finish&&!finish.disabled)finish.onclick=()=>completeLesson(week,day);
  }
  function renderLesson(){
    const week=allWeeks()[state.openWeek],day=week?.days?.[state.openDay];if(!day){state.openDay=0;return renderWeek()}
    const reading=expandedScienceReading(week,day);
    shell(`<article class="lesson-reader"><header><img src="${esc(day.image||week.hero)}" alt="${esc(day.title)}"><div><p>SCIENCE LAB · GRADE ${reading.grade} · WEEK ${week.number} · DAY ${day.day}</p><h1>${esc(day.title)}</h1><span>${esc(day.guideLine||day.short)}</span><b class="reading-length">${reading.count} words · target about ${reading.target}</b></div></header><div class="lesson-columns"><main><section class="expanded-reading"><small>BOOK-BASED READING</small><h2>${esc(day.short)}</h2><p>${esc(reading.text)}</p></section>${scienceExerciseMarkup(week,day)}</main><aside><section class="vocab-card"><small>VOCABULARY IN CONTEXT</small>${(day.words||[]).map(word=>`<div><b>${esc(word.en)}</b><span>${esc(word.meaning)}</span><em>${esc(word.example||"")}</em></div>`).join("")}</section><section class="reward-card"><small>SCIENCE CARD OUTPUT</small><b>${esc(day.reward||day.short)}</b><span>${isComplete(week.number,day.day)?"✓ Already created":"Complete all five activities to create this card."}</span></section></aside></div></article>`,{back:true,title:`Science Reading · Day ${day.day}`});
    bindScienceExercise(week,day);
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
  function renderCreatureShop(){
    const all=specimens(),lessonCards=all.filter(card=>!card.shopOnly),visitors=all.filter(card=>card.shopOnly);
    const shopCard=card=>{const owned=specimenUnlocked(card),copies=Number(state.cardCopies?.[card.id])||0,cost=Number(card.cost)||(["plant","microbe"].includes(card.type)?35:card.collection==="aquatic"?75:60),canBuy=card.shopOnly||owned;return`<article class="creature-shop-card ${owned?"owned":"locked"}" style="--shop-image:url('${esc(card.image)}')"><div class="shop-creature-art">${specimenSprite(card,"shop-real")}<small>${esc(card.terrain||card.collection||card.type||"Science habitat")}</small></div><div><small>${card.shopOnly?"SHOP-ONLY HABITAT VISITOR":"LESSON SPECIMEN COPY"}</small><h3>${esc(card.name)}</h3><p>${esc(card.clue||card.fact||card.success||"A living specimen for a matching habitat.")}</p><b>${card.shopOnly&&owned?"OWNED":`● ${cost} Gold`}${!card.shopOnly&&copies?` · ${copies} extra`:""}</b><button data-buy-creature="${esc(card.id)}" ${!canBuy||card.shopOnly&&owned?"disabled":""}>${card.shopOnly?(owned?"Added to collection":"Buy & unlock now"):(canBuy?"Buy another specimen":"Complete its lesson first")}</button></div></article>`};
    shell(`<section class="uw-panel creature-shop"><div class="panel-backdrop" style="--panel-image:url('assets/science-earth-lab-thumb-v2.png')"></div>${labNav("shop")}<header class="panel-heading"><div><p>SCIENCE LAB · CREATURE MARKET</p><h1>Build every living world</h1><span>Lesson species still begin with learning. Buy extra copies after a lesson, or purchase special habitat visitors that sit outside the book curriculum.</span></div><b class="shop-balance">● ${gold()} GOLD</b></header><section class="shop-section"><div class="shop-section-title"><div><small>NEW · OUTSIDE THE LESSONS</small><h2>Terrain visitors</h2></div><span>${visitors.filter(specimenUnlocked).length}/${visitors.length} owned</span></div><div class="creature-shop-grid">${visitors.map(shopCard).join("")}</div></section><section class="shop-section"><div class="shop-section-title"><div><small>COMPLETE COLLECTION</small><h2>All designed lesson species</h2></div><span>Buy additional display copies</span></div><div class="creature-shop-grid">${lessonCards.map(shopCard).join("")}</div></section></section>`,{back:true,title:"Science Lab · Creature Shop"});
    bindLabNav();root.querySelectorAll("[data-buy-creature]").forEach(button=>button.onclick=()=>purchaseShopSpecimen(button.dataset.buyCreature));
  }
  function purchaseShopSpecimen(id){
    const card=specimens().find(item=>item.id===id);if(!card)return;const cost=Number(card.cost)||(["plant","microbe"].includes(card.type)?35:card.collection==="aquatic"?75:60);
    if(card.shopOnly&&(state.shopOwned||[]).includes(card.id))return;if(!card.shopOnly&&!specimenUnlocked(card)){toast("Complete the matching Science lesson before buying an extra specimen.");return}
    if(!spendGold(cost)){toast(`You need ${cost} Gold.`);return}
    if(card.shopOnly){state.shopOwned=Array.isArray(state.shopOwned)?state.shopOwned:[];state.shopOwned.push(card.id)}else{state.cardCopies=state.cardCopies&&typeof state.cardCopies==="object"?state.cardCopies:{};state.cardCopies[card.id]=(Number(state.cardCopies[card.id])||0)+1}
    save();renderCreatureShop();toast(`${card.name} was added and is ready in its matching habitat.`);
  }
  function lifeCard(card){const open=specimenUnlocked(card),unlock=card.unlock||[0,0],copies=1+(Number(state.cardCopies?.[card.id])||0);return`<button class="life-card ${open?"unlocked":"locked"}" data-life-card="${esc(card.id)}"><span class="life-card-art" ${open?`style="--card-image:url('${esc(card.image)}')"`:""}>${open?`<i>${esc(card.icon||"◈")}</i>`:"<b>?</b>"}</span><small>${open?"UNLOCKED":"LOCKED"} · ${esc(card.type||card.role||"organism")}</small><strong>${open?esc(card.name):card.shopOnly?esc(card.name):"Unknown specimen"}</strong><em>${open?`Open field record · ${copies} specimen${copies===1?"":"s"}`:card.shopOnly?`Available in Creature Shop · ${card.cost} Gold`:`Complete Week ${unlock[0]} · Day ${unlock[1]}`}</em></button>`}
  function bindLifeCards(){root.querySelectorAll("[data-life-card]").forEach(button=>button.onclick=()=>openLifeCard(button.dataset.lifeCard))}
  function openLifeCard(id){
    const card=specimens().find(item=>item.id===id);if(!card)return;const open=specimenUnlocked(card),unlock=card.unlock||[0,0],homeNames=(card.homes||[]).map(n=>habitats()[n]?.name).filter(Boolean),copies=1+(Number(state.cardCopies?.[id])||0),cost=card.collection==="aquatic"||card.collection==="lunar"?25:15;
    const lockedRoute=card.shopOnly?"Science Lab → Creature Shop":`Science Books → Week ${unlock[0]} → Day ${unlock[1]}`,lockedCopy=card.shopOnly?`Purchase this special habitat visitor for ${card.cost} Gold. It is additional encyclopedia content outside the lesson sequence.`:"The image and full record appear only after the matching Science reading is completed.",actionLabel=card.shopOnly?"Open Creature Shop":open?"Review source lesson":"Go to unlock lesson";
    const modal=document.createElement("div");modal.className="uw-modal";modal.innerHTML=`<article class="life-record ${open?"":"locked"}"><button class="modal-close">×</button><div class="record-art" ${open?`style="--record-image:url('${esc(card.image)}')"`:""}>${open?specimenSprite(card,"record-real"):"<b>?</b>"}</div><div><small>${open?"HOLOGRAM LIFE RECORD":"LOCKED SCIENCE RECORD"}</small><h2>${open?esc(card.name):card.shopOnly?esc(card.name):"Specimen locked"}</h2><p>${open?esc(card.clue||card.fact||""):lockedCopy}</p><dl><div><dt>TYPE / ROLE</dt><dd>${esc(card.type||card.role||"Living organism")}</dd></div><div><dt>WHERE IT GOES</dt><dd>${open?esc(homeNames.join(" · ")||`Aquarium · ${card.depth||"matched depth"}`):lockedRoute}</dd></div><div><dt>HABITAT EVIDENCE</dt><dd>${open?esc(card.success||`Depth ${card.depth}. Food: ${card.food}.`):card.shopOnly?esc(card.success||"Use this specimen in its matching terrain after purchase."):"Complete the reading first."}</dd></div>${open?`<div><dt>SPECIMEN COPIES</dt><dd>${copies} available · extra copies let this species appear more often in its world.</dd></div>`:""}</dl>${open?`<button class="record-buy" id="buyExtraSpecimen">Buy extra specimen · ${cost} Gold</button>`:""}<button class="record-action" data-open-source="${unlock[0]}:${unlock[1]}">${actionLabel} →</button></div></article>`;document.body.appendChild(modal);modal.querySelector(".modal-close").onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};modal.querySelector("[data-open-source]").onclick=()=>{modal.remove();state.screen="science";if(card.shopOnly){state.labArea="shop"}else{state.labArea="books";state.openWeek=unlock[0];state.openDay=unlock[1]}save();renderScience()};const buy=modal.querySelector("#buyExtraSpecimen");if(buy)buy.onclick=()=>{if(!spendGold(cost)){toast(`You need ${cost} Gold. Study Math to earn it.`);return}state.cardCopies=state.cardCopies||{};state.cardCopies[id]=(Number(state.cardCopies[id])||0)+1;save();modal.remove();renderScience();toast(`${card.name}: extra specimen card added.`)};
  }

  function terrainEntries(){const terrainPattern=/World|Forest|Wetland|Pond|Soil|Coral|Garden|Rain|Compost|Moon|Savanna|Rainforest|Tundra|Coast/i;return Object.entries(habitats()).map(([week,item])=>({week:Number(week),...item})).filter(item=>terrainPattern.test(item.name)).slice(0,24)}
  function renderTerrain(){
    const entries=terrainEntries(),selected=entries.find(item=>item.week===Number(state.selectedTerrain))||entries[0],open=weekProgress(selected.week)>=5,inhabitants=specimens().filter(item=>(item.homes||[]).includes(selected.week));
    shell(`<section class="uw-panel terrain-world"><div class="panel-backdrop" style="--panel-image:url('${esc(selected.background)}')"></div>${labNav("terrain")}<header class="terrain-heading"><div><p>SCIENCE LAB · HOLOGRAPHIC TERRAIN WALL</p><h1>${esc(selected.name)}</h1><span>${esc(selected.region)} · ${esc(selected.zone)}</span></div><b>${open?"TERRAIN ACTIVE":`${weekProgress(selected.week)}/5 LESSON DAYS`}</b></header><div class="terrain-layout"><aside>${entries.map(item=>`<button data-terrain="${item.week}" class="${item.week===selected.week?"active":""} ${weekProgress(item.week)>=5?"open":"locked"}" style="--thumb:url('${esc(item.background)}')"><i></i><span><small>WEEK ${item.week}</small><b>${esc(item.name)}</b><em>${weekProgress(item.week)>=5?"Open world":"Locked · finish 5 days"}</em></span></button>`).join("")}</aside><main class="terrain-stage ${open?"open":"locked"}" style="--terrain:url('${esc(selected.background)}')"><div class="terrain-atmosphere">${Array.from({length:12},(_,i)=>`<i style="--i:${i};--x:${6+i*7}%;--y:${14+(i%8)*9}%"></i>`).join("")}</div>${open?inhabitants.map((item,index)=>`<button data-life-card="${item.id}" class="terrain-specimen ${specimenUnlocked(item)?"open":"locked"} ${item.shopOnly?"real":""}" style="--x:${16+(index*23)%72}%;--y:${28+(index*31)%55}%">${specimenUnlocked(item)?specimenSprite(item,"terrain-real"):"?"}<small>${specimenUnlocked(item)?esc(item.name):"Study to reveal"}</small></button>`).join(""):`<div class="world-lock"><b>🔒</b><h2>Terrain locked</h2><p>Complete all five days of Science Week ${selected.week}. The finished chapter becomes this living hologram.</p><button data-open-week="${selected.week}">Open Science Week ${selected.week}</button></div>`}</main></div></section>`,{back:true,title:"Science Lab · Terrain World"});
    bindLabNav();bindLifeCards();root.querySelectorAll("[data-terrain]").forEach(button=>button.onclick=()=>{state.selectedTerrain=Number(button.dataset.terrain);save();renderTerrain()});root.querySelector("[data-open-week]")?.addEventListener("click",e=>{state.labArea="books";state.openWeek=Number(e.currentTarget.dataset.openWeek);save();renderScience()});
  }

  function renderMicroscope(){
    const cards=specimens().filter(item=>item.collection==="microscopic"),selected=cards.find(item=>item.id===state.selectedMicro&&specimenUnlocked(item));
    shell(`<section class="uw-panel micro-world"><div class="panel-backdrop" style="--panel-image:url('assets/microscopic-world-v1.png')"></div>${labNav("micro")}<header class="panel-heading"><div><p>SCIENCE LAB · MICROSCOPIC WORLD</p><h1>Insert a life card into the microscope</h1><span>Each unlocked organism creates a different culture scene. Locked cards show the exact reading needed.</span></div></header><div class="micro-layout"><aside class="micro-card-tray">${cards.map(card=>`<button data-micro="${card.id}" class="${specimenUnlocked(card)?"open":"locked"} ${selected?.id===card.id?"active":""}"><b>${specimenUnlocked(card)?card.icon:"?"}</b><span><strong>${specimenUnlocked(card)?esc(card.name):"Locked specimen"}</strong><small>${specimenUnlocked(card)?"Insert card":`Week ${card.unlock[0]} · Day ${card.unlock[1]}`}</small></span></button>`).join("")}</aside><main class="microscope-stage ${selected?"active":"empty"}" style="--micro-image:url('${esc(selected?.image||"assets/microscopic-world-v1.png")}');--focus:${esc(selected?.focus||"50% 50%")} ">${selected?`<div class="micro-lens"><div>${Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${7+(i%7)*12}%;--y:${8+(i*17)%76}%"></i>`).join("")}</div></div><section><small>${esc(selected.type).toUpperCase()} CULTURE</small><h2>${esc(selected.name)}</h2><p>${esc(selected.clue)}</p><b>${esc(selected.success)}</b></section>`:`<div class="empty-microscope"><span>◎</span><h2>No card inserted</h2><p>Complete a matching Science lesson, then choose its card from the tray.</p></div>`}</main></div></section>`,{back:true,title:"Science Lab · Microscopic World"});
    bindLabNav();root.querySelectorAll("[data-micro]").forEach(button=>button.onclick=()=>{const card=cards.find(item=>item.id===button.dataset.micro);if(!specimenUnlocked(card)){openLifeCard(card.id);return}state.selectedMicro=card.id;save();renderMicroscope()});
  }

  function renderAquarium(){
    const marine=specimens().filter(item=>item.collection==="aquatic");
    shell(`<section class="uw-panel aquarium-world"><div class="panel-backdrop" style="--panel-image:url('assets/coral-reef-habitat-v1.png')"></div>${labNav("aquarium")}<header class="panel-heading aquarium-heading"><div><p>SCIENCE LAB · AQUATIC OBSERVATORY</p><h1>Scroll through Aquarium Depths</h1><span>Lesson creatures appear after study. Shop-only visitors appear immediately after purchase and remain connected to their matching aquatic habitat.</span></div><b>SCROLL ↓</b></header><div class="depth-window"><div class="depth-stage"><div class="water-light"></div><div class="depth-ruler">${[0,5,10,20,30,40].map((depth,index)=>`<span style="top:${index*19}%">${depth===0?"SURFACE":`−${depth} m`}</span>`).join("")}</div>${Array.from({length:26},(_,i)=>`<i class="bubble" style="--i:${i};--x:${8+(i%13)*7}%;--y:${2+(i*11)%70}%"></i>`).join("")}${marine.map((card,index)=>{const open=specimenUnlocked(card),position=8+index*(80/Math.max(1,marine.length-1));return`<button data-life-card="${card.id}" class="depth-creature ${open?"open":"locked"} ${card.shopOnly?"shop-visitor":""}" style="--y:${position}%;--x:${18+(index*19)%68}%;--ax:${card.ax||"0%"};--ay:${card.ay||"0%"}">${open?(card.shopOnly?specimenSprite(card,"aquarium-real"):'<span></span>'):'<b>?</b>'}<small>${open?esc(card.name):card.shopOnly?`Creature Shop · ${card.cost} Gold`:`Week ${card.unlock[0]} · Day ${card.unlock[1]}`}</small></button>`}).join("")}</div></div></section>`,{back:true,title:"Science Lab · Aquarium Depths"});
    bindLabNav();bindLifeCards();
  }

  function robotConfiguration(){const fallback=Math.max(0,Math.min(5,(Number(state.robotLevel)||1)-1)),saved=state.robotConfig&&typeof state.robotConfig==="object"?state.robotConfig:{};return{head:Number.isFinite(Number(saved.head))?Math.max(0,Math.min(5,Number(saved.head))):fallback,arms:Number.isFinite(Number(saved.arms))?Math.max(0,Math.min(5,Number(saved.arms))):fallback,base:Number.isFinite(Number(saved.base))?Math.max(0,Math.min(5,Number(saved.base))):fallback}}
  function robotPartStyle(index,row){const safe=Math.max(0,Math.min(5,Number(index)||0)),modern=safe>=3,local=modern?safe-3:safe;return`--part-image:url('${modern?"assets/robot-parts-atlas-v2.png":"assets/robot-parts-atlas-v1.png"}');--part-x:${local*50}%;--part-y:${row*50}%`}
  function helperRobot(className="",forced=null){const config=forced||robotConfiguration();return`<span class="uw-robot ${className}" aria-label="Your customized Orbit robot avatar"><i class="robot-base" style="${robotPartStyle(config.base,2)}"></i><i class="robot-arms" style="${robotPartStyle(config.arms,1)}"></i><i class="robot-head" style="${robotPartStyle(config.head,0)}"></i></span>`}
  function miniRobotAvatar(){const config=robotConfiguration();return`<span class="uw-avatar" aria-hidden="true"><i style="${robotPartStyle(config.base,2)}"></i><i style="${robotPartStyle(config.arms,1)}"></i><i style="${robotPartStyle(config.head,0)}"></i></span>`}
  function shipFilter(index=state.shipStyle){return["none","hue-rotate(48deg) saturate(1.2)","hue-rotate(150deg) saturate(1.35)","hue-rotate(220deg) saturate(1.45)","grayscale(.72) brightness(1.25)","sepia(.7) saturate(1.8) hue-rotate(345deg)"][Number(index)||0]||"none"}
  function shipDisplay(index=state.shipStyle,className="",alt="Customized Moon Explorer"){const safe=Math.max(0,Math.min(11,Number(index)||0));if(safe<6)return`<img class="${className}" src="assets/adventure-ship-v2.png" style="filter:${shipFilter(safe)}" alt="${esc(alt)}">`;const local=safe-6,x=local%3*50,y=Math.floor(local/3)*100;return`<span class="ship-atlas ${className}" role="img" aria-label="${esc(alt)}" style="--ship-x:${x}%;--ship-y:${y}%"></span>`}
  function renderMath(){
    if(state.mathArea==="garage")return renderRobotGarage();
    if(state.mathArea==="moon")return renderMoonLanding();
    if(state.mathArea==="moon-lab")return renderMoonLab();
    const next=Math.ceil((state.mathSeconds+1)/3600)*3600,remaining=Math.max(0,next-state.mathSeconds);
    shell(`<section class="uw-math-room"><img class="uw-room-bg" src="assets/living-room-infinity-library-v1.png" alt="Modern mathematics library"><div class="uw-room-filter"></div><div class="math-heading"><p>MATHEMATICS WORLD</p><h1>Read. Solve. Build.</h1><span>All existing books and papers stay together here. In each practice set, correct Question n earns n Gold; the first wrong answer from Question 2 onward deducts n−1 Gold.</span></div><div class="math-launch-grid"><button data-math-target="practice"><i>∑</i><b>Interactive Practice</b><span>SMC · TIMO · Kangaroo question library</span></button><button data-math-target="test"><i>◷</i><b>Test Papers</b><span>Timed paper mode with saved answers</span></button><button data-math-target="papers"><i>▤</i><b>Book & PDF Shelf</b><span>Every original paper already uploaded</span></button></div><article class="math-timer-card"><small>REAL STUDY TIMER</small><strong id="mathStudyClock">${timeText(state.mathSeconds)}</strong><span id="mathRewardCountdown">${timeText(remaining)} until the next ${GOLD_PER_HOUR} Gold reward</span><i><b id="mathProgressBar" style="width:${state.mathSeconds%3600/36}%"></b></i><em>Time pauses when the page is hidden or inactive for 3 minutes.</em></article><article class="robot-bay">${helperRobot()}<div><small>YOUR AVATAR · MODULAR HELPER</small><h2>Orbit Robot</h2><p>Choose a head, arms or wings, and legs or base. The selected robot appears as your avatar throughout the learning station.</p><button id="openRobotGarage">Open Robot Garage →</button></div></article><article class="ship-bay">${shipDisplay(state.shipStyle,"math-ship","Customized Moon Lab ship")}<div><small>DECORATIVE MOON LAB TRANSPORT</small><h2>Moon Explorer</h2><p>Choose a color scheme or an entirely different ship body, then visit the lunar landing pad and Moon Lab.</p><button id="openMoonLanding">Visit Moon Landing →</button></div></article></section>`,{back:true,title:"Math World"});
    root.querySelectorAll("[data-math-target]").forEach(button=>button.onclick=()=>openLegacyMath(button.dataset.mathTarget));
    root.querySelector("#openRobotGarage").onclick=()=>{state.mathArea="garage";save();renderMath()};
    root.querySelector("#openMoonLanding").onclick=()=>{state.mathArea="moon";save();renderMath()};
  }
  function renderRobotGarage(){
    const config=robotConfiguration(),parts={head:["Friendly Visor","Sensor Dome","Navigator Head","Salvage Optics","Pearl Science Visor","Aurelius Protocol Head"],arms:["Library Grippers","Wing Arms","Laboratory Tools","Recycler Arms","Zero-G Science Arms","Protocol Translator Arms"],base:["Library Treads","Lunar Legs","Explorer Wheels","Recycler Treads","Hover Base","Protocol Legs"]},robotModels=[{name:"Library Orbit",cost:0},{name:"Lunar Scout",cost:180},{name:"Aurora Wing",cost:320},{name:"Salvage Rover",cost:240},{name:"Pearl Science Scout",cost:280},{name:"Aurelius Protocol",cost:360}],ships=[{name:"Arctic Blue",cost:0},{name:"Solar Gold",cost:90},{name:"Aurora Green",cost:110},{name:"Violet Nebula",cost:130},{name:"Lunar Silver",cost:150},{name:"Coral Sunrise",cost:170},{name:"Horizon Survey Shuttle",cost:220},{name:"Meridian Deep-space Cruiser",cost:300},{name:"Sunrise Rescue Carrier",cost:340},{name:"Sentinel Stellar Battleship",cost:480},{name:"USS Kepler Research Ring",cost:420},{name:"Violet Lunar Racer",cost:260}],ownedRobots=Array.isArray(state.ownedRobotModels)?state.ownedRobotModels:[0],ownedShips=Array.isArray(state.ownedShipStyles)?state.ownedShipStyles:[0];
    shell(`<section class="robot-garage"><div class="garage-copy"><p>ROBOT GARAGE · DECORATION ONLY</p><h1>Build your avatar</h1><span>Buy a robot model to unlock its head, arms or wings, and base. Purchased parts can be mixed freely and every change appears immediately across the station.</span></div><div class="garage-stage">${helperRobot("garage-robot")}<b>ORBIT · YOUR AVATAR</b></div><section class="robot-model-store"><header><small>ROBOT SHOWROOM</small><h2>Buy a complete model</h2></header><div>${robotModels.map((model,index)=>`<button data-robot-model="${index}" class="${ownedRobots.includes(index)?"owned":""}">${helperRobot("model-robot",{head:index,arms:index,base:index})}<b>${model.name}</b><em>${ownedRobots.includes(index)?"OWNED":`● ${model.cost} Gold`}</em></button>`).join("")}</div></section><div class="part-workbench">${Object.entries(parts).map(([kind,names])=>`<section><small>${kind==="head"?"HEAD":kind==="arms"?"ARMS / WINGS":"LEGS / BASE"}</small><div>${names.map((name,index)=>`<button data-robot-part="${kind}" data-part-index="${index}" class="${config[kind]===index?"active":""}" ${ownedRobots.includes(index)?"":"disabled"}><i class="part-preview ${kind}" style="${robotPartStyle(index,kind==="head"?0:kind==="arms"?1:2)}"></i><b>${name}</b><span>${config[kind]===index?"INSTALLED":ownedRobots.includes(index)?"Install":"Buy model first"}</span></button>`).join("")}</div></section>`).join("")}</div><section class="ship-paint-garage"><header><small>SHIP SHOWROOM</small><h2>Buy or equip a Moon Explorer</h2></header><div>${ships.map((ship,index)=>`<button data-ship-style="${index}" class="${Number(state.shipStyle)===index?"active":""}">${shipDisplay(index,"garage-ship",`${ship.name} ship`)}<b>${esc(ship.name)}</b><span>${ownedShips.includes(index)?Number(state.shipStyle)===index?"EQUIPPED":"Equip":`● ${ship.cost} Gold`}</span></button>`).join("")}</div></section></section>`,{back:true,title:"Math World · Robot Garage"});
    root.querySelectorAll("[data-robot-model]").forEach(button=>button.onclick=()=>purchaseRobotModel(Number(button.dataset.robotModel),robotModels));
    root.querySelectorAll("[data-robot-part]").forEach(button=>button.onclick=()=>{state.robotConfig=robotConfiguration();state.robotConfig[button.dataset.robotPart]=Number(button.dataset.partIndex);save();renderRobotGarage()});
    root.querySelectorAll("[data-ship-style]").forEach(button=>button.onclick=()=>purchaseShipStyle(Number(button.dataset.shipStyle),ships));
  }
  function purchaseRobotModel(index,models){state.ownedRobotModels=Array.isArray(state.ownedRobotModels)?state.ownedRobotModels:[0];if(!state.ownedRobotModels.includes(index)){const cost=models[index]?.cost||0;if(!spendGold(cost)){toast(`You need ${cost} Gold.`);return}state.ownedRobotModels.push(index)}state.robotConfig={head:index,arms:index,base:index};save();renderRobotGarage();toast(`${models[index].name} is now your avatar.`)}
  function purchaseShipStyle(index,ships){state.ownedShipStyles=Array.isArray(state.ownedShipStyles)?state.ownedShipStyles:[0];if(!state.ownedShipStyles.includes(index)){const cost=ships[index]?.cost||0;if(!spendGold(cost)){toast(`You need ${cost} Gold.`);return}state.ownedShipStyles.push(index)}state.shipStyle=index;save();renderRobotGarage();toast(`${ships[index].name} is equipped on the Moon landing screen.`)}
  function renderMoonLanding(){
    shell(`<section class="moon-landing"><img src="assets/moon-landing-garage-v1.png" alt="Moon landing pad with one exploration ship and one helper robot"><div class="moon-landing-shade"></div><div class="moon-landing-copy"><p>MOON LANDING · DECORATIVE WORLD</p><h1>Welcome to your lunar base</h1><span>Your selected Orbit avatar and Moon Explorer have landed. This exterior scene is a quiet gateway; it does not spend resources or change learning progress.</span><div><button id="enterMoonLab">Enter Moon Lab →</button><button id="moonGarage">Customize robot & ship</button></div></div><aside class="landing-loadout"><div class="landing-avatar">${miniRobotAvatar()}</div>${shipDisplay(state.shipStyle,"landing-ship","Currently equipped Moon Explorer")}<div><small>CURRENT LOADOUT</small><b>Orbit avatar · Ship style ${Number(state.shipStyle)+1}</b></div></aside></section>`,{back:true,title:"Moon Landing"});
    root.querySelector("#enterMoonLab").onclick=()=>{state.mathArea="moon-lab";save();renderMath()};root.querySelector("#moonGarage").onclick=()=>{state.mathArea="garage";save();renderMath()};
  }
  function renderMoonLab(){
    shell(`<section class="moon-lab"><img src="assets/moon-bio-lab-v1.png" alt="Interior of a futuristic Moon science laboratory"><div class="moon-lab-shade"></div><div class="moon-lab-heading"><p>PRIVATE MOON LAB · DECORATION ONLY</p><h1>A world of your own</h1><span>Display your robot and ship collection here. The rooms are visual spaces only, so they never interfere with Science lessons or Math rewards.</span></div><div class="moon-lab-avatar">${helperRobot("moon-avatar")}<small>YOUR ORBIT AVATAR</small></div><div class="moon-lab-pods"><article><i>◌</i><b>Lunar Window</b><span>Watch Earth and the lunar horizon.</span></article><article><i>⌁</i><b>Sample Gallery</b><span>Future display space for Moon rocks.</span></article><article><i>◇</i><b>Ship Hologram</b><span>Shows the selected decorative model.</span>${shipDisplay(state.shipStyle,"moon-hologram","Selected Moon ship")}</article><article><i>⚙</i><b>Robot Workshop</b><span>Return to the garage at any time.</span><button id="labGarage">Open Garage</button></article></div><button class="moon-exit" id="exitMoonLab">← Return to landing pad</button></section>`,{back:true,title:"Moon Lab"});
    root.querySelector("#labGarage").onclick=()=>{state.mathArea="garage";save();renderMath()};root.querySelector("#exitMoonLab").onclick=()=>{state.mathArea="moon";save();renderMath()};
  }
  function openLegacyMath(target){
    lastActivity=Date.now();document.body.classList.add("unified-legacy-math");root.hidden=true;mathReturn.hidden=false;
    updateLegacyResources();
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
  window.UnifiedLearningWorld={go,render,getState:()=>({...state}),getScienceProgress:()=>({...adventure.science?.completedByWeek}),getScienceReading:(weekNumber,dayNumber)=>{const week=allWeeks()[weekNumber],day=week?.days?.[dayNumber];return week&&day?expandedScienceReading(week,day):null}};
  render();
})();
