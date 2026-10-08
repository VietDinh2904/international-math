(()=>{
  const STORE="international-math-research-tab-v1";
  const MATH_URL="https://math-quest-lab-18.hailx.chatgpt.site/";
  const esc=value=>String(value??"").replace(/[&<>\"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function guideMarkup(){
    const resources=[
      ["●","Gold","New Math answers and completed Arcade games","Buy ordinary plants, animals and habitat items"],
      ["⚡","Energy","A new Math answer solved correctly for the first time","Power the Engine Room and maintain advanced habitats"],
      ["◆","Knowledge Gems","Finish Science investigations; forge 5 crystal fragments","Unlock rare terrain, extinct-life archives and future worlds"],
      ["💧","Water","Pass 5 Science checks at Rain Kingdom","Water crops and tune habitat moisture"],
      ["▰","Soil","Pass 5 Science checks during an Earth terrain survey","Prepare the correct root zone; soil cannot be bought with Gold"],
      ["🌰","Seeds","Find them in Science lessons or harvest mature plants","Sow the crop row and continue a plant life cycle"],
      ["✦","Fertilizer","Study decomposition and nutrient cycling","Return nutrients to soil; too much can harm roots and water"]
    ];
    const routes=[
      ["Terrain card","Garden · Terrain Console","Creates the matching land model on the right side of the Garden"],
      ["Common specimen","Compatible habitat","Can be placed only after checking food, water, shelter and climate"],
      ["Rare / synthesized specimen","Storage · Lab Queue","Keep it safely blocked until the Science Lab synthesis bay opens"],
      ["Crop seed","Garden · Crop Row","Prepare soil with tools, sow, water, grow and harvest"],
      ["Aquatic specimen","Living Room · Aquarium","Choose a matching location and depth before release"]
    ];
    const rooms=[
      ["Cockpit","OPEN","The central map. Every room and learning route returns here."],
      ["Earth Research","OPEN","Science books, Math Quest Lab and this guide."],
      ["Game Arcade","OPEN","Short review games award Gold. Energy remains tied to new Math answers."],
      ["Garden","OPEN","Crop row on the left and terrain habitat console on the right."],
      ["Storage Chest","OPEN","Tabbed archive for cards, specimens, supplies, missions and materials."],
      ["Engine Room","OPEN","Shows Energy, charging and future protection systems."],
      ["Science Lab","LOCKED","Rare, extinct and synthesized life waits in the Lab Queue until this room opens."],
      ["Living Room / Aquarium","LOCKED","Aquatic specimens remain stored until the full depth habitat opens."],
      ["Outside / Earth Defence","LOCKED","Reserved for the future Protect Earth route."]
    ];
    return `<section class="game-logic-guide"><header><p>PLAYER GUIDE · ONE CONSISTENT LOOP</p><h2>Learn → earn → store → build</h2><span>Every reward has one source and one destination. Locked systems stay visible but cannot be used early.</span></header><div class="logic-flow" aria-label="Main game flow"><article><b>1</b><strong>Learn</strong><span>Read Science or Math and answer questions.</span></article><i>›</i><article><b>2</b><strong>Earn</strong><span>Receive the resource tied to that learning action.</span></article><i>›</i><article><b>3</b><strong>Store</strong><span>Cards and objects enter the correct Storage tab.</span></article><i>›</i><article><b>4</b><strong>Build</strong><span>Use them only in a compatible unlocked room.</span></article></div><section class="logic-guide-section"><h3>Where every resource comes from</h3><div class="logic-resource-grid">${resources.map(([icon,name,source,use])=>`<article><i>${icon}</i><div><strong>${esc(name)}</strong><small>COLLECT</small><p>${esc(source)}</p><small>USE</small><p>${esc(use)}</p></div></article>`).join("")}</div></section><section class="logic-guide-section"><h3>Where every card goes</h3><div class="logic-route-table">${routes.map(([card,destination,rule])=>`<article><strong>${esc(card)}</strong><b>${esc(destination)}</b><span>${esc(rule)}</span></article>`).join("")}</div></section><section class="logic-guide-section"><h3>Room connection map</h3><div class="logic-room-grid">${rooms.map(([room,status,text])=>`<article class="${status==="LOCKED"?"is-locked":""}"><span>${status}</span><strong>${esc(room)}</strong><p>${esc(text)}</p></article>`).join("")}</div></section><aside class="logic-rule-note"><strong>No duplicate reward rule</strong><span>A specific Math question awards Gold and Energy only the first time it is solved correctly. Replaying is allowed for practice, but it does not mint the same reward again.</span></aside></section>`;
  }

  function mathMarkup(){
    return `<section class="embedded-math-library"><header><div><p>MATH BOOKS · SEPARATE LEARNING TAB</p><h2>Math Quest Lab</h2><span>The existing 18-chapter Math book stays in its own system, so questions and progress are not duplicated inside Science. Its saved progress remains in Math Quest Lab; this tab does not create a second reward record.</span></div><a href="${MATH_URL}" target="_blank" rel="noopener">Open full screen</a></header><div class="math-embed-frame"><iframe src="${MATH_URL}" title="Math Quest Lab · Chapters 1–18" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="math-embed-fallback"><strong>If the book does not appear here</strong><a href="${MATH_URL}" target="_blank" rel="noopener">Open Math Quest Lab in a new tab</a></div></div></section>`;
  }

  function enhance(root){
    if(!root||root.dataset.researchTabsReady)return;
    root.dataset.researchTabsReady="true";
    const back=root.querySelector(".science-earth-back");
    const science=document.createElement("div"),math=document.createElement("div"),guide=document.createElement("div"),nav=document.createElement("nav");
    science.className="research-tab-panel research-science-panel";
    math.className="research-tab-panel research-math-panel";
    guide.className="research-tab-panel research-guide-panel";
    nav.className="research-mode-tabs";
    nav.setAttribute("aria-label","Earth Research sections");
    nav.innerHTML=`<button data-research-tab="science">Science</button><button data-research-tab="math">Math</button><button data-research-tab="guide">How the game works</button>`;
    [...root.children].filter(node=>node!==back).forEach(node=>science.appendChild(node));
    math.innerHTML=mathMarkup();
    guide.innerHTML=guideMarkup();
    if(back)back.after(nav);else root.prepend(nav);
    root.append(science,math,guide);
    let current=localStorage.getItem(STORE)||"science";
    if(!["science","math","guide"].includes(current))current="science";
    const activate=tab=>{
      current=tab;localStorage.setItem(STORE,tab);
      nav.querySelectorAll("button").forEach(button=>{const active=button.dataset.researchTab===tab;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active))});
      science.hidden=tab!=="science";math.hidden=tab!=="math";guide.hidden=tab!=="guide";
      root.classList.toggle("showing-embedded-math",tab==="math");
    };
    nav.querySelectorAll("button").forEach(button=>button.onclick=()=>activate(button.dataset.researchTab));
    activate(current);
  }

  const observer=new MutationObserver(()=>document.querySelectorAll(".science-lab-screen.research-index").forEach(enhance));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll(".science-lab-screen.research-index").forEach(enhance);
  window.ResearchTabs={enhance,mathUrl:MATH_URL};
})();
