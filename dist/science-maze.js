(()=>{
  "use strict";

  const GRID=[
    "#################",
    "#A.............B#",
    "#.###.#####.###.#",
    "#...............#",
    "###.#.###.#.#.###",
    "#...#.....#.#...#",
    "#.#.#######.#.#.#",
    "#.#...#XXX#...#.#",
    "#.###.#...#.###.#",
    "#.....#...#.....#",
    "#.###.##G##.###.#",
    "#...............#",
    "#.#####...#####.#",
    "#.......P.......#",
    "#################"
  ];
  const QUESTIONS=[
    {q:"Which organism is a producer in a freshwater pond?",a:["Pondweed","Frog"],right:0,why:"Pondweed uses sunlight to make its own food."},
    {q:"What does a decomposer do?",a:["Breaks down dead material","Makes sunlight"],right:0,why:"Decomposers return nutrients from dead material to the ecosystem."},
    {q:"Which structure helps a beaver enter its lodge safely?",a:["An underwater entrance","A dry chimney"],right:0,why:"The hidden underwater entrance helps protect the lodge."},
    {q:"What is pollination?",a:["The transfer of pollen","The loss of all leaves"],right:0,why:"Pollination moves pollen so flowering plants can form seeds."},
    {q:"Why do some animals migrate?",a:["To reach food or warmer places","To become decomposers"],right:0,why:"Migration helps animals find suitable food and conditions."},
    {q:"Which relationship belongs in a food chain?",a:["Prey transfers energy to a predator","A predator makes sunlight"],right:0,why:"Energy moves when one organism eats another."},
    {q:"What can earthworm tunnels add to soil?",a:["Air and pathways for water","Plastic and metal"],right:0,why:"Burrowing creates spaces that let air and water enter soil."},
    {q:"What may happen after a seed absorbs water?",a:["Germination begins","The seed becomes a rock"],right:0,why:"Water can trigger the first stages of germination."},
    {q:"Which word means an animal's natural home?",a:["Habitat","Predator"],right:0,why:"A habitat provides the conditions an organism needs."},
    {q:"Why is a food web more complex than a food chain?",a:["It connects several feeding paths","It has no organisms"],right:0,why:"A food web joins many food chains in one ecosystem."}
  ];
  const DIRS={up:{r:-1,c:0},down:{r:1,c:0},left:{r:0,c:-1},right:{r:0,c:1}};
  const KEY_DIR={ArrowUp:"up",Up:"up",w:"up",W:"up",ArrowDown:"down",Down:"down",s:"down",S:"down",ArrowLeft:"left",Left:"left",a:"left",A:"left",ArrowRight:"right",Right:"right",d:"right",D:"right"};
  let active=null;

  const cellAt=(r,c)=>GRID[r]?.[c]||"#";
  const open=(r,c)=>cellAt(r,c)!=="#";
  const find=mark=>{for(let r=0;r<GRID.length;r++){const c=GRID[r].indexOf(mark);if(c>=0)return{r,c}}return{r:1,c:1}};
  const shuffle=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  function makeEntity(pos,speed,color){return{r:pos.r,c:pos.c,from:{...pos},to:{...pos},p:1,dir:null,wish:null,speed,color,stunned:0,trail:[{...pos}]}}
  function visual(entity){const t=Math.min(1,entity.p),smooth=t*t*(3-2*t);return{x:entity.from.c+(entity.to.c-entity.from.c)*smooth+.5,y:entity.from.r+(entity.to.r-entity.from.r)*smooth+.5}}
  function neighbors(r,c){return Object.entries(DIRS).filter(([,d])=>open(r+d.r,c+d.c)).map(([name,d])=>({name,r:r+d.r,c:c+d.c}))}
  function shortestDirection(from,target,avoid){
    const queue=[{r:from.r,c:from.c,first:null}],seen=new Set([`${from.r},${from.c}`]);
    while(queue.length){const node=queue.shift();if(node.r===target.r&&node.c===target.c)return node.first;for(const next of neighbors(node.r,node.c)){const key=`${next.r},${next.c}`;if(seen.has(key)||key===avoid)continue;seen.add(key);queue.push({r:next.r,c:next.c,first:node.first||next.name})}}
    return null;
  }

  function startMove(entity,direction){const d=DIRS[direction];if(!d||!open(entity.r+d.r,entity.c+d.c))return false;entity.from={r:entity.r,c:entity.c};entity.to={r:entity.r+d.r,c:entity.c+d.c};entity.p=0;entity.dir=direction;return true}
  function steer(game,direction){
    const player=game.player;player.wish=direction;
    const position=visual(player),d=DIRS[direction],candidates=[player.from,...player.trail.slice().reverse()].filter((tile,index,self)=>self.findIndex(other=>other.r===tile.r&&other.c===tile.c)===index&&Math.hypot(position.x-(tile.c+.5),position.y-(tile.r+.5))<1.7&&d&&open(tile.r+d.r,tile.c+d.c)).sort((a,b)=>Math.hypot(position.x-(a.c+.5),position.y-(a.r+.5))-Math.hypot(position.x-(b.c+.5),position.y-(b.r+.5))),origin=candidates[0];
    if(origin){
      player.r=origin.r;player.c=origin.c;player.from={...origin};player.to={...origin};player.p=1;startMove(player,direction)
    }
  }
  function updatePlayer(game,dt){const p=game.player;if(p.p<1){p.p=Math.min(1,p.p+dt*p.speed);if(p.p<1)return;p.r=p.to.r;p.c=p.to.c;p.trail.push({r:p.r,c:p.c});if(p.trail.length>5)p.trail.shift()}if(p.wish&&startMove(p,p.wish))return;if(p.dir&&startMove(p,p.dir))return;p.from={r:p.r,c:p.c};p.to={r:p.r,c:p.c};p.p=1}
  function updateAlien(game,alien,dt,index){
    if(game.release>0)return;
    if(alien.stunned>0){alien.stunned-=dt;return}
    if(alien.p<1){alien.p=Math.min(1,alien.p+dt*alien.speed);if(alien.p<1)return;alien.r=alien.to.r;alien.c=alien.to.c}
    const all=neighbors(alien.r,alien.c),forward=all.find(move=>move.name===alien.dir),turns=all.filter(move=>move.name!==opposite(alien.dir));
    let direction=forward&&Math.random()<.68?forward.name:(turns.length?turns:all)[Math.floor(Math.random()*(turns.length||all.length))]?.name;
    startMove(alien,direction);
  }
  function opposite(dir){return({up:"down",down:"up",left:"right",right:"left"})[dir]}

  function resetPositions(game,full=false){
    const player=find("P"),aliens=[];GRID.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==="X")aliens.push({r,c})}));
    game.player=makeEntity(player,3.35,"#72f4ff");
    game.aliens=aliens.map((pos,i)=>makeEntity(pos,.72+i*.06,["#ff795b","#ff5dd7","#8e7dff"][i]));
    game.invulnerable=1.2;game.release=5;
    if(full){game.power=0;game.gun=true}
  }
  function prepareQuestion(game){
    const source=QUESTIONS[game.order[game.index%game.order.length]],answers=shuffle(source.a.map((text,i)=>({text,correct:i===source.right})));
    game.question=source;game.left=answers[0];game.right=answers[1];game.message="You have 5 seconds before three wandering aliens leave their bay.";game.locked=false;game.hint=0;resetPositions(game,true);syncHud(game)
  }
  function hitPlayer(game){
    if(game.invulnerable>0||game.locked)return;
    if(game.power>0){return}
    game.lives--;game.invulnerable=2;game.root.classList.add("maze-hit");setTimeout(()=>game.root?.classList.remove("maze-hit"),420);
    if(game.lives<=0){game.message="Ship disabled — rebooting this question.";game.lives=3}else game.message="Alien hit! Steer away and find the plasma blaster.";
    resetPositions(game,false);syncHud(game)
  }
  function answerGate(game,side){
    if(game.locked)return;game.locked=true;const answer=side==="left"?game.left:game.right;
    if(answer.correct){game.score++;game.message=`Correct! ${game.question.why}`;game.onScore(game.score);game.root.classList.add("maze-correct");setTimeout(()=>{if(!game.running)return;game.root.classList.remove("maze-correct");game.index++;if(game.index>=QUESTIONS.length)finish(game);else prepareQuestion(game)},1100)}
    else{game.lives--;game.message=`Wrong gate. ${game.question.why}`;game.root.classList.add("maze-wrong");setTimeout(()=>{if(!game.running)return;game.root.classList.remove("maze-wrong");if(game.lives<=0)game.lives=3;prepareQuestion(game)},1200)}
    syncHud(game)
  }
  function finish(game){game.running=false;cancelAnimationFrame(game.frame);game.root.innerHTML=`<section class="science-maze-finish"><div class="finish-nebula" aria-hidden="true"></div><p>CHAPTER FLIGHT COMPLETE</p><h1>${game.score}/10</h1><h2>${game.score>=8?"Excellent science navigator!":game.score>=5?"Mission complete — keep exploring.":"Good flight. Review the field notes and try again."}</h2><div><button id="mazeReplay">Fly again</button><button id="mazeExit">Back to Earth Lab</button></div></section>`;document.getElementById("mazeReplay").onclick=()=>mount(game.options);document.getElementById("mazeExit").onclick=game.onExit}

  function syncHud(game){
    const set=(id,value)=>{const el=document.getElementById(id);if(el&&el.textContent!==value)el.textContent=value};
    set("mazeQuestion",game.question.q);set("mazeLeft",`A · ${game.left.text}`);set("mazeRight",`B · ${game.right.text}`);set("mazeLives","♥".repeat(Math.max(0,game.lives))+"♡".repeat(Math.max(0,3-game.lives)));set("mazeScore",`${game.score}/10`);set("mazeMessage",game.message);
    const power=document.getElementById("mazePower");if(power){power.textContent=game.release>0?`ALIENS RELEASE IN ${Math.ceil(game.release)}s`:game.power>0?`PLASMA ${Math.ceil(game.power)}s`:game.gun?"FIND THE BLASTER":"PLASMA EMPTY";power.classList.toggle("active",game.power>0);power.classList.toggle("countdown",game.release>0)}
  }

  function drawRounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke()}
  function draw(game,time){
    const {canvas,ctx}=game,w=canvas.width,h=canvas.height,tw=w/GRID[0].length,th=h/GRID.length;
    ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w*.52,h*.36,20,w*.52,h*.36,w*.8);bg.addColorStop(0,"#183e74");bg.addColorStop(.35,"#091b43");bg.addColorStop(1,"#020713");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    game.stars.forEach(star=>{const glow=.35+.65*Math.sin(time*.001*star.s+star.p);ctx.fillStyle=`rgba(190,230,255,${glow})`;ctx.fillRect(star.x*w,star.y*h,star.r,star.r)});
    for(let r=0;r<GRID.length;r++)for(let c=0;c<GRID[r].length;c++){
      const ch=GRID[r][c],x=c*tw,y=r*th;
      if(ch==="#"){ctx.fillStyle="#071128";ctx.strokeStyle="#2879b8";ctx.lineWidth=1.4;ctx.shadowColor="#31a8ff";ctx.shadowBlur=8;drawRounded(ctx,x+2,y+2,tw-4,th-4,Math.min(tw,th)*.16);ctx.shadowBlur=0}
      else{ctx.fillStyle="rgba(44,121,180,.07)";ctx.fillRect(x,y,tw,th)}
      if(ch==="A"||ch==="B"){const left=ch==="A",answer=left?game.left:game.right,hinted=game.hint>0&&answer.correct;ctx.fillStyle=left?"rgba(74,230,255,.23)":"rgba(255,101,215,.22)";ctx.strokeStyle=hinted?"#fff36d":left?"#62f1ff":"#ff7bdc";ctx.lineWidth=hinted?7:3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=hinted?35:18;drawRounded(ctx,x+4,y+4,tw-8,th-8,9);ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font=`900 ${Math.max(12,tw*.35)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(ch,x+tw/2,y+th/2)}
    }
    const bay=find("X"),bayX=(bay.c-.18)*tw,bayY=(bay.r-.22)*th;ctx.fillStyle="rgba(255,85,185,.08)";ctx.strokeStyle="#ff67ca";ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.strokeRect(bayX,bayY,2.36*tw,1.42*th);ctx.setLineDash([]);ctx.fillStyle="#ffc3ed";ctx.font=`800 ${Math.max(9,tw*.18)}px system-ui`;ctx.textAlign="center";ctx.fillText(game.release>0?`ALIEN BAY · ${Math.ceil(game.release)}s`:"ALIEN BAY OPEN",bayX+1.18*tw,bayY-.12*th);
    if(game.gun){const gun=find("G"),x=(gun.c+.5)*tw,y=(gun.r+.5)*th,pulse=1+Math.sin(time*.008)*.1;ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);ctx.shadowColor="#ffe65d";ctx.shadowBlur=18;ctx.strokeStyle="#fff7aa";ctx.fillStyle="#ffcb39";ctx.lineWidth=2;ctx.fillRect(-tw*.22,-th*.08,tw*.38,th*.16);ctx.strokeRect(-tw*.22,-th*.08,tw*.38,th*.16);ctx.fillRect(tw*.04,th*.05,tw*.1,th*.16);ctx.restore()}
    drawShip(ctx,visual(game.player),tw,th,game.player.dir,time,game.invulnerable);
    game.aliens.forEach((alien,i)=>drawAlien(ctx,visual(alien),tw,th,alien.color,time+i*700,game.power>0));
  }
  function drawShip(ctx,pos,tw,th,dir,time,invulnerable){
    if(invulnerable>0&&Math.floor(time/90)%2)return;const angle=({up:-Math.PI/2,right:0,down:Math.PI/2,left:Math.PI})[dir]??-Math.PI/2;ctx.save();ctx.translate(pos.x*tw,pos.y*th);ctx.rotate(angle);const s=Math.min(tw,th)*.38;ctx.shadowColor="#61efff";ctx.shadowBlur=18;ctx.fillStyle="#eafcff";ctx.strokeStyle="#5cecff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(-s*.72,-s*.62);ctx.lineTo(-s*.36,0);ctx.lineTo(-s*.72,s*.62);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#4dbbff";ctx.beginPath();ctx.ellipse(s*.12,0,s*.28,s*.19,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffae35";ctx.beginPath();ctx.moveTo(-s*.5,-s*.24);ctx.lineTo(-s*(1.15+Math.sin(time*.015)*.18),0);ctx.lineTo(-s*.5,s*.24);ctx.fill();ctx.restore()}
  function drawAlien(ctx,pos,tw,th,color,time,frightened){const s=Math.min(tw,th)*.35;ctx.save();ctx.translate(pos.x*tw,pos.y*th);ctx.shadowColor=frightened?"#75f5ff":color;ctx.shadowBlur=16;ctx.fillStyle=frightened?"#235c91":color;ctx.beginPath();ctx.arc(0,-s*.1,s,Math.PI,0);ctx.lineTo(s,s*.62);ctx.lineTo(s*.52,s*.38);ctx.lineTo(0,s*.7);ctx.lineTo(-s*.52,s*.38);ctx.lineTo(-s,s*.62);ctx.closePath();ctx.fill();ctx.fillStyle="#fff";[-.35,.35].forEach(x=>{ctx.beginPath();ctx.arc(x*s,-s*.12,s*.2,0,Math.PI*2);ctx.fill()});ctx.fillStyle=frightened?"#6beeff":"#151b39";[-.35,.35].forEach(x=>{ctx.beginPath();ctx.arc(x*s,-s*.1,s*.09,0,Math.PI*2);ctx.fill()});ctx.restore()}

  function update(game,dt){
    if(game.locked)return;if(game.invulnerable>0)game.invulnerable-=dt;if(game.power>0)game.power=Math.max(0,game.power-dt);if(game.hint>0)game.hint=Math.max(0,game.hint-dt);if(game.release>0)game.release=Math.max(0,game.release-dt);
    updatePlayer(game,dt);game.aliens.forEach((alien,i)=>updateAlien(game,alien,dt*(game.hint>0?.55:1),i));
    const p=visual(game.player),gun=find("G");if(game.gun&&Math.hypot(p.x-(gun.c+.5),p.y-(gun.r+.5))<.55){game.gun=false;game.power=9;game.message="Plasma active! Touch an alien to send it back.";syncHud(game)}
    if(game.release<=0)game.aliens.forEach((alien,i)=>{if(dist(p,visual(alien))<.56){if(game.power>0){const starts=[];GRID.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==="X")starts.push({r,c})}));Object.assign(alien,makeEntity(starts[i],alien.speed,alien.color));alien.stunned=.7;game.message="Alien disabled! Keep flying.";syncHud(game)}else hitPlayer(game)}});
    if(game.player.p>=1){const ch=cellAt(game.player.r,game.player.c);if(ch==="A")answerGate(game,"left");if(ch==="B")answerGate(game,"right")}
  }
  function loop(game,time){if(!game.running)return;const dt=Math.min(.035,(time-game.last)/1000||0);game.last=time;update(game,dt);draw(game,time);syncHud(game);game.frame=requestAnimationFrame(t=>loop(game,t))}
  function resize(game){const box=game.canvas.getBoundingClientRect(),ratio=Math.min(1.5,window.devicePixelRatio||1);game.canvas.width=Math.min(1600,Math.max(620,Math.round(box.width*ratio)));game.canvas.height=Math.round(game.canvas.width*GRID.length/GRID[0].length)}

  function mount(options){
    if(active)active.destroy();const root=options.root;root.innerHTML=`<section class="science-maze-screen"><div class="maze-space-layer" aria-hidden="true"></div><header class="maze-header"><button id="mazeBack">← Earth Lab</button><div><p>CHAPTER FLIGHT REVIEW</p><h1>Escape the Alien Maze</h1></div><div class="maze-header-score"><span id="mazeLives">♥♥♥</span><b id="mazeScore">0/10</b></div></header><article class="maze-mission-panel"><small>SCIENCE TRANSMISSION</small><h2 id="mazeQuestion"></h2><div class="maze-answer-strip"><span id="mazeLeft"></span><span id="mazeRight"></span></div></article><div class="maze-stage"><canvas id="scienceMazeCanvas" tabindex="0" aria-label="Space maze game. Use arrow keys, WASD, or the touch controls."></canvas><div class="maze-cockpit-frame" aria-hidden="true"><i></i><i></i></div></div><div class="maze-status"><span id="mazePower">FIND THE BLASTER</span><p id="mazeMessage">Fly to the correct hologram gate.</p><button id="mazeHint">Hint · show safe gate</button><small>✈ Your aircraft turns early · 3 aliens wander randomly · ⚡ Gold plasma disables them</small></div><nav class="maze-dpad" aria-label="Aircraft controls"><button data-dir="up" aria-label="Fly up">▲</button><button data-dir="left" aria-label="Fly left">◀</button><button data-dir="down" aria-label="Fly down">▼</button><button data-dir="right" aria-label="Fly right">▶</button></nav></section>`;
    const canvas=document.getElementById("scienceMazeCanvas"),ctx=canvas.getContext("2d"),game={options,root:root.querySelector(".science-maze-screen"),canvas,ctx,onExit:options.onExit,onScore:options.onScore||(()=>{}),order:shuffle(QUESTIONS.map((_,i)=>i)),index:0,score:0,lives:3,power:0,hint:0,gun:true,invulnerable:0,locked:false,running:true,last:performance.now(),stars:Array.from({length:95},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+1,s:Math.random()*2+1,p:Math.random()*6}))};
    const keydown=event=>{const direction=KEY_DIR[event.key];if(direction){event.preventDefault();steer(game,direction)}};
    const resizeHandler=()=>resize(game);window.addEventListener("keydown",keydown);window.addEventListener("resize",resizeHandler);document.getElementById("mazeBack").onclick=options.onExit;document.getElementById("mazeHint").onclick=()=>{game.hint=6;game.message=`Hint active: the ${game.left.correct?"A":"B"} gate is glowing. Aliens are slowed.`;syncHud(game)};document.querySelectorAll("[data-dir]").forEach(button=>{button.onclick=event=>{event.preventDefault();steer(game,button.dataset.dir)}});
    game.destroy=()=>{game.running=false;cancelAnimationFrame(game.frame);window.removeEventListener("keydown",keydown);window.removeEventListener("resize",resizeHandler)};active=game;resetPositions(game,true);prepareQuestion(game);resize(game);game.frame=requestAnimationFrame(t=>loop(game,t));canvas.focus();
  }
  window.ScienceMaze={mount,destroy(){if(active)active.destroy();active=null}};
})();
