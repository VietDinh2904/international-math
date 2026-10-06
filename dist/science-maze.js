(()=>{
  "use strict";

  const ROWS=15,COLS=17;
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
  const THEMES=[
    {wall:"#071128",line:"#2879b8",glow:"#31a8ff",floor:"rgba(44,121,180,.07)"},
    {wall:"#15102f",line:"#854fd0",glow:"#b36cff",floor:"rgba(122,82,190,.08)"},
    {wall:"#06232b",line:"#169b99",glow:"#32e4d5",floor:"rgba(41,173,162,.07)"},
    {wall:"#24140b",line:"#bd6d27",glow:"#ffad42",floor:"rgba(201,119,44,.07)"}
  ];
  let active=null;

  const shuffle=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
  const keyOf=(r,c)=>`${r},${c}`;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const cellAt=(game,r,c)=>game.grid[r]?.[c]||"#";
  const open=(game,r,c)=>cellAt(game,r,c)!=="#";
  const allOpen=grid=>{const cells=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c]!=="#")cells.push({r,c});return cells};
  const randomOf=list=>list[Math.floor(Math.random()*list.length)];
  const opposite=dir=>({up:"down",down:"up",left:"right",right:"left"})[dir];

  function carveMaze(){
    const grid=Array.from({length:ROWS},()=>Array(COLS).fill("#"));
    const start={r:1+2*Math.floor(Math.random()*((ROWS-1)/2)),c:1+2*Math.floor(Math.random()*((COLS-1)/2))};
    const stack=[start],seen=new Set([keyOf(start.r,start.c)]);grid[start.r][start.c]=".";
    while(stack.length){
      const current=stack[stack.length-1],choices=shuffle(Object.values(DIRS)).map(d=>({r:current.r+d.r*2,c:current.c+d.c*2,d})).filter(next=>next.r>0&&next.r<ROWS-1&&next.c>0&&next.c<COLS-1&&!seen.has(keyOf(next.r,next.c)));
      if(!choices.length){stack.pop();continue}
      const next=choices[0];seen.add(keyOf(next.r,next.c));grid[current.r+next.d.r][current.c+next.d.c]=".";grid[next.r][next.c]=".";stack.push({r:next.r,c:next.c});
    }
    const center={r:Math.floor(ROWS/2),c:Math.floor(COLS/2)};
    for(let r=center.r-1;r<=center.r+1;r++)for(let c=center.c-1;c<=center.c+1;c++)grid[r][c]=".";
    const oddCols=Array.from({length:(COLS-1)/2},(_,i)=>1+i*2),oddRows=Array.from({length:(ROWS-1)/2},(_,i)=>1+i*2);
    const portals={top:{r:0,c:randomOf(oddCols)},bottom:{r:ROWS-1,c:randomOf(oddCols)},left:{r:randomOf(oddRows),c:0},right:{r:randomOf(oddRows),c:COLS-1}};
    grid[portals.top.r][portals.top.c]=".";grid[1][portals.top.c]=".";grid[portals.bottom.r][portals.bottom.c]=".";grid[ROWS-2][portals.bottom.c]=".";grid[portals.left.r][portals.left.c]=".";grid[portals.left.r][1]=".";grid[portals.right.r][portals.right.c]=".";grid[portals.right.r][COLS-2]=".";
    return{grid,portals,center};
  }

  function reachable(grid,start){
    const queue=[start],seen=new Set([keyOf(start.r,start.c)]);
    while(queue.length){const node=queue.shift();for(const d of Object.values(DIRS)){const r=node.r+d.r,c=node.c+d.c,k=keyOf(r,c);if(r<0||r>=ROWS||c<0||c>=COLS||grid[r][c]==="#"||seen.has(k))continue;seen.add(k);queue.push({r,c})}}
    return seen;
  }

  function generateLevel(level){
    const layout=carveMaze(),cells=allOpen(layout.grid),player=randomOf(cells.filter(p=>Math.hypot(p.r-layout.center.r,p.c-layout.center.c)>5&&p.r>0&&p.r<ROWS-1&&p.c>0&&p.c<COLS-1));
    const connected=reachable(layout.grid,player),available=cells.filter(p=>connected.has(keyOf(p.r,p.c))&&keyOf(p.r,p.c)!==keyOf(player.r,player.c)&&Math.hypot(p.r-player.r,p.c-player.c)>5),interior=available.filter(p=>p.r>0&&p.r<ROWS-1&&p.c>0&&p.c<COLS-1);
    const leftPool=interior.filter(p=>p.c<COLS/2&&Math.hypot(p.r-layout.center.r,p.c-layout.center.c)>3),rightPool=interior.filter(p=>p.c>COLS/2&&Math.hypot(p.r-layout.center.r,p.c-layout.center.c)>3);
    const gateA=randomOf(leftPool.length?leftPool:interior),gateB=randomOf((rightPool.length?rightPool:interior).filter(p=>keyOf(p.r,p.c)!==keyOf(gateA.r,gateA.c)));
    const forbidden=new Set([keyOf(player.r,player.c),keyOf(gateA.r,gateA.c),keyOf(gateB.r,gateB.c)]),alienStarts=[{r:layout.center.r,c:layout.center.c-1},{r:layout.center.r,c:layout.center.c},{r:layout.center.r,c:layout.center.c+1}];alienStarts.forEach(p=>forbidden.add(keyOf(p.r,p.c)));
    const blasters=shuffle(interior.filter(p=>!forbidden.has(keyOf(p.r,p.c))&&Math.hypot(p.r-layout.center.r,p.c-layout.center.c)>2)).slice(0,3);
    layout.grid[gateA.r][gateA.c]="A";layout.grid[gateB.r][gateB.c]="B";layout.grid[player.r][player.c]="P";alienStarts.forEach(p=>layout.grid[p.r][p.c]="X");blasters.forEach(p=>layout.grid[p.r][p.c]="G");
    return{...layout,player,alienStarts,blasters,theme:THEMES[level%THEMES.length]};
  }

  function makeEntity(pos,speed,color){return{r:pos.r,c:pos.c,from:{...pos},to:{...pos},p:1,dir:null,speed,color,stunned:0}}
  function visual(entity){const t=Math.min(1,entity.p),smooth=t*t*(3-2*t);return{x:entity.from.c+(entity.to.c-entity.from.c)*smooth+.5,y:entity.from.r+(entity.to.r-entity.from.r)*smooth+.5}}
  function neighbors(game,r,c){return Object.entries(DIRS).filter(([,d])=>{const nr=r+d.r,nc=c+d.c;return nr>0&&nr<ROWS-1&&nc>0&&nc<COLS-1&&open(game,nr,nc)}).map(([name,d])=>({name,r:r+d.r,c:c+d.c}))}
  function playerTarget(game,r,c,direction){
    const d=DIRS[direction];if(!d)return null;const nr=r+d.r,nc=c+d.c;
    if(nr<0&&r===0&&c===game.portals.top.c)return{...game.portals.bottom,warp:true};if(nr>=ROWS&&r===ROWS-1&&c===game.portals.bottom.c)return{...game.portals.top,warp:true};if(nc<0&&c===0&&r===game.portals.left.r)return{...game.portals.right,warp:true};if(nc>=COLS&&c===COLS-1&&r===game.portals.right.r)return{...game.portals.left,warp:true};return open(game,nr,nc)?{r:nr,c:nc,warp:false}:null;
  }
  function movePlayer(game,direction){
    if(game.locked||game.player.p<1)return false;const target=playerTarget(game,game.player.r,game.player.c,direction);game.player.dir=direction;if(!target)return false;
    if(target.warp){game.player.r=target.r;game.player.c=target.c;game.player.from={r:target.r,c:target.c};game.player.to={r:target.r,c:target.c};game.player.p=1;game.message="Portal jump complete — continue toward the correct gate.";syncHud(game);return true}
    game.player.from={r:game.player.r,c:game.player.c};game.player.to={r:target.r,c:target.c};game.player.p=0;return true;
  }
  function updatePlayer(game,dt){const p=game.player;if(p.p>=1)return;p.p=Math.min(1,p.p+dt*p.speed);if(p.p>=1){p.r=p.to.r;p.c=p.to.c;p.from={r:p.r,c:p.c};p.to={r:p.r,c:p.c}}}
  function startMove(entity,direction,game){const d=DIRS[direction],nr=entity.r+d.r,nc=entity.c+d.c;if(!d||nr<=0||nr>=ROWS-1||nc<=0||nc>=COLS-1||!open(game,nr,nc))return false;entity.from={r:entity.r,c:entity.c};entity.to={r:nr,c:nc};entity.p=0;entity.dir=direction;return true}
  function updateAlien(game,alien,dt){
    if(game.release>0)return;if(alien.stunned>0){alien.stunned-=dt;return}if(alien.p<1){alien.p=Math.min(1,alien.p+dt*alien.speed);if(alien.p<1)return;alien.r=alien.to.r;alien.c=alien.to.c}
    const all=neighbors(game,alien.r,alien.c),forward=all.find(move=>move.name===alien.dir),turns=all.filter(move=>move.name!==opposite(alien.dir)),pool=turns.length?turns:all,direction=forward&&Math.random()<.58?forward.name:randomOf(pool)?.name;startMove(alien,direction,game);
  }

  function resetEntities(game){
    const level=generateLevel(game.index);game.grid=level.grid;game.portals=level.portals;game.center=level.center;game.theme=level.theme;game.alienStarts=level.alienStarts;game.blasterKeys=new Set(level.blasters.map(p=>keyOf(p.r,p.c)));game.player=makeEntity(level.player,7.5,"#72f4ff");game.aliens=level.alienStarts.map((pos,i)=>makeEntity(pos,.48+i*.035,["#ff795b","#ff5dd7","#8e7dff"][i]));game.invulnerable=1.2;game.release=5;game.power=0;
  }
  function prepareQuestion(game){const source=QUESTIONS[game.order[game.index%game.order.length]],answers=shuffle(source.a.map((text,i)=>({text,correct:i===source.right})));game.question=source;game.left=answers[0];game.right=answers[1];game.message="Explore one tile at a time. Three aliens leave the central bay in 5 seconds.";game.locked=false;game.hint=0;resetEntities(game);syncHud(game)}
  function respawnPlayer(game){const cells=allOpen(game.grid).filter(p=>!"ABX".includes(cellAt(game,p.r,p.c))&&Math.hypot(p.r-game.center.r,p.c-game.center.c)>5),spot=randomOf(cells);game.player=makeEntity(spot,7.5,"#72f4ff");game.invulnerable=2}
  function hitPlayer(game){if(game.invulnerable>0||game.locked||game.power>0)return;game.lives--;game.root.classList.add("maze-hit");setTimeout(()=>game.root?.classList.remove("maze-hit"),420);if(game.lives<=0){game.message="Aircraft disabled — shields rebooted at a new tile.";game.lives=3}else game.message="Alien contact! Respawning away from the central bay.";respawnPlayer(game);syncHud(game)}
  function answerGate(game,side){
    if(game.locked)return;game.locked=true;const answer=side==="left"?game.left:game.right;if(answer.correct){game.score++;game.message=`Correct! ${game.question.why}`;game.onScore(game.score);game.root.classList.add("maze-correct");setTimeout(()=>{if(!game.running)return;game.root.classList.remove("maze-correct");game.index++;if(game.index>=QUESTIONS.length)finish(game);else prepareQuestion(game)},1100)}else{game.lives--;game.message=`Wrong gate. ${game.question.why}`;game.root.classList.add("maze-wrong");setTimeout(()=>{if(!game.running)return;game.root.classList.remove("maze-wrong");if(game.lives<=0)game.lives=3;prepareQuestion(game)},1200)}syncHud(game)
  }
  function finish(game){game.running=false;cancelAnimationFrame(game.frame);stopHold(game);game.root.innerHTML=`<section class="science-maze-finish"><div class="finish-nebula" aria-hidden="true"></div><p>CHAPTER FLIGHT COMPLETE</p><h1>${game.score}/10</h1><h2>${game.score>=8?"Excellent science navigator!":game.score>=5?"Mission complete — keep exploring.":"Good flight. Review the field notes and try again."}</h2><div><button id="mazeReplay">Fly again</button><button id="mazeExit">Back to Earth Lab</button></div></section>`;document.getElementById("mazeReplay").onclick=()=>mount(game.options);document.getElementById("mazeExit").onclick=game.onExit}

  function syncHud(game){
    const set=(id,value)=>{const el=document.getElementById(id);if(el&&el.textContent!==value)el.textContent=value};set("mazeQuestion",game.question.q);set("mazeLeft",`A · ${game.left.text}`);set("mazeRight",`B · ${game.right.text}`);set("mazeLives","♥".repeat(Math.max(0,game.lives))+"♡".repeat(Math.max(0,3-game.lives)));set("mazeScore",`${game.score}/10`);set("mazeMessage",game.message);const power=document.getElementById("mazePower");if(power){power.textContent=game.release>0?`ALIENS RELEASE IN ${Math.ceil(game.release)}s`:game.power>0?`PLASMA ${Math.ceil(game.power)}s`:game.blasterKeys.size?`${game.blasterKeys.size} BLASTERS ON MAP`:"BLASTERS COLLECTED";power.classList.toggle("active",game.power>0);power.classList.toggle("countdown",game.release>0)}
  }

  function drawRounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke()}
  function draw(game,time){
    const {canvas,ctx}=game,w=canvas.width,h=canvas.height,tw=w/COLS,th=h/ROWS,theme=game.theme;ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w*.52,h*.36,20,w*.52,h*.36,w*.8);bg.addColorStop(0,"#183e74");bg.addColorStop(.35,"#091b43");bg.addColorStop(1,"#020713");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);game.stars.forEach(star=>{const glow=.35+.65*Math.sin(time*.001*star.s+star.p);ctx.fillStyle=`rgba(190,230,255,${glow})`;ctx.fillRect(star.x*w,star.y*h,star.r,star.r)});
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const ch=cellAt(game,r,c),x=c*tw,y=r*th;if(ch==="#"){ctx.fillStyle=theme.wall;ctx.strokeStyle=theme.line;ctx.lineWidth=1.4;ctx.shadowColor=theme.glow;ctx.shadowBlur=7;drawRounded(ctx,x+2,y+2,tw-4,th-4,Math.min(tw,th)*.17);ctx.shadowBlur=0}else{ctx.fillStyle=theme.floor;ctx.fillRect(x,y,tw,th)}if(ch==="A"||ch==="B"){const left=ch==="A",answer=left?game.left:game.right,hinted=game.hint>0&&answer.correct;ctx.fillStyle=left?"rgba(74,230,255,.25)":"rgba(255,101,215,.24)";ctx.strokeStyle=hinted?"#fff36d":left?"#62f1ff":"#ff7bdc";ctx.lineWidth=hinted?7:3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=hinted?35:18;drawRounded(ctx,x+4,y+4,tw-8,th-8,9);ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font=`900 ${Math.max(12,tw*.35)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(ch,x+tw/2,y+th/2)}}
    Object.values(game.portals).forEach(portal=>{const x=(portal.c+.5)*tw,y=(portal.r+.5)*th;ctx.strokeStyle="#7dfff0";ctx.lineWidth=3;ctx.shadowColor="#54fff0";ctx.shadowBlur=16;ctx.beginPath();ctx.arc(x,y,Math.min(tw,th)*.3,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0});
    const bayX=(game.center.c-1.55)*tw,bayY=(game.center.r-.7)*th;ctx.fillStyle="rgba(255,85,185,.08)";ctx.strokeStyle="#ff67ca";ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.strokeRect(bayX,bayY,3.1*tw,1.4*th);ctx.setLineDash([]);ctx.fillStyle="#ffc3ed";ctx.font=`800 ${Math.max(9,tw*.18)}px system-ui`;ctx.textAlign="center";ctx.fillText(game.release>0?`ALIEN BAY · ${Math.ceil(game.release)}s`:"ALIEN BAY OPEN",game.center.c*tw+tw/2,bayY-.12*th);
    game.blasterKeys.forEach(key=>{const [r,c]=key.split(",").map(Number),x=(c+.5)*tw,y=(r+.5)*th,pulse=1+Math.sin(time*.008+r)*.1;ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);ctx.shadowColor="#ffe65d";ctx.shadowBlur=18;ctx.strokeStyle="#fff7aa";ctx.fillStyle="#ffcb39";ctx.lineWidth=2;ctx.fillRect(-tw*.22,-th*.08,tw*.38,th*.16);ctx.strokeRect(-tw*.22,-th*.08,tw*.38,th*.16);ctx.fillRect(tw*.04,th*.05,tw*.1,th*.16);ctx.restore()});drawShip(ctx,visual(game.player),tw,th,game.player.dir,time,game.invulnerable);game.aliens.forEach((alien,i)=>drawAlien(ctx,visual(alien),tw,th,alien.color,time+i*700,game.power>0));
  }
  function drawShip(ctx,pos,tw,th,dir,time,invulnerable){if(invulnerable>0&&Math.floor(time/90)%2)return;const angle=({up:-Math.PI/2,right:0,down:Math.PI/2,left:Math.PI})[dir]??-Math.PI/2;ctx.save();ctx.translate(pos.x*tw,pos.y*th);ctx.rotate(angle);const s=Math.min(tw,th)*.38;ctx.shadowColor="#61efff";ctx.shadowBlur=18;ctx.fillStyle="#eafcff";ctx.strokeStyle="#5cecff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(-s*.72,-s*.62);ctx.lineTo(-s*.36,0);ctx.lineTo(-s*.72,s*.62);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#4dbbff";ctx.beginPath();ctx.ellipse(s*.12,0,s*.28,s*.19,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffae35";ctx.beginPath();ctx.moveTo(-s*.5,-s*.24);ctx.lineTo(-s*(1.15+Math.sin(time*.015)*.18),0);ctx.lineTo(-s*.5,s*.24);ctx.fill();ctx.restore()}
  function drawAlien(ctx,pos,tw,th,color,time,frightened){const s=Math.min(tw,th)*.35;ctx.save();ctx.translate(pos.x*tw,pos.y*th);ctx.shadowColor=frightened?"#75f5ff":color;ctx.shadowBlur=16;ctx.fillStyle=frightened?"#235c91":color;ctx.beginPath();ctx.arc(0,-s*.1,s,Math.PI,0);ctx.lineTo(s,s*.62);ctx.lineTo(s*.52,s*.38);ctx.lineTo(0,s*.7);ctx.lineTo(-s*.52,s*.38);ctx.lineTo(-s,s*.62);ctx.closePath();ctx.fill();ctx.fillStyle="#fff";[-.35,.35].forEach(x=>{ctx.beginPath();ctx.arc(x*s,-s*.12,s*.2,0,Math.PI*2);ctx.fill()});ctx.fillStyle=frightened?"#6beeff":"#151b39";[-.35,.35].forEach(x=>{ctx.beginPath();ctx.arc(x*s,-s*.1,s*.09,0,Math.PI*2);ctx.fill()});ctx.restore()}
  function update(game,dt){
    if(game.locked)return;if(game.invulnerable>0)game.invulnerable-=dt;if(game.power>0)game.power=Math.max(0,game.power-dt);if(game.hint>0)game.hint=Math.max(0,game.hint-dt);if(game.release>0)game.release=Math.max(0,game.release-dt);updatePlayer(game,dt);game.aliens.forEach(alien=>updateAlien(game,alien,dt*(game.hint>0?.55:1)));const p=visual(game.player),tile=keyOf(game.player.r,game.player.c);if(game.player.p>=1&&game.blasterKeys.has(tile)){game.blasterKeys.delete(tile);game.power=Math.max(game.power,9);game.message="Plasma active! Touch an alien to return it to the central bay.";syncHud(game)}if(game.release<=0)game.aliens.forEach((alien,i)=>{if(dist(p,visual(alien))<.56){if(game.power>0){Object.assign(alien,makeEntity(game.alienStarts[i],alien.speed,alien.color));alien.stunned=.7;game.message="Alien disabled! Keep flying.";syncHud(game)}else hitPlayer(game)}});if(game.player.p>=1){const ch=cellAt(game,game.player.r,game.player.c);if(ch==="A")answerGate(game,"left");if(ch==="B")answerGate(game,"right")}
  }
  function loop(game,time){if(!game.running)return;const dt=Math.min(.035,(time-game.last)/1000||0);game.last=time;update(game,dt);draw(game,time);syncHud(game);game.frame=requestAnimationFrame(t=>loop(game,t))}
  function resize(game){const box=game.canvas.getBoundingClientRect(),ratio=Math.min(1.5,window.devicePixelRatio||1);game.canvas.width=Math.min(1600,Math.max(620,Math.round(box.width*ratio)));game.canvas.height=Math.round(game.canvas.width*ROWS/COLS)}
  function stopHold(game){clearTimeout(game.holdDelay);clearInterval(game.holdInterval);game.holdDelay=0;game.holdInterval=0;game.heldDirection=null}
  function startHold(game,direction){if(game.heldDirection===direction)return;stopHold(game);game.heldDirection=direction;movePlayer(game,direction);game.holdDelay=setTimeout(()=>{game.holdInterval=setInterval(()=>movePlayer(game,direction),145)},310)}

  function mount(options){
    if(active)active.destroy();const root=options.root;root.innerHTML=`<section class="science-maze-screen"><div class="maze-space-layer" aria-hidden="true"></div><header class="maze-header"><button id="mazeBack">← Earth Lab</button><div><p>CHAPTER FLIGHT REVIEW</p><h1>Escape the Alien Maze</h1></div><div class="maze-header-score"><span id="mazeLives">♥♥♥</span><b id="mazeScore">0/10</b></div></header><article class="maze-mission-panel"><small>SCIENCE TRANSMISSION</small><h2 id="mazeQuestion"></h2><div class="maze-answer-strip"><span id="mazeLeft"></span><span id="mazeRight"></span></div></article><div class="maze-stage"><canvas id="scienceMazeCanvas" tabindex="0" aria-label="Random space maze. Move one tile with each arrow-key or control-button press. Hold to repeat slightly faster."></canvas><div class="maze-cockpit-frame" aria-hidden="true"><i></i><i></i></div></div><div class="maze-status"><span id="mazePower">3 BLASTERS ON MAP</span><p id="mazeMessage">Fly to the correct hologram gate.</p><button id="mazeHint">Hint · show safe gate</button><small>One press = one tile · Hold = controlled repeat · Edge portals cross the map · Aliens wander after 5 seconds</small></div><nav class="maze-dpad" aria-label="Aircraft controls"><button data-dir="up" aria-label="Fly up">▲</button><button data-dir="left" aria-label="Fly left">◀</button><button data-dir="down" aria-label="Fly down">▼</button><button data-dir="right" aria-label="Fly right">▶</button></nav></section>`;
    const canvas=document.getElementById("scienceMazeCanvas"),ctx=canvas.getContext("2d"),game={options,root:root.querySelector(".science-maze-screen"),canvas,ctx,onExit:options.onExit,onScore:options.onScore||(()=>{}),order:shuffle(QUESTIONS.map((_,i)=>i)),index:0,score:0,lives:3,power:0,hint:0,invulnerable:0,locked:false,running:true,last:performance.now(),heldDirection:null,holdDelay:0,holdInterval:0,stars:Array.from({length:95},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+1,s:Math.random()*2+1,p:Math.random()*6}))};
    const keydown=event=>{const direction=KEY_DIR[event.key];if(direction){event.preventDefault();if(!event.repeat)startHold(game,direction)}};const keyup=event=>{if(KEY_DIR[event.key]===game.heldDirection)stopHold(game)};const blur=()=>stopHold(game);const resizeHandler=()=>resize(game);window.addEventListener("keydown",keydown);window.addEventListener("keyup",keyup);window.addEventListener("blur",blur);window.addEventListener("resize",resizeHandler);document.getElementById("mazeBack").onclick=options.onExit;document.getElementById("mazeHint").onclick=()=>{game.hint=6;game.message=`Hint active: the ${game.left.correct?"A":"B"} gate is glowing. Aliens are slowed.`;syncHud(game)};document.querySelectorAll("[data-dir]").forEach(button=>{button.onpointerdown=event=>{event.preventDefault();button.setPointerCapture?.(event.pointerId);startHold(game,button.dataset.dir)};button.onpointerup=button.onpointercancel=button.onpointerleave=()=>stopHold(game);button.onclick=event=>{if(event.detail===0)movePlayer(game,button.dataset.dir)}});
    game.destroy=()=>{game.running=false;cancelAnimationFrame(game.frame);stopHold(game);window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup);window.removeEventListener("blur",blur);window.removeEventListener("resize",resizeHandler)};active=game;prepareQuestion(game);resize(game);game.frame=requestAnimationFrame(t=>loop(game,t));canvas.focus();
  }
  window.ScienceMaze={mount,destroy(){if(active)active.destroy();active=null}};
})();
