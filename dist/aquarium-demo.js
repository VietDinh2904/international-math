(()=>{
  const STORE="international-math-ecosystem-v2";
  const species=[
    {id:"acropora",name:"San hô nhánh Acropora",scientific:"Acropora sp.",role:"Kỹ sư hệ sinh thái",rarity:"Mức bảo tồn tùy theo loài",depth:"1–15 m",food:"Tảo cộng sinh và sinh vật phù du",predators:"Sao biển gai, ốc ăn san hô",fact:"Một quần thể san hô gồm rất nhiều polyp nhỏ cùng xây bộ xương đá vôi.",currency:"gold",cost:24,x:16,y:47,ax:"0%",ay:"0%"},
    {id:"anemone",name:"Hải quỳ đầu bóng",scientific:"Entacmaea quadricolor",role:"Nơi trú ẩn cộng sinh",rarity:"Chưa đánh giá toàn cầu",depth:"1–20 m",food:"Sinh vật phù du và mảnh thức ăn nhỏ",predators:"Một số loài cá bướm và rùa biển",fact:"Tế bào châm trên xúc tu giúp hải quỳ bắt mồi và bảo vệ cá hề.",currency:"gold",cost:32,x:31,y:58,ax:"33.333%",ay:"0%"},
    {id:"clownfish",name:"Cá hề Ocellaris",scientific:"Amphiprion ocellaris",role:"Đối tác của hải quỳ",rarity:"Phổ biến",depth:"1–15 m",food:"Sinh vật phù du, tảo và mảnh thức ăn",predators:"Cá lớn sống quanh rạn",fact:"Lớp nhầy đặc biệt giúp cá hề sống giữa các xúc tu châm của hải quỳ.",currency:"gold",cost:36,x:43,y:38,ax:"66.667%",ay:"0%"},
    {id:"parrotfish",name:"Cá mó đầu gù xanh",scientific:"Bolbometopon muricatum",role:"Động vật ăn tảo và tạo cát",rarity:"Quý hiếm · cần bảo vệ",depth:"1–30 m",food:"Tảo mọc trên bề mặt rạn",predators:"Cá mập rạn lớn và con người",fact:"Mỏ khỏe giúp cá cạo tảo khỏi đá; các hạt đá vôi nhỏ sau tiêu hóa góp phần tạo cát.",currency:"gem",cost:2,x:62,y:47,ax:"100%",ay:"0%"},
    {id:"shrimp",name:"Tôm bác sĩ",scientific:"Lysmata amboinensis",role:"Trạm làm sạch",rarity:"Chưa đánh giá toàn cầu",depth:"5–40 m",food:"Ký sinh trùng và mô chết trên cá",predators:"Cá săn mồi nhỏ",fact:"Tôm vẫy râu để báo hiệu một trạm làm sạch cho những con cá ghé qua.",currency:"gold",cost:42,x:27,y:73,ax:"0%",ay:"100%"},
    {id:"crab",name:"Cua bảo vệ san hô",scientific:"Trapezia sp.",role:"Vệ sĩ của san hô",rarity:"Chưa đánh giá toàn cầu",depth:"1–20 m",food:"Chất nhầy và mảnh hữu cơ trên san hô",predators:"Bạch tuộc và cá ăn giáp xác",fact:"Cua sống giữa các nhánh san hô và có thể xua đuổi một số kẻ ăn san hô.",currency:"gold",cost:38,x:50,y:76,ax:"33.333%",ay:"100%"},
    {id:"clam",name:"Trai tai tượng",scientific:"Tridacna sp.",role:"Động vật lọc nước",rarity:"Được quản lý trong buôn bán quốc tế",depth:"1–20 m",food:"Sinh vật phù du và năng lượng từ tảo cộng sinh",predators:"Ốc, cá và con người",fact:"Tảo cực nhỏ sống trong mô giúp trai nhận thêm năng lượng từ ánh sáng.",currency:"gem",cost:3,x:72,y:76,ax:"66.667%",ay:"100%"}
  ];
  const clues=[
    {id:"symbiosis",x:35,y:42,title:"Dấu hiệu cộng sinh",text:"Cá hề nhận nơi trú ẩn, còn chuyển động của cá giúp đưa nước và chất dinh dưỡng quanh hải quỳ."},
    {id:"cleaning",x:25,y:67,title:"Trạm làm sạch",text:"Một số cá chủ động ghé tôm bác sĩ để tôm lấy ký sinh trùng và mô chết trên cơ thể chúng."},
    {id:"reef-builder",x:13,y:36,title:"Kỹ sư của rạn",text:"Bộ xương đá vôi do các polyp san hô tạo ra trở thành nền móng cho nhiều nơi ẩn náu khác."}
  ];
  const robots=[
    {id:"orbit",name:"Orbit",role:"Library helper",icon:"🤖",currency:"gold",cost:0},
    {id:"atlas",name:"Atlas",role:"Habitat engineer",icon:"🦾",currency:"gold",cost:80},
    {id:"nova",name:"Nova",role:"Research specialist",icon:"🔬",currency:"gem",cost:3}
  ];
  let state,activeOptions={};
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const defaults=()=>({version:2,gold:160,energy:8,gems:3,owned:[],noted:[],clues:[],location:"coral-lagoon",robot:"orbit",robotLevel:1,robotOwned:["orbit"]});
  function load(){try{const saved=JSON.parse(localStorage.getItem(STORE)||"null")||{};return {...defaults(),...saved,owned:Array.isArray(saved.owned)?saved.owned:[],noted:Array.isArray(saved.noted)?saved.noted:[],clues:Array.isArray(saved.clues)?saved.clues:[],robotOwned:Array.isArray(saved.robotOwned)?saved.robotOwned:["orbit"]}}catch{return defaults()}}
  const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
  const isOwned=id=>state.owned.includes(id);
  const specimenStyle=item=>`--atlas-x:${item.ax};--atlas-y:${item.ay}`;
  const price=item=>item.currency==="gem"?`◆ ${item.cost} Knowledge Gem`:`● ${item.cost} vàng`;

  function announce(message){
    document.getElementById("reefToast")?.remove();
    const toast=document.createElement("div");
    toast.className="reef-toast";toast.id="reefToast";toast.setAttribute("role","status");toast.textContent=message;
    document.body.appendChild(toast);setTimeout(()=>toast.remove(),2600);
  }
  function closeModal(){document.getElementById("reefModalLayer")?.remove()}
  function modal(content){
    closeModal();
    const layer=document.createElement("div");
    layer.className="reef-modal-backdrop";layer.id="reefModalLayer";
    layer.innerHTML=`<section class="reef-modal" role="dialog" aria-modal="true"><button class="reef-modal-close" id="reefModalClose" aria-label="Đóng">×</button>${content}</section>`;
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
      <p class="reef-modal-lead"><i>${esc(item.scientific)}</i> · ${esc(item.role)}. ${owned?"Tiêu bản đã có thể xuất hiện trong hồ.":"Hình ảnh tiêu bản sẽ chỉ xuất hiện sau khi mở khóa."}</p>
      <div class="species-detail">
        <div class="${owned?"species-portrait":"species-locked-portrait"}">${owned?`<span class="reef-specimen-image" style="${specimenStyle(item)}"></span>`:"?"}</div>
        <div>
          <div class="species-facts">
            <div><small>ĐỘ SÂU</small><b>${esc(item.depth)}</b></div>
            <div><small>ĐỘ HIẾM / BẢO TỒN</small><b>${esc(item.rarity)}</b></div>
            <div><small>THỨC ĂN</small><b>${esc(item.food)}</b></div>
            <div><small>THÚ SĂN MỒI / MỐI ĐE DỌA</small><b>${esc(item.predators)}</b></div>
          </div>
          <div class="reef-fun-fact"><b>FUN FACT</b><p>${esc(item.fact)}</p></div>
          <div class="species-actions">
            ${owned?`<button class="primary" id="reefNoteSpecies">${noted?"✓ Đã lưu trong Field Journal":"Lưu vào Field Journal"}</button>`:`<button class="primary" id="reefBuySpecies">Mở khóa · ${price(item)}</button>`}
            <button id="reefOpenShop">Mở Habitat Shop</button>
          </div>
        </div>
      </div>`);
    const buy=document.getElementById("reefBuySpecies");if(buy)buy.onclick=()=>purchase(id);
    const note=document.getElementById("reefNoteSpecies");
    if(note)note.onclick=()=>{if(!state.noted.includes(id))state.noted.push(id);save();closeModal();render();announce(`${item.name} đã được lưu vào Field Journal.`)};
    document.getElementById("reefOpenShop").onclick=openShop;
  }
  function purchase(id){
    const item=species.find(entry=>entry.id===id);if(!item||isOwned(id))return;
    const key=item.currency==="gem"?"gems":"gold";
    if(state[key]<item.cost){announce(item.currency==="gem"?"Chưa đủ Knowledge Gem.":"Chưa đủ vàng.");return}
    state[key]-=item.cost;state.owned.push(id);save();closeModal();render();announce(`${item.name} đã xuất hiện trong rạn san hô!`);setTimeout(()=>openSpecies(id),350);
  }
  function openShop(){
    modal(`
      <p class="reef-eyebrow">LIVING ROOM · HABITAT SHOP</p><h2>Cửa hàng tiêu bản</h2>
      <p class="reef-modal-lead">Sinh vật chưa mở chỉ hiện bóng khóa. Khi mua xong, tiêu bản đầy đủ xuất hiện trong rương và trong habitat.</p>
      <div class="reef-shop-grid">${species.map(item=>{const owned=isOwned(item.id);return `
        <article class="reef-card ${owned?"owned":"locked"}">
          <div class="mini-specimen">${owned?`<span class="reef-specimen-image" style="${specimenStyle(item)}"></span>`:"?"}</div>
          <h3>${esc(item.name)}</h3><span class="reef-rarity">${esc(item.rarity)}</span><p>${esc(item.role)} · ${esc(item.depth)}</p>
          <button data-shop-species="${item.id}" ${owned?"disabled":""}>${owned?"Đã sở hữu":`Mở khóa · ${price(item)}`}</button>
        </article>`}).join("")}</div>`);
    document.querySelectorAll("[data-shop-species]").forEach(button=>button.onclick=()=>purchase(button.dataset.shopSpecies));
  }
  function openMap(){
    modal(`
      <p class="reef-eyebrow">HABITAT MAP · COASTAL REGION</p><h2>Bản đồ môi sinh nước</h2>
      <p class="reef-modal-lead">Mỗi địa điểm có địa hình đáy, độ sâu và quần thể sinh vật khác nhau. Demo hiện mở vùng rạn san hô biển nông.</p>
      <div class="reef-map-grid">
        <article class="reef-map-card"><span>01 · ĐANG MỞ</span><b>Coral Lagoon</b><small>Rạn san hô sát bờ · 0–20 m</small></article>
        <article class="reef-map-card locked"><span>02 · CẦN KNOWLEDGE GEM</span><b>Mangrove Nursery</b><small>Rừng ngập mặn · 0–5 m</small></article>
        <article class="reef-map-card locked"><span>03 · CẦN KNOWLEDGE GEM</span><b>Kelp Coast</b><small>Rừng tảo bẹ · 2–30 m</small></article>
      </div>`);
  }
  function openChest(){
    const owned=species.filter(item=>isOwned(item.id));
    modal(`
      <p class="reef-eyebrow">SPECIMEN STORAGE</p><h2>Rương tiêu bản sinh thái</h2>
      <p class="reef-modal-lead">${owned.length?"Mỗi vật phẩm đã mở được lưu như một tiêu bản thu nhỏ và có hồ sơ riêng.":"Rương đang trống. Mở Habitat Shop để thu thập tiêu bản đầu tiên."}</p>
      <div class="reef-chest-grid">${owned.map(item=>`<article class="reef-card owned"><div class="mini-specimen"><span class="reef-specimen-image" style="${specimenStyle(item)}"></span></div><h3>${esc(item.name)}</h3><p>${esc(item.role)}</p><button data-chest-species="${item.id}">Xem hồ sơ</button></article>`).join("")||`<article class="reef-status-card"><b>Chưa có tiêu bản</b><span>Sinh vật đã mua hoặc nhận từ bài học sẽ xuất hiện ở đây.</span></article>`}</div>`);
    document.querySelectorAll("[data-chest-species]").forEach(button=>button.onclick=()=>openSpecies(button.dataset.chestSpecies));
  }
  function openLibrary(){
    modal(`
      <p class="reef-eyebrow">INFINITY LIBRARY · BOOK COLLECTION</p><h2>Chọn một kệ sách</h2>
      <p class="reef-modal-lead">Sách đang sử dụng được mở trực tiếp. Các môn mới vẫn nằm trên kệ để phát triển ở giai đoạn tiếp theo.</p>
      <div class="library-book-grid">
        <button class="library-book math" data-book="math"><span>∑</span><b>Mathematics</b><small>Luyện tập theo câu hỏi</small></button>
        <button class="library-book papers" data-book="papers"><span>▤</span><b>Original Papers</b><small>SMC · TIMO · Kangaroo</small></button>
        <button class="library-book science" data-book="science"><span>⌁</span><b>Science Journal</b><small>Bài học và hồ sơ sinh vật</small></button>
        <button class="library-book future" disabled><span>文</span><b>Văn học</b><small>Sẽ mở sau</small></button>
        <button class="library-book future" disabled><span>⌖</span><b>Sử & Địa</b><small>Sẽ mở sau</small></button>
      </div>`);
    document.querySelectorAll("[data-book]").forEach(button=>button.onclick=()=>openBook(button.dataset.book));
  }
  function openBook(book){
    closeModal();
    if(book==="math"){document.getElementById("menuPractice")?.click();return}
    if(book==="papers"){document.getElementById("menuPractice")?.click();setTimeout(()=>{location.hash="library";document.getElementById("library")?.scrollIntoView({behavior:"smooth"})},80);return}
    if(book==="science"){activeOptions.onBack?.();setTimeout(()=>document.getElementById("cockpitLab")?.click(),80)}
  }
  function openTest(){
    document.getElementById("menuPractice")?.click();
    setTimeout(()=>document.getElementById("testModeButton")?.click(),80);
  }
  function robotPrice(robot){return robot.currency==="gem"?`◆ ${robot.cost} Gem`:`● ${robot.cost} vàng`}
  function buyRobot(id){
    const robot=robots.find(item=>item.id===id);if(!robot)return;
    if(state.robotOwned.includes(id)){state.robot=id;save();closeModal();renderHub();announce(`${robot.name} đang đồng hành cùng bạn.`);return}
    const key=robot.currency==="gem"?"gems":"gold";
    if(state[key]<robot.cost){announce(robot.currency==="gem"?"Chưa đủ Knowledge Gem.":"Chưa đủ vàng.");return}
    state[key]-=robot.cost;state.robotOwned.push(id);state.robot=id;save();closeModal();renderHub();announce(`${robot.name} đã được mở khóa.`);
  }
  function upgradeRobot(){
    const cost=state.robotLevel;
    if(state.robotLevel>=3){announce("Robot đã đạt cấp tối đa trong bản demo.");return}
    if(state.gems<cost){announce("Chưa đủ Knowledge Gem để nâng cấp.");return}
    state.gems-=cost;state.robotLevel+=1;save();closeModal();renderHub();announce(`Robot đã lên cấp ${state.robotLevel}.`);
  }
  function openRobotShop(){
    const current=robots.find(item=>item.id===state.robot)||robots[0];
    modal(`
      <p class="reef-eyebrow">ROBOT WORKSHOP</p><h2>Đổi và nâng cấp robot</h2>
      <p class="reef-modal-lead">Robot hiện tại: <b>${esc(current.name)}</b> · cấp ${state.robotLevel}. Mẫu robot được mua bằng vàng; mẫu nghiên cứu đặc biệt dùng Knowledge Gem.</p>
      <div class="robot-shop-grid">${robots.map(robot=>{const owned=state.robotOwned.includes(robot.id),selected=state.robot===robot.id;return `<article class="robot-shop-card ${selected?"selected":""}"><span class="robot-shop-icon">${robot.icon}</span><h3>${esc(robot.name)}</h3><p>${esc(robot.role)}</p><button data-robot="${robot.id}" ${selected?"disabled":""}>${selected?"Đang sử dụng":owned?"Chọn robot":`Mua · ${robotPrice(robot)}`}</button></article>`}).join("")}</div>
      <div class="robot-upgrade-row"><div><small>GEM UPGRADE</small><b>Cấp ${state.robotLevel}/3</b><span>Tăng khả năng hỗ trợ học tập và nghiên cứu habitat.</span></div><button id="upgradeLivingRobot" ${state.robotLevel>=3?"disabled":""}>${state.robotLevel>=3?"Đã tối đa":`Nâng cấp · ◆ ${state.robotLevel} Gem`}</button></div>`);
    document.querySelectorAll("[data-robot]").forEach(button=>button.onclick=()=>buyRobot(button.dataset.robot));
    document.getElementById("upgradeLivingRobot").onclick=upgradeRobot;
  }
  function openClue(id){
    const clue=clues.find(item=>item.id===id);if(!clue)return;const recorded=state.clues.includes(id);
    modal(`<p class="reef-eyebrow">DIRECT HABITAT OBSERVATION</p><h2>${esc(clue.title)}</h2><p class="reef-modal-lead">${esc(clue.text)}</p><div class="reef-fun-fact"><b>HỌC TRỰC TIẾP TRÊN HÌNH</b><p>Điểm sáng liên kết cảnh vật với một mối quan hệ sinh thái và lưu ghi chú vào Field Journal.</p></div><div class="species-actions"><button class="primary" id="recordReefClue" ${recorded?"disabled":""}>${recorded?"✓ Đã ghi nhận":"Ghi vào Field Journal"}</button></div>`);
    document.getElementById("recordReefClue").onclick=()=>{if(!state.clues.includes(id))state.clues.push(id);save();closeModal();render();announce("Đã lưu quan sát sinh thái.")};
  }
  function renderHub(){
    const root=document.getElementById("adventureView");if(!root)return;root.scrollTop=0;closeModal();
    const robot=robots.find(item=>item.id===state.robot)||robots[0];
    root.innerHTML=`
      <section class="living-room-hub" aria-label="Living Room Infinity Library">
        <div class="living-hub-topbar">
          <button class="aquarium-back" id="livingBack">← Cockpit</button>
          <div class="aquarium-brand"><small>LIVING ROOM</small><strong>Infinity Library</strong></div>
          <div class="eco-wallet"><span class="gold">● <b>${state.gold}</b> vàng</span><span class="energy">⚡ <b>${state.energy}</b> Energy</span><span class="gems">◆ <b>${state.gems}</b> Gem</span></div>
        </div>
        <div class="living-hub-heading"><p class="reef-eyebrow">READ · TEST · COLLECT · GROW</p><h1>Phòng học và sinh thái</h1><p>Chạm vào một khu vực trong phòng để bắt đầu.</p></div>
        <button class="living-hotspot library-zone" id="livingLibrary"><span class="living-hotspot-icon">▥</span><b>Infinity Library</b><small>Mở các loại sách</small></button>
        <button class="living-hotspot earth-zone" id="livingEarth"><span class="earth-orb" aria-hidden="true"></span><b>Earth Test Center</b><small>Làm đề kiểm tra</small></button>
        <button class="living-hotspot robot-zone" id="livingRobot"><span class="living-robot-avatar">${robot.icon}</span><b>${esc(robot.name)} · Cấp ${state.robotLevel}</b><small>Đổi hoặc nâng cấp robot</small></button>
        <button class="living-hotspot aquarium-zone" id="livingAquarium"><span class="living-hotspot-icon">≈</span><b>Coral Lagoon</b><small>Mở hồ san hô sát bờ</small></button>
        <div class="living-hub-caption">Kệ sách · Test Center · Robot Workshop · Habitat Aquarium</div>
      </section>`;
    document.getElementById("livingBack").onclick=()=>activeOptions.onBack?.();
    document.getElementById("livingLibrary").onclick=openLibrary;
    document.getElementById("livingEarth").onclick=openTest;
    document.getElementById("livingRobot").onclick=openRobotShop;
    document.getElementById("livingAquarium").onclick=render;
  }
  function render(){
    const root=document.getElementById("adventureView");if(!root)return;root.scrollTop=0;
    root.innerHTML=`
      <section class="aquarium-shell">
        <div class="aquarium-library-strip">
          <div class="aquarium-topbar">
            <button class="aquarium-back" id="aquariumBack">← Living Room</button>
            <div class="aquarium-brand"><small>LIVING ROOM · AQUARIUM</small><strong>Coastal Habitat Observatory</strong></div>
            <div class="eco-wallet"><span class="gold">● <b>${state.gold}</b> vàng</span><span class="energy">⚡ <b>${state.energy}</b> Energy</span><span class="gems">◆ <b>${state.gems}</b> Gem</span></div>
          </div>
          <div class="aquarium-intro"><p class="reef-eyebrow">DEMO HABITAT 01</p><h1>Rạn san hô sát bờ</h1><p>Mặt cắt 3D từ mặt nước đến độ sâu 20 mét. Chạm vào sinh vật hoặc điểm sáng để mở hồ sơ học tập.</p></div>
        </div>
        <div class="reef-workspace">
          <div class="reef-toolbar"><div class="reef-location"><strong>Coral Lagoon · Indo-Pacific</strong><small>Coastal reef · Sunlit zone · 0–20 m</small></div><div class="reef-toolbar-actions"><button id="reefMap">⌖ Bản đồ</button><button id="reefChest">▣ Rương · ${state.owned.length}/7</button><button class="reef-shop-button" id="reefShop">● Habitat Shop</button></div></div>
          <div class="reef-stage" aria-label="Mặt cắt rạn san hô có bảy vị trí sinh vật">
            <div class="depth-ruler">${[0,5,10,15,20].map((value,index)=>`<span style="top:${index*25}%">${value===0?"0 m":`−${value} m`}</span>`).join("")}</div>
            ${Array.from({length:12},(_,index)=>`<i class="reef-bubble" aria-hidden="true" style="left:${8+(index*7)%78}%;--bubble-speed:${7+(index%5)}s;--bubble-delay:-${index*.7}s"></i>`).join("")}
            ${species.map(item=>{const owned=isOwned(item.id);return `<button class="reef-hotspot ${owned?"owned":"locked"}" data-species="${item.id}" style="left:${item.x}%;top:${item.y}%" aria-label="${owned?item.name:`Sinh vật khóa: ${item.name}`}">${owned?`<span class="reef-specimen-image" style="${specimenStyle(item)}"></span><span class="reef-hotspot-label">${esc(item.name)}</span>`:""}</button>`}).join("")}
            ${clues.map(clue=>`<button class="reef-clue ${state.clues.includes(clue.id)?"recorded":""}" data-clue="${clue.id}" style="left:${clue.x}%;top:${clue.y}%" aria-label="Điểm quan sát: ${esc(clue.title)}">${state.clues.includes(clue.id)?"✓":"✦"}</button>`).join("")}
          </div>
          <div class="reef-status-row"><article class="reef-status-card"><b>🧬 Bộ sưu tập ${state.owned.length}/7</b><span>Bóng khóa biến thành tiêu bản sau khi mở.</span></article><article class="reef-status-card"><b>📓 Quan sát ${state.clues.length}/3</b><span>Điểm sáng lưu bài học ngắn vào Field Journal.</span></article><article class="reef-status-card"><b>⚡ Habitat stable</b><span>Demo dùng 1 Energy. Arcade sẽ là nguồn Energy chính.</span></article></div>
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
  window.AquariumDemo={mount(options={}){activeOptions=options;state=load();renderHub()},showHub:renderHub,showAquarium:render,getState:()=>({...state,owned:[...state.owned],noted:[...state.noted],clues:[...state.clues],robotOwned:[...state.robotOwned]})};
  new MutationObserver(wireCockpit).observe(document.getElementById("adventureRoot"),{childList:true,subtree:true});
  setTimeout(wireCockpit,0);
})();
