(()=>{
  "use strict";

  const SPECIMENS=[
    {id:"beaver",name:"Wetland Beaver",icon:"🦫",image:"assets/science-beaver-field-report-v2.png",unlock:[1,5],type:"animal",homes:[1,14,16],moisture:[72,100],fertility:[35,82],light:[30,85],clue:"A beaver needs permanent freshwater, bank plants and woody food. A dry slope cannot support its swimming entrance or lodge.",success:"Deep, reliable water and a productive bank support feeding, shelter and dam building."},
    {id:"fruit-tree",name:"Flowering Fruit Tree",icon:"🌳",image:"assets/science-flower-fruit-v2.png",unlock:[2,5],type:"plant",homes:[2,3,13,15,17],moisture:[45,72],fertility:[55,86],light:[68,100],clue:"Roots need moist but aerated soil. Strong light supplies energy for flowers, and balanced nutrients support growth without waterlogging.",success:"Healthy roots and strong light allow flowering. Add a pollinator to improve fruit set.",partner:"honey-bee"},
    {id:"honey-bee",name:"Orchard Honey Bee",icon:"🐝",image:"assets/science-bee-orchard-pollination-v1.png",unlock:[3,4],type:"animal",homes:[2,3,13,15,17],moisture:[25,72],fertility:[42,100],light:[58,100],clue:"Bees need dry nesting places and a continuing supply of open flowers. Fertile ground matters only when it supports diverse flowering plants.",success:"Warm light and abundant flowers provide nectar and pollen. Nearby fruit flowers can now be pollinated."},
    {id:"squirrel",name:"Woodland Squirrel",icon:"🐿️",image:"assets/science-winter-hoard-v1.png",unlock:[4,1],type:"animal",homes:[4,13],moisture:[25,72],fertility:[32,82],light:[25,82],clue:"A squirrel needs trees, seeds and sheltered cache sites. Flooded ground or an open treeless habitat removes those resources.",success:"The woodland produces seeds and provides safe branches, cavities and food-cache sites."},
    {id:"pondweed",name:"Freshwater Pondweed",icon:"🌿",image:"assets/science-pond-producers-v1.png",unlock:[5,1],type:"plant",homes:[1,5,14,16],moisture:[88,100],fertility:[35,72],light:[55,100],clue:"This producer must remain underwater or in saturated mud, with enough light for photosynthesis. Excess nutrients can trigger an algal bloom.",success:"Clear sunlit water supports photosynthesis and steady underwater growth."},
    {id:"earthworm",name:"Soil Earthworm",icon:"🪱",image:"assets/science-worm-moisture-v1.png",unlock:[6,2],type:"decomposer",homes:[6,8,13,14,15,17],moisture:[48,82],fertility:[55,100],light:[0,42],clue:"An earthworm exchanges gases through moist skin and feeds on organic material. Dry exposed soil is dangerous; flooded soil may lack oxygen.",success:"Cool, moist, organic soil supports feeding, burrowing and nutrient recycling."},
    {id:"decomposer-fungus",name:"Decomposer Fungus",icon:"🍄",image:"assets/science-garbage-decomposers-v1.png",unlock:[8,2],type:"decomposer",homes:[6,8,13,14,15,17],moisture:[52,88],fertility:[55,100],light:[0,60],clue:"Fungal threads grow through damp organic material and release enzymes. A bone-dry, nutrient-poor surface gives them little food or water.",success:"Damp litter and organic matter support hyphae, enzymes and decomposition."},
    {id:"reef-coral",name:"Reef-building Coral",icon:"🪸",image:"assets/coral-organism-cutouts-v1.png",unlock:[12,2],type:"animal",homes:[12],moisture:[100,100],fertility:[20,58],light:[70,100],clue:"Reef-building coral stays submerged in clear salty water. Its partner algae require strong light, while excess nutrients can cloud the water.",success:"Clear, bright, fully aquatic conditions support the coral–algae partnership."},
    {id:"cattail",name:"Wetland Cattail",icon:"🌾",image:"assets/science-wetland-effects-v2.png",unlock:[14,2],type:"plant",homes:[1,14,16],moisture:[78,100],fertility:[45,82],light:[58,100],clue:"Cattails tolerate saturated soil because they move oxygen to buried tissues. They still need light above the water for photosynthesis.",success:"Saturated soil and open light support new shoots and flowering spikes."},
    {id:"tomato-vine",name:"Flowering Tomato Vine",icon:"🍅",image:"assets/science-fruit-week-review-v2.png",unlock:[15,5],type:"plant",homes:[2,3,15,17],moisture:[48,72],fertility:[58,84],light:[72,100],clue:"Tomatoes need strong light, steady root-zone moisture and fertile, well-drained soil. Drought or waterlogging during flowering can reduce fruit set.",success:"The vine can flower. Stable moisture and pollination allow fruit to develop.",partner:"honey-bee"},

    {id:"plaque-biofilm",name:"Plaque Biofilm Colony",icon:"🦠",image:"assets/microscopic-world-v1.png",focus:"53% 44%",unlock:[9,1],type:"microbe",homes:[10],needs:{10:{temperature:[45,70],nutrients:[58,100],moisture:[68,100]}},clue:"Plaque bacteria grow as a sticky community. Frequent sugar supplies fuel, while a moist mouth lets the biofilm remain active.",success:"The biofilm is metabolically active. Its acid-making activity explains why brushing and limiting frequent sugar protect enamel.",successLabel:"Active biofilm"},
    {id:"beneficial-bacteria",name:"Helpful Gut Bacteria",icon:"🧫",image:"assets/microscopic-world-v1.png",focus:"14% 20%",unlock:[10,3],type:"microbe",homes:[10],needs:{10:{temperature:[48,68],nutrients:[48,82],moisture:[72,100]}},clue:"Many gut bacteria live in warm, watery intestines and use nutrients from food. Some help transform plant fiber into smaller molecules.",success:"A stable warm, moist culture with a moderate food supply models a beneficial microbial community.",successLabel:"Balanced culture"},
    {id:"bacteriophage",name:"Bacteriophage",icon:"⌬",image:"assets/microscopic-world-v1.png",focus:"80% 76%",unlock:[10,1],type:"virus",homes:[10],needs:{10:{temperature:[38,72],nutrients:[35,88],moisture:[65,100]}},clue:"A bacteriophage is a virus that infects bacteria. It cannot reproduce alone, so a living bacterial host must be present in the culture.",success:"The phage remains in a host-rich culture where infection and replication can be observed.",successLabel:"Host located",partner:"beneficial-bacteria",partnerLabel:"a bacterial host"},
    {id:"budding-yeast",name:"Budding Yeast",icon:"◉",image:"assets/microscopic-world-v1.png",focus:"86% 20%",unlock:[8,2],type:"fungus",homes:[7,10],needs:{7:{pressure:[84,100],water:[52,78],shielding:[78,100]},10:{temperature:[45,70],nutrients:[55,88],moisture:[55,88]}},clue:"Yeast is a single-celled fungus. With water, suitable warmth and sugar, cells can grow and form buds; in the Moon lab it must stay inside a protected chamber.",success:"The culture has enough water, warmth and food for budding cells to remain active.",successLabel:"Budding culture"},
    {id:"amoeba-culture",name:"Amoeba Research Culture",icon:"✧",image:"assets/microscopic-world-v1.png",focus:"20% 76%",unlock:[10,5],type:"protist",homes:[10],needs:{10:{temperature:[42,68],nutrients:[38,72],moisture:[88,100]}},clue:"An amoeba is a single-celled protist that changes shape and extends pseudopods. It requires a watery microhabitat and small food particles.",success:"The fully aquatic microhabitat supports movement, feeding and changing cell shape.",successLabel:"Pseudopods active"},

    {id:"arabidopsis",name:"Arabidopsis Test Plant",icon:"🌱",image:"assets/moon-bio-lab-v1.png",focus:"18% 55%",unlock:[7,5],type:"space plant",homes:[7],needs:{7:{pressure:[88,100],water:[52,76],shielding:[82,100]}},clue:"This small Earth plant is a research model, not lunar life. It needs a pressurized chamber, carefully delivered water and protection from the Moon's radiation environment.",success:"The sealed growth chamber supports germination and measured plant growth under controlled light.",successLabel:"Growth chamber stable"},
    {id:"microalgae",name:"Microalgae Bioreactor",icon:"🟢",image:"assets/moon-bio-lab-v1.png",focus:"72% 56%",unlock:[5,5],type:"space culture",homes:[7],needs:{7:{pressure:[78,100],water:[82,100],shielding:[72,100]}},clue:"Earth microalgae can be studied in a sealed photobioreactor. The culture needs recycled water, controlled gas exchange and shielding; it does not live freely on the Moon.",success:"The closed photobioreactor circulates water while the protected culture receives controlled light.",successLabel:"Reactor circulating"},
    {id:"tardigrade",name:"Tardigrade Test Capsule",icon:"✺",image:"assets/moon-bio-lab-v1.png",focus:"52% 58%",unlock:[7,5],type:"micro-animal",homes:[7],needs:{7:{pressure:[72,100],water:[42,78],shielding:[85,100]}},clue:"Tardigrades are tiny Earth animals used to investigate survival under stress. The game keeps them in a sealed research capsule; survival is not the same as growth or reproduction.",success:"The capsule provides a controlled hydrated period and strong shielding for a safe observation cycle.",successLabel:"Observation cycle safe"},
    {id:"bacillus-culture",name:"Bacillus Research Culture",icon:"▰",image:"assets/moon-bio-lab-v1.png",focus:"43% 57%",unlock:[10,5],type:"space microbe",homes:[7,10],needs:{7:{pressure:[78,100],water:[38,70],shielding:[88,100]},10:{temperature:[42,72],nutrients:[45,82],moisture:[48,82]}},clue:"This is an Earth bacterium kept in a sealed culture to study microbial persistence and contamination control. It is not evidence of native lunar life.",success:"The sealed culture is protected and monitored without releasing microbes into the habitat.",successLabel:"Containment secure"}
  ];

  const WORLD_CONTROLS={
    default:{title:"Balance the habitat",kicker:"HABITAT ENGINEERING · READ, INFER, ADJUST",className:"terrain-world",controls:[
      {key:"moisture",icon:"💧",label:"Moisture / water",scale:"0 bone-dry · 100 submerged/saturated"},
      {key:"fertility",icon:"◈",label:"Soil fertility",scale:"0 nutrient-poor · 100 very nutrient-rich"},
      {key:"light",icon:"☀",label:"Available light",scale:"0 darkness · 100 full strong light"}
    ],note:"Water saturation shapes wetlands; soil texture and organic matter change water availability; flowering and fruiting also depend on light, steady water and pollination."},
    7:{title:"Run the sealed Moon bio-lab",kicker:"MOON WORLD · EARTH LIFE UNDER CONTROLLED CONDITIONS",className:"moon-world",controls:[
      {key:"pressure",icon:"◉",label:"Habitat pressure",scale:"0 lunar vacuum · 100 Earth-like chamber"},
      {key:"water",icon:"💧",label:"Recycled water supply",scale:"0 dry loop · 100 fully circulating"},
      {key:"shielding",icon:"▦",label:"Radiation shielding",scale:"0 exposed · 100 strongly protected"}
    ],note:"The Moon World contains Earth organisms inside sealed experiments. Pressure, recycled water and radiation protection are life-support variables; no organism here is presented as native lunar life."},
    10:{title:"Tune the microscopic world",kicker:"MICROSCOPIC WORLD · CULTURE CONDITIONS",className:"micro-world",controls:[
      {key:"temperature",icon:"🌡",label:"Relative warmth",scale:"0 very cold · 100 very hot"},
      {key:"nutrients",icon:"◈",label:"Available nutrients",scale:"0 starved · 100 abundant food"},
      {key:"moisture",icon:"💧",label:"Water availability",scale:"0 dry · 100 fully aquatic"}
    ],note:"Microscopic does not mean harmful. Students compare bacteria, fungi, protists and viruses by their structures, resources, hosts and effects, then adjust one culture condition at a time."}
  };
  const DEFAULTS={
    1:{moisture:88,fertility:62,light:68},2:{moisture:58,fertility:72,light:88},3:{moisture:52,fertility:68,light:90},4:{moisture:42,fertility:52,light:48},5:{moisture:96,fertility:55,light:78},6:{moisture:64,fertility:76,light:28},7:{pressure:92,water:66,shielding:88},8:{moisture:68,fertility:82,light:36},10:{temperature:56,nutrients:64,moisture:82},12:{moisture:100,fertility:38,light:88},13:{moisture:52,fertility:68,light:58},14:{moisture:90,fertility:68,light:72},15:{moisture:58,fertility:74,light:86},16:{moisture:92,fertility:58,light:70},17:{moisture:58,fertility:72,light:64}
  };
  const POSITIONS=[[14,66],[27,39],[42,70],[57,38],[70,67],[84,42]];
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const inside=(value,range)=>value>=range[0]&&value<=range[1];
  const distance=(value,range)=>value<range[0]?range[0]-value:value>range[1]?value-range[1]:0;
  const worldFor=week=>WORLD_CONTROLS[week]||WORLD_CONTROLS.default;

  function ensure(state){
    const base={version:2,settings:{},placed:{}};
    state.kingdoms={...base,...state.kingdoms,version:2,settings:{...base.settings,...state.kingdoms?.settings},placed:{...base.placed,...state.kingdoms?.placed}};
    return state.kingdoms;
  }
  function settings(state,week){
    const kingdoms=ensure(state),key=String(week),fallback=DEFAULTS[week]||{moisture:55,fertility:60,light:65},saved=kingdoms.settings[key]||{};
    kingdoms.settings[key]={...fallback,...Object.fromEntries(Object.entries(saved).filter(([,value])=>Number.isFinite(Number(value))).map(([name,value])=>[name,Number(value)]))};
    return kingdoms.settings[key];
  }
  function completed(state,week,day){return(state.science?.completedByWeek?.[week]||[]).includes(day)}
  function owned(state){return SPECIMENS.filter(item=>completed(state,item.unlock[0],item.unlock[1]))}
  function needsFor(item,week){
    if(item.needs?.[week])return item.needs[week];
    const world=worldFor(week),ranges={};
    world.controls.forEach(control=>{if(Array.isArray(item[control.key]))ranges[control.key]=item[control.key]});
    return ranges;
  }
  function assessment(item,week,env,placedIds=[]){
    if(!item.homes.includes(Number(week)))return{level:"unsuitable",label:"Wrong biome",why:`${item.name} belongs in ${item.homes.map(n=>window.ScienceExpansion?.habitats?.[n]?.name||`Week ${n}`).join(", ")}, not this Kingdom.`};
    const controls=worldFor(week).controls,needs=needsFor(item,week);
    const misses=controls.map(control=>[control.key,env[control.key],needs[control.key],control.label]).filter(([,value,range])=>Array.isArray(range)&&!inside(value,range));
    const far=misses.some(([,value,range])=>distance(value,range)>18);
    if(far||misses.length>1)return{level:"unsuitable",label:"Unsuitable",why:`Adjust ${misses.map(([, , ,label])=>label.toLowerCase()).join(" and ")}. Read the clue, then compare the current value with the preferred band.`};
    if(misses.length)return{level:"surviving",label:"Surviving",why:`Close, but ${misses[0][3].toLowerCase()} is outside the preferred range. The organism may persist briefly but will not thrive.`};
    if(item.partner&&!placedIds.includes(item.partner))return{level:"surviving",label:item.type==="plant"?"Flowering · no fruit yet":"Host required",why:`Conditions are suitable, but this specimen also needs ${item.partnerLabel||SPECIMENS.find(x=>x.id===item.partner)?.name||"its biological partner"}.`};
    return{level:"thriving",label:item.successLabel||(item.type==="plant"?(item.partner?"Flowering & fruiting":"Growing well"):"Thriving"),why:item.success};
  }
  function rangeText(range){return range[0]===range[1]?`${range[0]}`:`${range[0]}–${range[1]}`}
  function preferredFacts(item){
    const worlds=item.homes.map(week=>({week,needs:needsFor(item,week)})).filter(entry=>Object.keys(entry.needs).length);
    return worlds.slice(0,2).map(entry=>`${window.ScienceExpansion?.habitats?.[entry.week]?.name||`Week ${entry.week}`}: ${Object.entries(entry.needs).map(([key,range])=>`${key} ${rangeText(range)}`).join(", ")}.`);
  }
  function getOwnedProfiles(state){
    return owned(state).map(item=>({id:`living-${item.id}`,name:item.name,rarity:item.homes.includes(7)?"epic":"rare",image:item.image,origin:`Science Chapter · Week ${item.unlock[0]} Day ${item.unlock[1]}`,category:`Living specimen · ${item.type}`,ability:"Can be placed in a compatible learning world and responds to that world's environmental controls.",lesson:item.clue,facts:preferredFacts(item)}));
  }
  function liveSpecimens(root,items,week,env,placedIds){
    const scene=root.querySelector(".chapter-habitat-scene");if(!scene)return;
    items.forEach((item,index)=>{const result=assessment(item,week,env,placedIds),[x,y]=POSITIONS[index%POSITIONS.length],button=document.createElement("button");button.className=`kingdom-live-specimen ${result.level}`;button.style.setProperty("--life-x",`${x}%`);button.style.setProperty("--life-y",`${y}%`);button.dataset.kingdomInspect=item.id;button.setAttribute("aria-label",`${item.name}: ${result.label}`);button.innerHTML=`<img src="${item.image}" style="object-position:${item.focus||"center"}" alt=""><span>${item.icon} ${esc(item.name)}<small>${esc(result.label)}</small></span>`;scene.appendChild(button)})
  }
  function needsMarkup(item,week){
    const needs=needsFor(item,week),world=worldFor(week);
    return world.controls.map(control=>Array.isArray(needs[control.key])?`<span>${control.icon} ${rangeText(needs[control.key])}</span>`:"").join("");
  }
  function mount({root,week,state,save,rerender}){
    if(!root||!week)return;
    const kingdoms=ensure(state),key=String(week.number),env=settings(state,week.number),world=worldFor(week.number),allOwned=owned(state),compatible=SPECIMENS.filter(item=>item.homes.includes(week.number));
    if(!Array.isArray(kingdoms.placed[key]))kingdoms.placed[key]=[];
    kingdoms.placed[key]=kingdoms.placed[key].filter(id=>allOwned.some(item=>item.id===id));
    const placedIds=kingdoms.placed[key],placed=placedIds.map(id=>SPECIMENS.find(item=>item.id===id)).filter(Boolean),isSpecialWorld=week.number===7||week.number===10,displayOwned=isSpecialWorld?allOwned.filter(item=>item.homes.includes(week.number)):allOwned,locked=compatible.filter(item=>!allOwned.includes(item));
    liveSpecimens(root,placed,week.number,env,placedIds);
    const panel=document.createElement("section");panel.className=`kingdom-environment-lab ${world.className}`;
    const controls=world.controls.map(control=>`<label><span>${control.icon} ${control.label}<b>${env[control.key]}</b></span><input type="range" min="0" max="100" step="5" value="${env[control.key]}" data-kingdom-control="${control.key}"><small>${control.scale}</small></label>`).join("");
    const cards=displayOwned.map(item=>{const isPlaced=placedIds.includes(item.id),result=assessment(item,week.number,env,placedIds);return `<article class="kingdom-specimen-card ${result.level} ${isPlaced?"placed":""}"><img src="${item.image}" style="object-position:${item.focus||"center"}" alt="${esc(item.name)} specimen"><div><small>${item.icon} ${esc(item.type.toUpperCase())} · WEEK ${item.unlock[0]}</small><h4>${esc(item.name)}</h4><p>${esc(item.clue)}</p><div class="kingdom-needs">${needsMarkup(item,week.number)||"<span>Not compatible with this world</span>"}</div><b>${esc(result.label)}</b><em>${esc(result.why)}</em><button data-kingdom-place="${item.id}">${isPlaced?"Return to chest":"Place in world"}</button></div></article>`}).join("");
    const lockedCards=isSpecialWorld?locked.map(item=>`<article class="kingdom-specimen-card locked-specimen"><div class="kingdom-lock-art"><b>?</b><span>SPECIMEN LOCKED</span></div><div><small>${item.icon} RESEARCH QUEUE</small><h4>${esc(item.name)}</h4><p>Complete Science Week ${item.unlock[0]} · Day ${item.unlock[1]} to collect this specimen.</p><div class="kingdom-needs"><span>Read the lesson first</span></div></div></article>`).join(""):"";
    panel.innerHTML=`<div class="kingdom-lab-heading"><div><p>${world.kicker}</p><h2>${world.title}</h2><span>These are relative learning scales from 0–100, not laboratory measurements.</span></div><strong>${placed.length} ACTIVE · ${compatible.length} DISCOVERABLE</strong></div><div class="kingdom-lab-grid"><section class="kingdom-controls"><h3>Environmental controls</h3>${controls}<div class="kingdom-method"><b>How to reason</b><ol><li>Read the specimen clue.</li><li>Predict which control should move.</li><li>Adjust one factor at a time.</li><li>Compare survival with active growth.</li></ol></div></section><section class="kingdom-specimen-tray"><div class="kingdom-tray-title"><h3>Specimens from your Storage Chest</h3><span>${allOwned.length}/${SPECIMENS.length} collected through Science chapters</span></div><div class="kingdom-specimen-grid">${cards||`<div class="kingdom-empty"><span>▣</span><b>No living specimens collected yet</b><p>Complete the highlighted Science days. Each organism will appear in the Storage Chest and can then be tested in compatible worlds.</p></div>`}${lockedCards}</div></section></div><footer class="kingdom-science-note"><b>SCIENCE MODEL</b><span>${world.note}</span></footer>`;
    root.querySelector(".chapter-habitat-screen")?.appendChild(panel);
    panel.querySelectorAll("[data-kingdom-control]").forEach(input=>{input.oninput=()=>{input.previousElementSibling.querySelector("b").textContent=input.value};input.onchange=()=>{env[input.dataset.kingdomControl]=Number(input.value);save();rerender()}});
    panel.querySelectorAll("[data-kingdom-place]").forEach(button=>button.onclick=()=>{const id=button.dataset.kingdomPlace,index=placedIds.indexOf(id);if(index>=0)placedIds.splice(index,1);else if(placedIds.length<6)placedIds.push(id);save();rerender()});
    root.querySelectorAll("[data-kingdom-inspect]").forEach(button=>button.onclick=()=>{panel.querySelector(`[data-kingdom-place="${button.dataset.kingdomInspect}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})});
  }

  window.KingdomHabitat={mount,ensureState:ensure,getOwnedProfiles,assessment,specimens:SPECIMENS,worldControls:WORLD_CONTROLS};
})();
