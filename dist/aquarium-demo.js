(()=>{
  const STORE="international-math-ecosystem-v2";
  const species=[
    {id:"acropora",name:"Branching Acropora Coral",scientific:"Acropora sp.",role:"Ecosystem engineer",rarity:"Conservation status varies by species",depth:"1–15 m",food:"Symbiotic algae and plankton",predators:"Crown-of-thorns starfish and coral-eating snails",fact:"A coral colony is made of many tiny polyps that build a shared limestone skeleton.",currency:"gold",cost:24,x:16,y:47,ax:"0%",ay:"0%"},
    {id:"anemone",name:"Bubble-tip Anemone",scientific:"Entacmaea quadricolor",role:"Symbiotic shelter",rarity:"Not globally assessed",depth:"1–20 m",food:"Plankton and small food particles",predators:"Some butterflyfish and sea turtles",fact:"Stinging cells in its tentacles help the anemone catch food and protect clownfish.",currency:"gold",cost:32,x:31,y:58,ax:"33.333%",ay:"0%"},
    {id:"clownfish",name:"Ocellaris Clownfish",scientific:"Amphiprion ocellaris",role:"Anemone partner",rarity:"Common",depth:"1–15 m",food:"Plankton, algae and food scraps",predators:"Larger reef fish",fact:"A special mucus layer lets clownfish live safely among an anemone's stinging tentacles.",currency:"gold",cost:36,x:43,y:38,ax:"66.667%",ay:"0%"},
    {id:"parrotfish",name:"Green Humphead Parrotfish",scientific:"Bolbometopon muricatum",role:"Algae grazer and sand maker",rarity:"Rare · needs protection",depth:"1–30 m",food:"Algae growing on the reef",predators:"Large reef sharks and people",fact:"Its powerful beak scrapes algae from rock; tiny limestone grains later become sand.",currency:"gold",cost:80,x:62,y:47,ax:"100%",ay:"0%"},
    {id:"shrimp",name:"Cleaner Shrimp",scientific:"Lysmata amboinensis",role:"Cleaning station",rarity:"Not globally assessed",depth:"5–40 m",food:"Parasites and dead tissue from fish",predators:"Small predatory fish",fact:"The shrimp waves its antennae to advertise a cleaning station to visiting fish.",currency:"gold",cost:42,x:27,y:73,ax:"0%",ay:"100%"},
    {id:"crab",name:"Coral Guard Crab",scientific:"Trapezia sp.",role:"Coral defender",rarity:"Not globally assessed",depth:"1–20 m",food:"Coral mucus and organic particles",predators:"Octopuses and crustacean-eating fish",fact:"This crab lives among coral branches and can chase away some coral predators.",currency:"gold",cost:38,x:50,y:76,ax:"33.333%",ay:"100%"},
    {id:"clam",name:"Giant Clam",scientific:"Tridacna sp.",role:"Filter feeder",rarity:"International trade is regulated",depth:"1–20 m",food:"Plankton and energy from symbiotic algae",predators:"Snails, fish and people",fact:"Microscopic algae living in its tissues provide extra energy from sunlight.",currency:"gold",cost:120,x:72,y:76,ax:"66.667%",ay:"100%"}
  ];
  const clues=[
    {id:"symbiosis",x:35,y:42,title:"Symbiosis Signal",text:"The clownfish gains shelter, while its movement circulates water and nutrients around the anemone."},
    {id:"cleaning",x:25,y:67,title:"Cleaning Station",text:"Some fish visit cleaner shrimp so the shrimp can remove parasites and dead tissue."},
    {id:"reef-builder",x:13,y:36,title:"Reef Engineer",text:"Limestone skeletons built by coral polyps become the foundation for many reef shelters."}
  ];
  const robotParts={
    head:[{name:"Friendly Visor",currency:"gold",cost:0},{name:"Sensor Dome",currency:"gold",cost:45},{name:"Navigator Head",currency:"gem",cost:2}],
    arms:[{name:"Library Grippers",currency:"gold",cost:0},{name:"Laboratory Tools",currency:"gold",cost:55},{name:"Habitat Clamps",currency:"gem",cost:2}],
    base:[{name:"Library Treads",currency:"gold",cost:0},{name:"Laboratory Legs",currency:"gold",cost:60},{name:"Explorer Legs",currency:"gem",cost:3}]
  };
  let state,activeOptions={};
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const defaults=()=>({version:4,gold:0,energy:0,gems:0,seeds:0,fertilizer:0,water:0,soil:0,owned:[],noted:[],clues:[],regions:["coral-lagoon"],location:"coral-lagoon",robotLevel:1,robotConfig:{head:0,arms:0,base:0},robotInventory:{head:[0],arms:[0],base:[0]}});
  function load(){try{const saved=JSON.parse(localStorage.getItem(STORE)||"null")||{},base=defaults();if((saved.version||0)<4){saved.version=4;saved.gold=0;saved.energy=0;saved.gems=0;saved.seeds=0;saved.fertilizer=0;saved.water=0;saved.soil=0}return {...base,...saved,owned:Array.isArray(saved.owned)?saved.owned:[],noted:Array.isArray(saved.noted)?saved.noted:[],clues:Array.isArray(saved.clues)?saved.clues:[],regions:Array.isArray(saved.regions)?saved.regions:["coral-lagoon"],robotConfig:{...base.robotConfig,...saved.robotConfig},robotInventory:{head:Array.isArray(saved.robotInventory?.head)?saved.robotInventory.head:[0],arms:Array.isArray(saved.robotInventory?.arms)?saved.robotInventory.arms:[0],base:Array.isArray(saved.robotInventory?.base)?saved.robotInventory.base:[0]}}}catch{return defaults()}}
  const signalResources=mode=>{window.__ecosystemResourceMode=mode||window.__ecosystemResourceMode||"living";document.dispatchEvent(new CustomEvent("ecosystem-resources",{detail:{mode:window.__ecosystemResourceMode}}))};
  const save=()=>{localStorage.setItem(STORE,JSON.stringify(state));signalResources()};
  const isOwned=id=>state.owned.includes(id);
  const specimenStyle=item=>`--atlas-x:${item.ax};--atlas-y:${item.ay}`;
  const gemCount=()=>window.getAdventureKnowledgeGemCount?.()??state.gems;
  const price=item=>item.currency==="gem"?`${item.cost} Knowledge Gem`:`${item.cost} Gold`;
  const resourceStyle=(x,y)=>`--resource-x:${x};--resource-y:${y}`;
  const resourceItem=(type,value,label,x,y)=>`<span class="eco-resource ${type}"><i style="${resourceStyle(x,y)}"></i><b>${value}</b><small>${label}</small></span>`;
  const resourceBar=()=>"";
  const partStyle=(type,index)=>`--part-x:${index*50}%;--part-y:${type==="head"?"0%":type==="arms"?"50%":"100%"}`;
  const robotPreview=(extra="")=>`<span class="robot-composite ${extra}"><i class="robot-part robot-base" style="${partStyle("base",state.robotConfig.base)}"></i><i class="robot-part robot-arms" style="${partStyle("arms",state.robotConfig.arms)}"></i><i class="robot-part robot-head" style="${partStyle("head",state.robotConfig.head)}"></i></span>`;

  function announce(message){
    document.getElementById("reefToast")?.remove();
    const toast=document.createElement("div");
    toast.className="reef-toast";toast.id="reefToast";toast.setAttribute("role","status");toast.textContent=message;
    document.body.appendChild(toast);setTimeout(()=>toast.remove(),2600);
  }
  function closeModal(reset=true){document.getElementById("reefModalLayer")?.remove();if(reset)signalResources(document.querySelector(".aquarium-shell")?"aquarium":"living")}
  function modal(content){
    closeModal(false);
    const layer=document.createElement("div");
    layer.className="reef-modal-backdrop";layer.id="reefModalLayer";
    layer.innerHTML=`<section class="reef-modal" role="dialog" aria-modal="true"><button class="reef-modal-close" id="reefModalClose" aria-label="Close">×</button>${content}</section>`;
    document.body.appendChild(layer);
    document.getElementById("reefModalClose").onclick=closeModal;
    layer.onclick=event=>{if(event.target===layer)closeModal()};
    return layer;
  }
  function openSpecies(id){
    const item=species.find(entry=>entry.id===id);if(!item)return;
    const owned=isOwned(id),noted=state.noted.includes(id);
    modal(`
      <p class="reef-eyebrow">${owned?"SPECIMEN UNLOCKED":"LOCKED SPECIMEN · INFORMATION PREVIEW"}</p>
      <h2>${esc(item.name)}</h2>
      <p class="reef-modal-lead"><i>${esc(item.scientific)}</i> · ${esc(item.role)}. ${owned?"This organism can now live in the habitat.":"Its image will appear only after it is unlocked."}</p>
      <div class="species-detail">
        <div class="${owned?"species-portrait":"species-locked-portrait"}">${owned?`<span class="reef-specimen-image" style="${specimenStyle(item)}"></span>`:"?"}</div>
        <div>
          <div class="species-facts">
            <div><small>DEPTH</small><b>${esc(item.depth)}</b></div>
            <div><small>RARITY / CONSERVATION</small><b>${esc(item.rarity)}</b></div>
            <div><small>FOOD</small><b>${esc(item.food)}</b></div>
            <div><small>PREDATORS / THREATS</small><b>${esc(item.predators)}</b></div>
          </div>
          <div class="reef-fun-fact"><b>FUN FACT</b><p>${esc(item.fact)}</p></div>
          <div class="species-actions">
            ${owned?`<button class="primary" id="reefNoteSpecies">${noted?"✓ Saved in Field Journal":"Save to Field Journal"}</button>`:`<button class="primary" id="reefBuySpecies">Unlock · ${price(item)}</button>`}
            <button id="reefOpenShop">Open Habitat Shop</button>
          </div>
        </div>
      </div>`);
    const buy=document.getElementById("reefBuySpecies");if(buy)buy.onclick=()=>purchase(id);
    const note=document.getElementById("reefNoteSpecies");
    if(note)note.onclick=()=>{if(!state.noted.includes(id))state.noted.push(id);save();closeModal();render();announce(`${item.name} was saved to the Field Journal.`)};
    document.getElementById("reefOpenShop").onclick=openShop;
  }
  function purchase(id){
    const item=species.find(entry=>entry.id===id);if(!item||isOwned(id))return;
    if(item.currency==="gem"){if(!(window.spendAdventureKnowledgeGems?.(item.cost,`species-${item.id}`)??(state.gems>=item.cost&&(state.gems-=item.cost)>=0))){announce("Not enough Knowledge Gems.");return}}
    else{if(state.gold<item.cost){announce("Not enough Gold. Earn it from unique Math answers or completed Arcade games.");return}state.gold-=item.cost}
    state.owned.push(id);save();closeModal();render();announce(`${item.name} has joined the reef!`);setTimeout(()=>openSpecies(id),350);
  }
  function openShop(){
    signalResources("shop");
    modal(`
      <p class="reef-eyebrow">LIVING ROOM · HABITAT SHOP</p><h2>Habitat Specimen Shop</h2>
      <p class="reef-modal-lead">Locked organisms remain silhouettes. After purchase, the full organism appears in both the habitat and specimen chest.</p>
      <div class="reef-shop-grid">${species.map(item=>{const owned=isOwned(item.id);return `
        <article class="reef-card ${owned?"owned":"locked"}">
          <div class="mini-specimen">${owned?`<span class="reef-specimen-image" style="${specimenStyle(item)}"></span>`:"?"}</div>
          <h3>${esc(item.name)}</h3><span class="reef-rarity">${esc(item.rarity)}</span><p>${esc(item.role)} · ${esc(item.depth)}</p>
          <button data-shop-species="${item.id}" ${owned?"disabled":""}>${owned?"Owned":`Unlock · ${price(item)}`}</button>
        </article>`}).join("")}</div>`);
    document.querySelectorAll("[data-shop-species]").forEach(button=>button.onclick=()=>purchase(button.dataset.shopSpecies));
  }
  function openMap(){
    const regions=[{id:"coral-lagoon",name:"Coral Lagoon",detail:"Nearshore coral reef · 0–20 m",cost:0},{id:"mangrove-nursery",name:"Mangrove Nursery",detail:"Mangrove forest · 0–5 m",cost:2},{id:"kelp-coast",name:"Kelp Coast",detail:"Kelp forest · 2–30 m",cost:3}];
    modal(`
      <p class="reef-eyebrow">HABITAT MAP · COASTAL REGION</p><h2>Aquatic Habitat Map</h2>
      <p class="reef-modal-lead">Gold buys organisms and objects. Knowledge Gems expand the map itself. Unlocking records the region now; its full living scene arrives as that chapter is built.</p>
      <div class="reef-map-grid">${regions.map((region,index)=>{const unlocked=state.regions.includes(region.id);return `<article class="reef-map-card ${unlocked?"":"locked"}"><span>${String(index+1).padStart(2,"0")} · ${unlocked?"OPEN":`REQUIRES ${region.cost} KNOWLEDGE GEMS`}</span><b>${region.name}</b><small>${region.detail}</small>${region.cost?`<button data-region-unlock="${region.id}" ${unlocked?"disabled":""}>${unlocked?"✓ Region unlocked":`Unlock map region · ${region.cost} Gems`}</button>`:""}</article>`}).join("")}</div>`);
    document.querySelectorAll("[data-region-unlock]").forEach(button=>button.onclick=()=>{const region=regions.find(item=>item.id===button.dataset.regionUnlock);if(!region)return;if(!(window.spendAdventureKnowledgeGems?.(region.cost,`region-${region.id}`)??(state.gems>=region.cost&&(state.gems-=region.cost)>=0))){announce("Not enough Knowledge Gems. Forge five Science fragments into one Gem.");return}state.regions.push(region.id);save();openMap();announce(`${region.name} was added to the habitat map.`)});
  }
  function openChest(){
    signalResources("storage");
    const owned=species.filter(item=>isOwned(item.id));
    modal(`
      <p class="reef-eyebrow">SPECIMEN STORAGE</p><h2>Ecological Specimen Chest</h2>
      <p class="reef-modal-lead">${owned.length?"Every unlocked item is stored as a miniature specimen with its own profile.":"The chest is empty. Open the Habitat Shop to collect your first specimen."}</p>
      <div class="reef-chest-grid">${owned.map(item=>`<article class="reef-card owned"><div class="mini-specimen"><span class="reef-specimen-image" style="${specimenStyle(item)}"></span></div><h3>${esc(item.name)}</h3><p>${esc(item.role)}</p><button data-chest-species="${item.id}">View profile</button></article>`).join("")||`<article class="reef-status-card"><b>No specimens yet</b><span>Organisms earned from lessons or purchased in the shop will appear here.</span></article>`}</div>`);
    document.querySelectorAll("[data-chest-species]").forEach(button=>button.onclick=()=>openSpecies(button.dataset.chestSpecies));
  }
  function openLibrary(){
    modal(`
      <p class="reef-eyebrow">INFINITY LIBRARY · BOOK COLLECTION</p><h2>Choose a bookshelf</h2>
      <p class="reef-modal-lead">Active books open directly. New subjects remain on the shelves for future expansion.</p>
      <div class="library-book-grid">
        <button class="library-book math" data-book="math"><span>∑</span><b>Mathematics</b><small>Question practice</small></button>
        <button class="library-book papers" data-book="papers"><span>▤</span><b>Original Papers</b><small>SMC · TIMO · Kangaroo</small></button>
        <button class="library-book science" data-book="science"><span>⌁</span><b>Science Journal</b><small>Lessons and organism profiles</small></button>
        <button class="library-book future" disabled><span>ABC</span><b>Literature</b><small>Coming later</small></button>
        <button class="library-book future" disabled><span>⌖</span><b>History & Geography</b><small>Coming later</small></button>
      </div>`);
    document.querySelectorAll("[data-book]").forEach(button=>button.onclick=()=>openBook(button.dataset.book));
  }
  function openBook(book){
    closeModal();document.body.classList.remove("ecosystem-mode");
    if(book==="math"){document.getElementById("menuPractice")?.click();return}
    if(book==="papers"){document.getElementById("menuPractice")?.click();setTimeout(()=>{location.hash="library";document.getElementById("library")?.scrollIntoView({behavior:"smooth"})},80);return}
    if(book==="science"){activeOptions.onBack?.();setTimeout(()=>document.getElementById("cockpitLab")?.click(),80)}
  }
  function openTest(){
    document.body.classList.remove("ecosystem-mode");
    document.getElementById("menuPractice")?.click();
    setTimeout(()=>document.getElementById("testModeButton")?.click(),80);
  }
  function partPrice(part){return part.currency==="gem"?`${part.cost} Gems`:`${part.cost} Gold`}
  function chooseRobotPart(type,index){
    const part=robotParts[type]?.[index];if(!part)return;
    const inventory=state.robotInventory[type];
    if(!inventory.includes(index)){
      if(part.currency==="gem"){if(!(window.spendAdventureKnowledgeGems?.(part.cost,`robot-part-${type}-${index}`)??(state.gems>=part.cost&&(state.gems-=part.cost)>=0))){announce("Not enough Knowledge Gems.");return}}
      else{if(state.gold<part.cost){announce("Not enough Gold.");return}state.gold-=part.cost}
      inventory.push(index);
    }
    state.robotConfig[type]=index;save();openRobotShop();announce(`${part.name} equipped immediately.`);
  }
  function upgradeRobot(){
    const cost=state.robotLevel;
    if(state.robotLevel>=3){announce("The robot has reached the demo level cap.");return}
    if(!(window.spendAdventureKnowledgeGems?.(cost,"robot-upgrade")??(state.gems>=cost&&(state.gems-=cost)>=0))){announce("Not enough Knowledge Gems to upgrade.");return}
    state.robotLevel+=1;save();openRobotShop();announce(`Robot upgraded to level ${state.robotLevel}.`);
  }
  function openRobotShop(){
    signalResources("shop");
    modal(`
      <p class="reef-eyebrow">ROBOT WORKSHOP</p><h2>Build your library robot</h2>
      <p class="reef-modal-lead">Select a part and it is installed directly on the robot preview. Standard parts use Gold; advanced research parts use Knowledge Gems.</p>
      <div class="robot-workbench">${robotPreview("workshop-preview")}<div><small>ACTIVE BUILD</small><b>Orbit · Level ${state.robotLevel}</b><span>Head, arms and locomotion can be replaced independently.</span></div></div>
      <div class="robot-part-groups">${Object.entries(robotParts).map(([type,parts])=>`<section><h3>${type==="head"?"Heads":type==="arms"?"Arm Modules":"Locomotion"}</h3><div class="robot-part-grid">${parts.map((part,index)=>{const owned=state.robotInventory[type].includes(index),equipped=state.robotConfig[type]===index;return `<button class="robot-part-card ${equipped?"equipped":""}" data-part-type="${type}" data-part-index="${index}" ${equipped?"disabled":""}><span class="robot-part-thumb" style="${partStyle(type,index)}"></span><b>${esc(part.name)}</b><small>${equipped?"Equipped":owned?"Install":`Unlock · ${partPrice(part)}`}</small></button>`}).join("")}</div></section>`).join("")}</div>
      <div class="robot-upgrade-row"><div><small>GEM UPGRADE</small><b>Level ${state.robotLevel}/3</b><span>Improves habitat research and learning support.</span></div><button id="upgradeLivingRobot" ${state.robotLevel>=3?"disabled":""}>${state.robotLevel>=3?"Maximum level":`Upgrade · ${state.robotLevel} Gems`}</button></div>`);
    document.querySelectorAll("[data-part-type]").forEach(button=>button.onclick=()=>chooseRobotPart(button.dataset.partType,Number(button.dataset.partIndex)));
    document.getElementById("upgradeLivingRobot").onclick=upgradeRobot;
  }
  function openClue(id){
    const clue=clues.find(item=>item.id===id);if(!clue)return;const recorded=state.clues.includes(id);
    modal(`<p class="reef-eyebrow">DIRECT HABITAT OBSERVATION</p><h2>${esc(clue.title)}</h2><p class="reef-modal-lead">${esc(clue.text)}</p><div class="reef-fun-fact"><b>LEARN DIRECTLY FROM THE SCENE</b><p>This glowing point connects the habitat image to an ecological relationship and saves a note in the Field Journal.</p></div><div class="species-actions"><button class="primary" id="recordReefClue" ${recorded?"disabled":""}>${recorded?"✓ Recorded":"Record in Field Journal"}</button></div>`);
    document.getElementById("recordReefClue").onclick=()=>{if(!state.clues.includes(id))state.clues.push(id);save();closeModal();render();announce("Ecological observation saved.")};
  }
  function renderHub(){
    const root=document.getElementById("adventureView");if(!root)return;root.scrollTop=0;closeModal();
    document.body.classList.add("ecosystem-mode");
    signalResources("living");
    const menu=document.getElementById("adventureMenu");if(menu)menu.hidden=true;
    document.getElementById("adventureMenuButton")?.setAttribute("aria-expanded","false");
    root.innerHTML=`
      <section class="living-room-hub" aria-label="Living Room Infinity Library">
        <div class="living-hub-topbar">
          <button class="aquarium-back" id="livingBack">← Cockpit</button>
          <div class="aquarium-brand"><small>LIVING ROOM</small><strong>Infinity Library</strong></div>
          ${resourceBar("aquatic")}
        </div>
        <div class="living-hub-heading"><p class="reef-eyebrow">READ · TEST · COLLECT · GROW</p><h1>Learning &amp; Habitat Room</h1><p>Choose an area to begin.</p></div>
        <button class="living-hotspot library-zone" id="livingLibrary"><span class="living-hotspot-icon">▥</span><b>Infinity Library</b><small>Open the book collection</small></button>
        <button class="living-hotspot earth-zone" id="livingEarth"><span class="earth-orb" aria-hidden="true"></span><b>Earth Test Center</b><small>Take a mathematics test</small></button>
        <button class="living-hotspot robot-zone" id="livingRobot">${robotPreview("hub-robot-preview")}<b>Orbit · Level ${state.robotLevel}</b><small>Replace or upgrade parts</small></button>
        <button class="living-hotspot aquarium-zone" id="livingAquarium"><span class="living-hotspot-icon">≈</span><b>Coral Lagoon</b><small>Open the nearshore reef</small></button>
        <div class="living-hub-caption">Bookshelves · Test Center · Robot Workshop · Habitat Aquarium</div>
      </section>`;
    document.getElementById("livingBack").onclick=()=>{document.body.classList.remove("ecosystem-mode");activeOptions.onBack?.()};
    document.getElementById("livingLibrary").onclick=openLibrary;
    document.getElementById("livingEarth").onclick=openTest;
    document.getElementById("livingRobot").onclick=openRobotShop;
    document.getElementById("livingAquarium").onclick=render;
  }
  function render(){
    const root=document.getElementById("adventureView");if(!root)return;root.scrollTop=0;
    document.body.classList.add("ecosystem-mode");
    signalResources("aquarium");
    root.innerHTML=`
      <section class="aquarium-shell">
        <div class="aquarium-library-strip">
          <div class="aquarium-topbar">
            <button class="aquarium-back" id="aquariumBack">← Living Room</button>
            <div class="aquarium-brand"><small>LIVING ROOM · AQUARIUM</small><strong>Coastal Habitat Observatory</strong></div>
            ${resourceBar("aquatic")}
          </div>
          <div class="aquarium-intro"><p class="reef-eyebrow">DEMO HABITAT 01</p><h1>Nearshore Coral Reef</h1><p>A living 3D cross-section from the surface to a depth of 20 metres. Select an organism or glowing clue to open its learning profile.</p></div>
        </div>
        <div class="reef-workspace">
          <div class="reef-toolbar"><div class="reef-location"><strong>Coral Lagoon · Indo-Pacific</strong><small>Coastal reef · Sunlit zone · 0–20 m</small></div><div class="reef-toolbar-actions"><button id="reefMap">⌖ Map</button><button id="reefChest">▣ Chest · ${state.owned.length}/7</button><button class="reef-shop-button" id="reefShop">● Habitat Shop</button></div></div>
          <div class="reef-stage" aria-label="Coral reef cross-section with seven organism locations">
            <div class="depth-ruler">${[0,5,10,15,20].map((value,index)=>`<span style="top:${index*25}%">${value===0?"0 m":`−${value} m`}</span>`).join("")}</div>
            ${Array.from({length:12},(_,index)=>`<i class="reef-bubble" aria-hidden="true" style="left:${8+(index*7)%78}%;--bubble-speed:${7+(index%5)}s;--bubble-delay:-${index*.7}s"></i>`).join("")}
            ${species.map(item=>{const owned=isOwned(item.id);return `<button class="reef-hotspot species-${item.id} ${owned?"owned":"locked"}" data-species="${item.id}" style="left:${item.x}%;top:${item.y}%" aria-label="${owned?item.name:`Locked organism: ${item.name}`}">${owned?`<span class="reef-live-sprite" style="${specimenStyle(item)}"></span><span class="reef-hotspot-label">${esc(item.name)}</span>`:""}</button>`}).join("")}
            ${clues.map(clue=>`<button class="reef-clue ${state.clues.includes(clue.id)?"recorded":""}" data-clue="${clue.id}" style="left:${clue.x}%;top:${clue.y}%" aria-label="Observation point: ${esc(clue.title)}">${state.clues.includes(clue.id)?"✓":"✦"}</button>`).join("")}
          </div>
          <div class="reef-status-row"><article class="reef-status-card"><b>🧬 Collection ${state.owned.length}/7</b><span>A silhouette becomes a living specimen after it is unlocked.</span></article><article class="reef-status-card"><b>📓 Observations ${state.clues.length}/3</b><span>Glowing clues save short lessons to the Field Journal.</span></article><article class="reef-status-card"><b>⚡ Habitat stable</b><span>This demo uses 1 Energy. The Arcade will be the main Energy source.</span></article></div>
        </div>
      </section>`;
    document.getElementById("aquariumBack").onclick=renderHub;
    document.getElementById("reefMap").onclick=openMap;document.getElementById("reefShop").onclick=openShop;document.getElementById("reefChest").onclick=openChest;
    document.querySelectorAll("[data-species]").forEach(button=>button.onclick=()=>openSpecies(button.dataset.species));
    document.querySelectorAll("[data-clue]").forEach(button=>button.onclick=()=>openClue(button.dataset.clue));
  }
  function wireCockpit(){
    const living=document.getElementById("cockpitLiving");
    if(!living||living.dataset.aquariumReady)return;
    living.dataset.aquariumReady="true";
    living.classList.remove("locked");
    living.querySelector("small").textContent="Infinity Library · Coral Habitat";
    living.onclick=()=>window.AquariumDemo.mount({onBack:()=>document.getElementById("adventureHome")?.click()});
  }
  document.documentElement.classList.add("aquarium-demo-enabled");
  window.AquariumDemo={mount(options={}){activeOptions=options;state=load();renderHub()},showHub:renderHub,showAquarium:render,addResources(reward={}){if(!state)state=load();state.gold=Math.max(0,state.gold+(Number(reward.gold)||0));save();return{gold:Number(reward.gold)||0,energy:0}},getState:()=>{if(!state)state=load();const sharedEnergy=window.getAdventureBattleState?.().energy??state.energy;return{...state,energy:sharedEnergy,gems:gemCount(),owned:[...state.owned],noted:[...state.noted],clues:[...state.clues],regions:[...state.regions],robotConfig:{...state.robotConfig},robotInventory:{head:[...state.robotInventory.head],arms:[...state.robotInventory.arms],base:[...state.robotInventory.base]}}}};
  new MutationObserver(wireCockpit).observe(document.getElementById("adventureRoot"),{childList:true,subtree:true});
  setTimeout(wireCockpit,0);
})();
