(()=>{
  const STORAGE_KEY="international-math-race-v1";
  const mascots=[
    {id:"pip",name:"Pip",animal:"Otter",emoji:"🦦",fact:"Otters hold hands while they rest so they do not drift apart."},
    {id:"luna",name:"Luna",animal:"Rabbit",emoji:"🐰",fact:"A rabbit can turn its ears to listen in different directions."},
    {id:"finn",name:"Finn",animal:"Fox",emoji:"🦊",fact:"A fox can hear tiny sounds from far away."},
    {id:"bao",name:"Bao",animal:"Panda",emoji:"🐼",fact:"Giant pandas spend many hours each day eating bamboo."},
    {id:"leo",name:"Leo",animal:"Lion cub",emoji:"🦁",fact:"A lion's roar can travel several kilometres."},
    {id:"ellie",name:"Ellie",animal:"Elephant",emoji:"🐘",fact:"Elephants use their trunks to smell, drink and pick things up."},
    {id:"pebble",name:"Pebble",animal:"Penguin",emoji:"🐧",fact:"Penguins are birds that swim instead of fly."},
    {id:"tiko",name:"Tiko",animal:"Turtle",emoji:"🐢",fact:"A turtle carries a strong protective shell on its back."}
  ];
  let raceState;
  try{raceState=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch{raceState={}}
  raceState.selected=raceState.selected||"";raceState.papers=raceState.papers||{};
  const byId=id=>mascots.find(m=>m.id===id)||mascots[0],el=id=>document.getElementById(id);
  let feedbackTimer=null;
  function mascotArt(m,className=""){return `<span class="mascot-sprite mascot-${m.id} ${className}" role="img" aria-label="${m.name} the ${m.animal}"></span>`}
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(raceState))}
  function paperState(paperId){return raceState.papers[paperId]||(raceState.papers[paperId]={cleared:[],attempts:{},rescued:[]})}
  function rescuePlan(paperId){
    const total=papers[paperId].length,available=mascots.filter(m=>m.id!==raceState.selected);
    return available.map((m,index)=>({mascot:m,question:Math.max(1,Math.round(total*(index+1)/available.length))}));
  }
  function unlockedMascots(paperId){const state=paperState(paperId);return new Set([raceState.selected,...state.rescued].filter(Boolean))}
  function openDialog(dialog){if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
  function closeDialog(dialog){if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open")}
  function buildMascotPicker(){
    const grid=el("mascotGrid");grid.innerHTML="";
    mascots.forEach(m=>{const button=document.createElement("button");button.type="button";button.className=`mascot-card${raceState.selected===m.id?" selected":""}`;button.innerHTML=`${mascotArt(m,"mascot-card-art")}<strong>${m.name}</strong><small>${m.animal} racer</small>`;button.onclick=()=>{raceState.selected=m.id;save();closeDialog(el("mascotPicker"));buildMascotPicker();renderRace(currentYear,currentIndex)};grid.appendChild(button)});
  }
  function renderCollection(){
    const grid=el("collectionGrid"),unlocked=unlockedMascots(currentYear);grid.innerHTML="";el("collectionSummary").textContent=`${unlocked.size} of ${mascots.length} friends are safe on ${paperNames[currentYear]}.`;
    mascots.forEach(m=>{const card=document.createElement("article"),open=unlocked.has(m.id);card.className=`collection-card${open?"":" locked"}`;card.innerHTML=open?`${mascotArt(m,"mascot-card-art")}<strong>${m.name} · ${m.animal}</strong><small>${m.fact}</small>`:`<span class="lock-mark" aria-hidden="true">🔒</span><strong>Mystery friend</strong><small>Reach a rescue gate to unlock.</small>`;grid.appendChild(card)});
  }
  function renderRace(paperId,index){
    if(!papers[paperId])return;const state=paperState(paperId),cleared=new Set(state.cleared),plan=rescuePlan(paperId),bossByQuestion=new Map(plan.map(item=>[item.question,item])),track=el("raceTrack"),total=papers[paperId].length,frontier=Math.min(total,cleared.size+1),racer=byId(raceState.selected),position=Math.max(1,Math.min(total,cleared.size+1)),compact=window.matchMedia("(max-width:700px)").matches,cols=compact?5:(total>=40?9:total>=24?6:Math.ceil(Math.sqrt(total))),rows=Math.ceil(total/cols);track.innerHTML="";track.style.setProperty("--race-cols",cols);track.style.setProperty("--race-rows",rows);
    el("raceTitle").textContent=`${paperNames[paperId]} space rescue`;el("raceSubtitle").textContent=`All ${total} questions stay on the map. Defeat ${plan.length} robot bosses to rescue every friend.`;el("currentRacer").innerHTML=`${mascotArt(racer,"mascot-inline")} ${racer.name}`;el("raceStars").textContent=`★ ${cleared.size} rescued star${cleared.size===1?"":"s"}`;el("raceProgressLabel").textContent=`Path ${Math.round(cleared.size/total*100)}%`;el("collectionCount").textContent=`${unlockedMascots(paperId).size}/${mascots.length}`;
    papers[paperId].forEach((q,i)=>{const number=i+1,row=Math.floor(i/cols)+1,offset=i%cols,col=row%2?offset+1:cols-offset,boss=bossByQuestion.get(number),button=document.createElement("button"),open=number<=frontier||cleared.has(q.n);button.type="button";button.style.setProperty("--row",row);button.style.setProperty("--col",col);button.className=`race-node${cleared.has(q.n)?" cleared":""}${i===index?" active":""}${open?"":" locked"}${boss?" boss":""}${boss&&state.attempts[q.n]&&!cleared.has(q.n)?" lost":""}`;button.disabled=!open;button.setAttribute("aria-label",open?`Open question ${q.n}${boss?`, robot boss guarding ${boss.mascot.name}`:""}`:`Question ${q.n} is locked`);button.innerHTML=`<span class="node-number">${q.n}</span>${number===position?`<span class="racer-token mascot-sprite mascot-${racer.id}" aria-hidden="true"></span>`:""}${boss?`<span class="boss-star" aria-hidden="true"><img src="assets/space-robot-boss-v1.png" alt=""></span><span class="rescue-token" aria-hidden="true">${state.rescued.includes(boss.mascot.id)?`<span class="mascot-sprite mascot-${boss.mascot.id}"></span>`:`<span class="cage-mini">${boss.mascot.emoji}</span>`}</span>`:""}`;button.onclick=()=>{currentIndex=i;translationOpen=false;render()};track.appendChild(button)});
  }
  function sparkle(){const box=el("raceStarField");box.innerHTML="";[[12,22],[27,8],[72,10],[87,28],[17,72],[48,3],[80,75],[50,82]].forEach(([x,y],i)=>{const star=document.createElement("span");star.textContent="★";star.style.setProperty("--x",`${x}%`);star.style.setProperty("--y",`${y}%`);star.style.setProperty("--delay",`${i*.06}s`);box.appendChild(star)})}
  function closeFeedback(){clearTimeout(feedbackTimer);el("raceFeedback").hidden=true}
  function showFeedback(correct,title,message,rescued=null){const box=el("raceFeedback"),battle=el("bossBattle"),weather=el("weatherFace");box.className=`race-feedback ${correct?"correct":"wrong"}${rescued?" boss-victory":""}`;weather.textContent=correct?"🌞":"🌧️";weather.hidden=Boolean(rescued);battle.hidden=!rescued;if(rescued)el("cagedMascot").className=`caged-mascot mascot-sprite mascot-${rescued.id}`;el("raceFeedbackTitle").textContent=title;el("raceFeedbackMessage").textContent=message;if(correct)sparkle();else el("raceStarField").innerHTML="";box.hidden=false;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(closeFeedback,rescued?5600:correct?2600:3400)}
  function handleAnswer({paperId,question,correct}){
    const state=paperState(paperId),plan=rescuePlan(paperId),boss=plan.find(item=>item.question===question.n);
    if(correct){const firstClear=!state.cleared.includes(question.n);if(firstClear){state.cleared.push(question.n);state.cleared.sort((a,b)=>a-b)}delete state.attempts[question.n];let rescued=null;if(firstClear&&boss&&!state.rescued.includes(boss.mascot.id)){state.rescued.push(boss.mascot.id);rescued=boss.mascot}save();renderRace(paperId,currentIndex);showFeedback(true,rescued?`Boss defeated — ${rescued.name} is safe!`:"Path unlocked!",rescued?`${rescued.emoji} The cage is open. ${rescued.name} joins your Animal Collection!`:firstClear?`${byId(raceState.selected).name} moved one step closer to the treasure.`:"This path was already unlocked. Great checking!",rescued)}
    else{state.attempts[question.n]=(state.attempts[question.n]||0)+1;save();renderRace(paperId,currentIndex);const secondTry=state.attempts[question.n]>=2;if(secondTry&&question.hint){el("hintBox").classList.remove("hidden");el("hintText").textContent=question.hint}showFeedback(false,secondTry?"A clue from the clouds":"Try again!",boss?`${boss.mascot.name}'s rescue signal faded. ${secondTry&&question.hint?question.hint:"Try this question again to bring it back."}`:secondTry&&question.hint?question.hint:`${byId(raceState.selected).name} stays here. Take another look.`)}
  }
  el("chooseRacerButton").onclick=()=>openDialog(el("mascotPicker"));el("collectionButton").onclick=()=>{renderCollection();openDialog(el("collectionDialog"))};el("closeRaceFeedback").onclick=closeFeedback;el("raceFeedback").onclick=event=>{if(event.target===el("raceFeedback"))closeFeedback()};
  let resizeTimer;window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>renderRace(currentYear,currentIndex),140)});buildMascotPicker();window.raceExperience={render:renderRace,handleAnswer};renderRace(currentYear,currentIndex);if(!raceState.selected)setTimeout(()=>{if(!document.body.classList.contains("adventure-active"))openDialog(el("mascotPicker"))},250);
})();
