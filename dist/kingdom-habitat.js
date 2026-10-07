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
    {id:"tomato-vine",name:"Flowering Tomato Vine",icon:"🍅",image:"assets/science-fruit-week-review-v2.png",unlock:[15,5],type:"plant",homes:[2,3,15,17],moisture:[48,72],fertility:[58,84],light:[72,100],clue:"Tomatoes need strong light, steady root-zone moisture and fertile, well-drained soil. Drought or waterlogging during flowering can reduce fruit set.",success:"The vine can flower. Stable moisture and pollination allow fruit to develop.",partner:"honey-bee"}
  ];

  const DEFAULTS={
    1:[88,62,68],2:[58,72,88],3:[52,68,90],4:[42,52,48],5:[96,55,78],6:[64,76,28],8:[68,82,36],12:[100,38,88],13:[52,68,58],14:[90,68,72],15:[58,74,86],16:[92,58,70],17:[58,72,64]
  };
  const POSITIONS=[[20,69],[34,50],[48,72],[62,48],[76,70],[86,44]];
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const inside=(value,range)=>value>=range[0]&&value<=range[1];
  const distance=(value,range)=>value<range[0]?range[0]-value:value>range[1]?value-range[1]:0;

  function ensure(state){
    const base={version:1,settings:{},placed:{}};
    state.kingdoms={...base,...state.kingdoms,settings:{...base.settings,...state.kingdoms?.settings},placed:{...base.placed,...state.kingdoms?.placed}};
    return state.kingdoms;
  }
  function settings(state,week){
    const kingdoms=ensure(state),key=String(week),fallback=DEFAULTS[week]||[55,60,65],saved=kingdoms.settings[key];
    kingdoms.settings[key]=saved?{moisture:Number(saved.moisture),fertility:Number(saved.fertility),light:Number(saved.light)}:{moisture:fallback[0],fertility:fallback[1],light:fallback[2]};
    return kingdoms.settings[key];
  }
  function completed(state,week,day){return(state.science?.completedByWeek?.[week]||[]).includes(day)}
  function owned(state){return SPECIMENS.filter(item=>completed(state,item.unlock[0],item.unlock[1]))}
  function assessment(item,week,env,placedIds=[]){
    if(!item.homes.includes(Number(week)))return{level:"unsuitable",label:"Wrong biome",why:`${item.name} belongs in ${item.homes.map(n=>window.ScienceExpansion?.habitats?.[n]?.name||`Week ${n}`).join(", ")}, not this Kingdom.`};
    const misses=[["moisture",env.moisture,item.moisture],["fertility",env.fertility,item.fertility],["light",env.light,item.light]].filter(([,value,range])=>!inside(value,range));
    const far=misses.some(([,value,range])=>distance(value,range)>18);
    if(far||misses.length>1)return{level:"unsuitable",label:"Unsuitable",why:`Adjust ${misses.map(([name])=>name).join(" and ")}. Read the clue, then compare the current value with the preferred band.`};
    if(misses.length)return{level:"surviving",label:"Surviving",why:`Close, but ${misses[0][0]} is outside the preferred range. The organism can survive briefly but will not thrive.`};
    if(item.partner&&!placedIds.includes(item.partner))return{level:"surviving",label:item.type==="plant"?"Flowering · no fruit yet":"Surviving",why:`Conditions support growth, but fruit set improves when ${SPECIMENS.find(x=>x.id===item.partner)?.name||"its partner"} is present.`};
    return{level:"thriving",label:item.type==="plant"?(item.partner?"Flowering & fruiting":"Growing well"):"Thriving",why:item.success};
  }
  function rangeText(range){return range[0]===range[1]?`${range[0]}`:`${range[0]}–${range[1]}`}
  function getOwnedProfiles(state){
    return owned(state).map(item=>({id:`living-${item.id}`,name:item.name,rarity:"rare",image:item.image,origin:`Science Chapter · Week ${item.unlock[0]} Day ${item.unlock[1]}`,category:`Living specimen · ${item.type}`,ability:"Can be placed in a compatible Kingdom and responds to moisture, fertility and light.",lesson:item.clue,facts:[`Preferred relative moisture ${rangeText(item.moisture)}, fertility ${rangeText(item.fertility)}, light ${rangeText(item.light)}.`]}));
  }
  function liveSpecimens(root,items,week,env,placedIds){
    const scene=root.querySelector(".chapter-habitat-scene");if(!scene)return;
    items.forEach((item,index)=>{const result=assessment(item,week,env,placedIds),[x,y]=POSITIONS[index%POSITIONS.length],button=document.createElement("button");button.className=`kingdom-live-specimen ${result.level}`;button.style.setProperty("--life-x",`${x}%`);button.style.setProperty("--life-y",`${y}%`);button.dataset.kingdomInspect=item.id;button.setAttribute("aria-label",`${item.name}: ${result.label}`);button.innerHTML=`<img src="${item.image}" alt=""><span>${item.icon} ${esc(item.name)}<small>${esc(result.label)}</small></span>`;scene.appendChild(button)})
  }
  function mount({root,week,state,save,rerender}){
    if(!root||!week)return;const kingdoms=ensure(state),key=String(week.number),env=settings(state,week.number),allOwned=owned(state);if(!Array.isArray(kingdoms.placed[key]))kingdoms.placed[key]=[];
    kingdoms.placed[key]=kingdoms.placed[key].filter(id=>allOwned.some(item=>item.id===id));const placedIds=kingdoms.placed[key],placed=placedIds.map(id=>SPECIMENS.find(item=>item.id===id)).filter(Boolean);
    liveSpecimens(root,placed,week.number,env,placedIds);
    const panel=document.createElement("section");panel.className="kingdom-environment-lab";panel.innerHTML=`<div class="kingdom-lab-heading"><div><p>HABITAT ENGINEERING · READ, INFER, ADJUST</p><h2>Balance ${esc(week.habitat.name)}</h2><span>These are relative learning scales from 0–100, not laboratory percentages.</span></div><strong>${placed.length} LIVING SPECIMENS</strong></div><div class="kingdom-lab-grid"><section class="kingdom-controls"><h3>Environmental controls</h3>${[["moisture","💧","Moisture / water"],["fertility","◈","Soil fertility"],["light","☀","Available light"]].map(([keyName,icon,label])=>`<label><span>${icon} ${label}<b>${env[keyName]}</b></span><input type="range" min="0" max="100" step="5" value="${env[keyName]}" data-kingdom-control="${keyName}"><small>${keyName==="moisture"?"0 bone-dry · 100 submerged/saturated":keyName==="fertility"?"0 nutrient-poor · 100 very nutrient-rich":"0 darkness · 100 full strong light"}</small></label>`).join("")}<div class="kingdom-method"><b>How to reason</b><ol><li>Read the specimen clue.</li><li>Predict which control should move.</li><li>Adjust one factor at a time.</li><li>Compare survival with flowering or fruiting.</li></ol></div></section><section class="kingdom-specimen-tray"><div class="kingdom-tray-title"><h3>Specimens from your Storage Chest</h3><span>${allOwned.length}/${SPECIMENS.length} collected through Science chapters</span></div><div class="kingdom-specimen-grid">${allOwned.map(item=>{const isPlaced=placedIds.includes(item.id),result=assessment(item,week.number,env,placedIds);return `<article class="kingdom-specimen-card ${result.level} ${isPlaced?"placed":""}"><img src="${item.image}" alt="${esc(item.name)} specimen"><div><small>${item.icon} ${esc(item.type.toUpperCase())} · WEEK ${item.unlock[0]}</small><h4>${esc(item.name)}</h4><p>${esc(item.clue)}</p><div class="kingdom-needs"><span>💧 ${rangeText(item.moisture)}</span><span>◈ ${rangeText(item.fertility)}</span><span>☀ ${rangeText(item.light)}</span></div><b>${esc(result.label)}</b><em>${esc(result.why)}</em><button data-kingdom-place="${item.id}">${isPlaced?"Return to chest":"Place in Kingdom"}</button></div></article>`}).join("")||`<div class="kingdom-empty"><span>▣</span><b>No living specimens collected yet</b><p>Complete the highlighted Science days. Each organism will appear in the Storage Chest and can then be tested in compatible Kingdoms.</p></div>`}</div></section></div><footer class="kingdom-science-note"><b>SCIENCE MODEL</b><span>Water saturation strongly shapes wetlands; soil texture and organic matter change water availability; flowering and fruiting also depend on light, steady water and pollination. Adjustments should follow evidence, not guessing.</span></footer>`;
    root.querySelector(".chapter-habitat-screen")?.appendChild(panel);
    panel.querySelectorAll("[data-kingdom-control]").forEach(input=>{input.oninput=()=>{input.previousElementSibling.querySelector("b").textContent=input.value};input.onchange=()=>{env[input.dataset.kingdomControl]=Number(input.value);save();rerender()}});
    panel.querySelectorAll("[data-kingdom-place]").forEach(button=>button.onclick=()=>{const id=button.dataset.kingdomPlace,index=placedIds.indexOf(id);if(index>=0)placedIds.splice(index,1);else if(placedIds.length<6)placedIds.push(id);save();rerender()});
    root.querySelectorAll("[data-kingdom-inspect]").forEach(button=>button.onclick=()=>{panel.querySelector(`[data-kingdom-place="${button.dataset.kingdomInspect}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})});
  }

  window.KingdomHabitat={mount,ensureState:ensure,getOwnedProfiles,assessment,specimens:SPECIMENS};
})();
