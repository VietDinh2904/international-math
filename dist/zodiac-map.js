(()=>{
  const SIGNS=[
    ["aries","Aries","♈","Fire","Mar 21 – Apr 19","The Ram is one of the traditional constellations placed along the Sun's apparent yearly path."],
    ["taurus","Taurus","♉","Earth","Apr 20 – May 20","Taurus contains the bright star Aldebaran and lies near the Pleiades star cluster."],
    ["gemini","Gemini","♊","Air","May 21 – Jun 20","Gemini is recognized by two bright guide stars, Castor and Pollux."],
    ["cancer","Cancer","♋","Water","Jun 21 – Jul 22","Cancer is faint, but it contains the Beehive Cluster, a group visible to the unaided eye under dark skies."],
    ["leo","Leo","♌","Fire","Jul 23 – Aug 22","Leo's bright stars form a backward question-mark shape often called the Sickle."],
    ["virgo","Virgo","♍","Earth","Aug 23 – Sep 22","Virgo is a large constellation whose brightest star is Spica."],
    ["libra","Libra","♎","Air","Sep 23 – Oct 22","Libra represents a balance and sits between Virgo and Scorpius in the sky."],
    ["scorpio","Scorpius","♏","Water","Oct 23 – Nov 21","Scorpius has a curved line of stars and the reddish supergiant Antares."],
    ["sagittarius","Sagittarius","♐","Fire","Nov 22 – Dec 21","Part of Sagittarius resembles a teapot and points toward the center of the Milky Way."],
    ["capricorn","Capricornus","♑","Earth","Dec 22 – Jan 19","Capricornus is an old sky pattern often described as a sea-goat."],
    ["aquarius","Aquarius","♒","Air","Jan 20 – Feb 18","Aquarius lies in a region traditionally associated with water-themed constellations."],
    ["pisces","Pisces","♓","Water","Feb 19 – Mar 20","Pisces is pictured as two fish joined by a long cord of faint stars."]
  ].map(([id,name,symbol,element,dates,fact])=>({id,name,symbol,element,dates,fact,type:"star"}));
  const GUIDES=[
    {id:"guide-north",name:"North Guide Star",symbol:"✦",type:"star",element:"Navigation",fact:"A guide star helps an explorer keep a steady direction while reading a sky map."},
    {id:"guide-east",name:"Dawn Guide Star",symbol:"✧",type:"star",element:"Navigation",fact:"The eastern horizon is where celestial objects appear to rise as Earth rotates."},
    {id:"guide-south",name:"South Guide Star",symbol:"✦",type:"star",element:"Navigation",fact:"A sky map changes orientation when an observer moves between Earth's hemispheres."},
    {id:"guide-west",name:"Dusk Guide Star",symbol:"✧",type:"star",element:"Navigation",fact:"The western horizon is where celestial objects appear to set as Earth rotates."}
  ];
  const ELEMENTS=[
    {id:"element-fire",name:"Fire Element Core",symbol:"🔥",type:"element",element:"Fire",fact:"In the traditional zodiac system, Aries, Leo and Sagittarius are grouped under Fire."},
    {id:"element-earth",name:"Earth Element Core",symbol:"◆",type:"element",element:"Earth",fact:"In the traditional zodiac system, Taurus, Virgo and Capricornus are grouped under Earth."},
    {id:"element-air",name:"Air Element Core",symbol:"◌",type:"element",element:"Air",fact:"In the traditional zodiac system, Gemini, Libra and Aquarius are grouped under Air."},
    {id:"element-water",name:"Water Element Core",symbol:"💧",type:"element",element:"Water",fact:"In the traditional zodiac system, Cancer, Scorpius and Pisces are grouped under Water."}
  ];
  const CATALOG=[...SIGNS,...GUIDES,...ELEMENTS],byId=id=>CATALOG.find(item=>item.id===id);
  let activeRoot=null,activeSave=null,activeExit=null,rewardTimer=0;

  function ensure(state){
    const base={version:1,totalCorrect:0,fragments:[],solved:[],completed:false,migrated:false,selected:"aries",lastReward:null,completedAt:0};
    state.zodiac={...base,...(state.zodiac||{})};
    state.zodiac.fragments=Array.isArray(state.zodiac.fragments)?state.zodiac.fragments.filter(id=>byId(id)):[];
    state.zodiac.solved=Array.isArray(state.zodiac.solved)?state.zodiac.solved:[];
    state.zodiac.totalCorrect=Math.max(0,Math.min(60,Number(state.zodiac.totalCorrect)||0));
    state.zodiac.completed=state.zodiac.fragments.length>=CATALOG.length||state.zodiac.totalCorrect>=60;
    return state.zodiac;
  }
  function addRandomFragment(zodiac){
    const remaining=CATALOG.filter(item=>!zodiac.fragments.includes(item.id));
    if(!remaining.length)return null;
    const reward=remaining[Math.floor(Math.random()*remaining.length)];
    zodiac.fragments.push(reward.id);
    zodiac.lastReward=reward.id;
    if(zodiac.fragments.length>=CATALOG.length){zodiac.completed=true;zodiac.completedAt=Date.now()}
    return {...reward,index:zodiac.fragments.length,completed:zodiac.completed};
  }
  function migrate(state,answeredCount=0){
    const zodiac=ensure(state);
    if(zodiac.migrated)return zodiac;
    zodiac.migrated=true;
    zodiac.solved=[...new Set([...zodiac.solved,...(Array.isArray(state.used)?state.used:[])])];
    zodiac.totalCorrect=Math.min(60,Math.max(zodiac.totalCorrect,Number(answeredCount)||0));
    const earned=Math.min(CATALOG.length,Math.floor(zodiac.totalCorrect/3));
    while(zodiac.fragments.length<earned)addRandomFragment(zodiac);
    zodiac.completed=zodiac.fragments.length>=CATALOG.length;
    return zodiac;
  }
  function recordCorrect(state,questionKey=""){
    const zodiac=ensure(state);
    if(zodiac.completed||zodiac.totalCorrect>=60)return null;
    if(questionKey&&zodiac.solved.includes(questionKey))return null;
    if(questionKey)zodiac.solved.push(questionKey);
    zodiac.totalCorrect+=1;
    if(zodiac.totalCorrect%3!==0)return null;
    return addRandomFragment(zodiac);
  }
  function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
  function wedge(index){
    const step=360/CATALOG.length,a1=(-90+index*step)*Math.PI/180,a2=(-90+(index+1)*step)*Math.PI/180,r=90;
    return `polygon(50% 50%, ${50+Math.cos(a1)*r}% ${50+Math.sin(a1)*r}%, ${50+Math.cos(a2)*r}% ${50+Math.sin(a2)*r}%)`;
  }
  function selectedMarkup(zodiac){
    const item=byId(zodiac.selected)||SIGNS[0],owned=zodiac.fragments.includes(item.id)||zodiac.completed;
    return `<article class="zodiac-data-card ${owned?"is-open":"is-locked"}"><span class="zodiac-data-symbol">${owned?item.symbol:"?"}</span><div><p>${owned?item.type.toUpperCase():"LOCKED FRAGMENT"}</p><h2>${owned?esc(item.name):"Keep solving maths"}</h2>${owned?`<b>${esc(item.element)}${item.dates?` · ${esc(item.dates)}`:""}</b><span>${esc(item.fact)}</span>`:`<span>Every 3 correct answers reveals one random star or element.</span>`}</div></article>`;
  }
  function render(){
    if(!activeRoot)return;
    const state=activeRoot._zodiacState,zodiac=ensure(state),earned=zodiac.fragments.length,next=Math.min(60,(earned+1)*3),remaining=Math.max(0,60-zodiac.totalCorrect),progress=Math.round(zodiac.totalCorrect/60*100);
    const shards=CATALOG.map((item,index)=>zodiac.fragments.includes(item.id)?`<i class="zodiac-atlas-shard" style="clip-path:${wedge(index)};--shard:${index}" aria-hidden="true"></i>`:"").join("");
    const tokens=CATALOG.map(item=>{const open=zodiac.fragments.includes(item.id)||zodiac.completed;return `<button class="zodiac-token ${open?"is-open":"is-locked"} ${item.type}" data-zodiac-token="${item.id}" ${open?"":"disabled"}><span>${open?item.symbol:"?"}</span><small>${open?esc(item.name):item.type==="element"?"Element core":"Star fragment"}</small></button>`}).join("");
    activeRoot.innerHTML=`<section class="zodiac-screen"><div class="zodiac-space-bg" aria-hidden="true"></div><header class="zodiac-header"><button id="zodiacBack" type="button">← Cockpit</button><div><p>CELESTIAL CARTOGRAPHY · MATH REWARD</p><h1>Zodiac Star Atlas</h1><span>Mỗi 3 câu đúng mở 1 mảnh · Đủ 60 câu ghép hoàn chỉnh bản đồ.</span></div><div class="zodiac-score"><b>${zodiac.totalCorrect}/60</b><small>correct answers</small></div></header><main class="zodiac-layout"><section class="zodiac-atlas-panel"><div class="zodiac-atlas ${zodiac.completed?"is-complete":""}" role="img" aria-label="${zodiac.completed?"Completed":"Partly assembled"} zodiac star atlas"><div class="zodiac-atlas-locked"></div>${shards}<div class="zodiac-atlas-ring"><b>${earned}/20</b><span>fragments placed</span></div></div><div class="zodiac-progress"><i style="width:${progress}%"></i></div><div class="zodiac-next"><strong>${zodiac.completed?"ATLAS COMPLETE":"NEXT REWARD"}</strong><span>${zodiac.completed?"All constellation routes are ready to explore.":`${zodiac.totalCorrect%3||0}/3 toward the next fragment · ${remaining} answers left`}</span></div></section><aside class="zodiac-catalog"><div class="zodiac-catalog-heading"><p>DISCOVERED PIECES</p><strong>${earned} / ${CATALOG.length}</strong></div><div class="zodiac-token-grid">${tokens}</div>${selectedMarkup(zodiac)}<p class="zodiac-science-note"><b>Sky culture note:</b> The zodiac is a historical way of naming sky regions. It is not a scientific system for predicting people or events.</p></aside></main><footer class="zodiac-mission-note">${zodiac.completed?"The atlas has assembled. Select any open constellation to inspect it.":`Solve ${next-zodiac.totalCorrect} more correct maths answer${next-zodiac.totalCorrect===1?"":"s"} to uncover the next random piece.`}</footer></section>`;
    activeRoot.querySelector("#zodiacBack").onclick=()=>activeExit&&activeExit();
    activeRoot.querySelectorAll("[data-zodiac-token]").forEach(button=>button.onclick=()=>{zodiac.selected=button.dataset.zodiacToken;activeSave&&activeSave();render()});
  }
  function mount({root,state,save,onExit}){activeRoot=root;activeRoot._zodiacState=state;activeSave=save;activeExit=onExit;ensure(state);render()}
  function destroy(){activeRoot=null;activeSave=null;activeExit=null;clearTimeout(rewardTimer);document.querySelector(".zodiac-reward-overlay")?.remove()}
  function showReward(reward){
    if(!reward)return;
    clearTimeout(rewardTimer);document.querySelector(".zodiac-reward-overlay")?.remove();
    const overlay=document.createElement("div");overlay.className=`zodiac-reward-overlay ${reward.completed?"atlas-finished":""}`;
    overlay.innerHTML=`<article><div class="zodiac-reward-glow"><span>${reward.symbol}</span></div><p>${reward.type==="element"?"ELEMENT CORE FOUND":"STAR FRAGMENT FOUND"}</p><h2>${esc(reward.name)}</h2><b>Piece ${reward.index}/20 · ${reward.index*3}/60 correct answers</b>${reward.completed?"<strong>THE ZODIAC ATLAS IS COMPLETE!</strong>":""}<button type="button">Continue</button></article>`;
    const close=()=>overlay.remove();overlay.querySelector("button").onclick=close;overlay.onclick=event=>{if(event.target===overlay)close()};document.body.appendChild(overlay);if(!reward.completed)rewardTimer=setTimeout(close,4200);
  }
  window.ZodiacMap={mount,destroy,migrate,recordCorrect,showReward,ensureState:ensure,catalog:CATALOG};
})();
