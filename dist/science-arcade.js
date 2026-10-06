(()=>{
  "use strict";

  const WORDS=[
    {word:"habitat",pos:"noun",meaning:"the natural home of a plant or animal",example:"A pond is a habitat for frogs and fish."},
    {word:"wetland",pos:"noun",meaning:"land that is covered or soaked with water",example:"A wetland gives food and shelter to many animals."},
    {word:"erosion",pos:"noun",meaning:"the movement of soil or rock by water, wind, or ice",example:"Plant roots can slow erosion near a river."},
    {word:"pollen",pos:"noun",meaning:"the fine powder made by a flower",example:"A bee carries pollen from one flower to another."},
    {word:"pollination",pos:"noun",meaning:"the transfer of pollen between flowers",example:"Pollination helps many flowering plants make seeds."},
    {word:"nectar",pos:"noun",meaning:"a sweet liquid made by flowers",example:"The butterfly drinks nectar with its long mouthpart."},
    {word:"disperse",pos:"verb",meaning:"to spread or move to different places",example:"Wind can disperse light seeds far from a plant."},
    {word:"mutation",pos:"noun",meaning:"a change in genetic material",example:"A mutation can create a new trait in an organism."},
    {word:"dormant",pos:"adjective",meaning:"inactive for a period in order to save energy",example:"The seed stays dormant until water and warmth arrive."},
    {word:"hibernate",pos:"verb",meaning:"to spend winter in a deep resting state",example:"Some bats hibernate when food is difficult to find."},
    {word:"migrate",pos:"verb",meaning:"to travel seasonally from one place to another",example:"Many birds migrate to warmer places in winter."},
    {word:"producer",pos:"noun",meaning:"an organism that makes its own food",example:"Pondweed is a producer because it uses sunlight."},
    {word:"consumer",pos:"noun",meaning:"an organism that gets energy by eating other organisms",example:"A tadpole is a consumer in the pond food web."},
    {word:"predator",pos:"noun",meaning:"an animal that hunts other animals for food",example:"A heron is a predator that may catch fish."},
    {word:"prey",pos:"noun",meaning:"an animal that is hunted by another animal",example:"A small fish can become prey for a heron."},
    {word:"decomposer",pos:"noun",meaning:"an organism that breaks down dead material",example:"A fungus is a decomposer that returns nutrients to soil."},
    {word:"nutrient",pos:"noun",meaning:"a substance that helps a living thing grow",example:"Plant roots absorb each nutrient from the soil."},
    {word:"burrow",pos:"noun",meaning:"a tunnel or hole made by an animal",example:"An earthworm moves through its burrow in the soil."},
    {word:"aerate",pos:"verb",meaning:"to add air to a material",example:"Earthworm tunnels aerate the soil."},
    {word:"compost",pos:"noun",meaning:"decayed plant and food material used to improve soil",example:"The gardener adds compost around the seedlings."}
  ];

  const PICTURES=[
    {word:"habitat",pos:"noun",meaning:"the natural home of a plant or animal",image:"assets/science-vocab-w1d1-v1.png",position:"left"},
    {word:"dam",pos:"noun",meaning:"a barrier that blocks or slows flowing water",image:"assets/science-vocab-w1d1-v1.png",position:"center"},
    {word:"pond",pos:"noun",meaning:"a small area of still water",image:"assets/science-vocab-w1d1-v1.png",position:"right"},
    {word:"lodge",pos:"noun",meaning:"the home built by a beaver",image:"assets/science-vocab-w1d2-v1.png",position:"left"},
    {word:"entrance",pos:"noun",meaning:"a place used to go into something",image:"assets/science-vocab-w1d2-v1.png",position:"center"},
    {word:"chamber",pos:"noun",meaning:"a room inside a structure or animal home",image:"assets/science-vocab-w1d2-v1.png",position:"right"},
    {word:"bark",pos:"noun",meaning:"the protective outer covering of a tree",image:"assets/science-vocab-w1d3-v1.png",position:"left"},
    {word:"twigs",pos:"plural noun",meaning:"small, thin branches from a tree",image:"assets/science-vocab-w1d3-v1.png",position:"center"},
    {word:"wetland",pos:"noun",meaning:"land that is covered or soaked with water",image:"assets/science-vocab-w1d4-v1.png",position:"left"},
    {word:"erosion",pos:"noun",meaning:"the movement of soil or rock by water, wind, or ice",image:"assets/science-vocab-w1d4-v1.png",position:"center"},
    {word:"silt",pos:"noun",meaning:"fine soil carried and left behind by water",image:"assets/science-vocab-w1d4-v1.png",position:"right"},
    {word:"ovary",pos:"noun",meaning:"the part of a flower that contains ovules",image:"assets/science-vocab-w2d1-v1.png",position:"left"},
    {word:"pollen",pos:"noun",meaning:"the fine powder made by a flower",image:"assets/science-vocab-w2d1-v1.png",position:"center"},
    {word:"pollination",pos:"noun",meaning:"the transfer of pollen between flowers",image:"assets/science-vocab-w2d1-v1.png",position:"right"},
    {word:"angiosperm",pos:"noun",meaning:"a plant that makes flowers and seeds inside fruit",image:"assets/science-vocab-w2d2-v1.png",position:"left"},
    {word:"pollinator",pos:"noun",meaning:"an animal that carries pollen between flowers",image:"assets/science-vocab-w2d2-v1.png",position:"center"},
    {word:"nectar",pos:"noun",meaning:"a sweet liquid made by flowers",image:"assets/science-vocab-w2d2-v1.png",position:"right"},
    {word:"mutation",pos:"noun",meaning:"a change in genetic material",image:"assets/science-vocab-w2d4-v1.png",position:"left"},
    {word:"sterile",pos:"adjective",meaning:"unable to produce offspring or seeds",image:"assets/science-vocab-w2d4-v1.png",position:"center"},
    {word:"shoot",pos:"noun",meaning:"a young stem or new plant growth",image:"assets/science-vocab-w2d4-v1.png",position:"right"}
  ];

  const LETTERS="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let active=null;
  const shuffle=list=>{const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const later=(game,fn,ms)=>{const timer=setTimeout(()=>{game.timers.delete(timer);if(active===game)fn()},ms);game.timers.add(timer);return timer};

  function shell(game,title,kicker,body,back){
    game.root.innerHTML=`<section class="science-arcade-screen"><div class="arcade-space-layer" aria-hidden="true"><i></i><i></i><i></i></div><header class="arcade-topbar"><button id="arcadeBack" type="button">← ${esc(back.label)}</button><div><p>${esc(kicker)}</p><h1>${esc(title)}</h1></div><div class="arcade-best">BEST <b>${esc(back.best)}</b></div></header>${body}</section>`;
    document.getElementById("arcadeBack").onclick=back.action;
  }

  function renderHub(game){
    game.mode="hub";
    shell(game,"Science Arcade","COCKPIT TRAINING DECK",`<main class="arcade-hub"><section class="arcade-hub-intro"><div><span>3 PLAYABLE MISSIONS</span><h2>Choose a review game</h2><p>Every mission uses the science words and ideas collected during your Earth expeditions.</p></div><div class="arcade-orbit" aria-hidden="true"><i></i><b>SCIENCE<br>ARCADE</b></div></section><section class="arcade-game-grid">
      <article class="arcade-game-card maze-card"><div class="arcade-card-art" aria-hidden="true"><span class="mini-ship">▲</span><span class="mini-alien one">●</span><span class="mini-alien two">●</span></div><p>FLIGHT + SCIENCE QUESTIONS</p><h3>Alien Maze</h3><span>Fly an aircraft to the correct gate while three aliens wander the corridors.</span><div><b>Best ${game.best.maze||0}/10</b><button id="arcadeMaze">Play maze →</button></div></article>
      <article class="arcade-game-card hangman-card"><div class="arcade-card-art ship-art" aria-hidden="true"><span class="rescue-ship">▲</span><i class="laser one"></i><i class="laser two"></i></div><p>VOCABULARY + SPELLING</p><h3>Starship Word Rescue</h3><span>Guess the missing word before alien lasers disable your starship.</span><div><b>Best ${game.best.hangman||0}/5</b><button id="arcadeHangman">Play rescue →</button></div></article>
      <article class="arcade-game-card decoder-card"><div class="arcade-card-art scan-art" aria-hidden="true"><i></i><strong>?</strong><span>SCAN COMPLETE</span></div><p>PICTURE + WORD BUILDING</p><h3>Picture Word Decoder</h3><span>Study a specimen image, then rebuild its science word from scrambled letters.</span><div><b>Best ${game.best.decoder||0}/5</b><button id="arcadeDecoder">Play decoder →</button></div></article>
    </section></main>`,{label:"Earth Lab",best:`${Math.max(game.best.hangman||0,game.best.decoder||0)}/5`,action:game.onExit});
    document.getElementById("arcadeMaze").onclick=game.onMaze;
    document.getElementById("arcadeHangman").onclick=()=>startHangman(game);
    document.getElementById("arcadeDecoder").onclick=()=>startDecoder(game);
  }

  function startHangman(game){
    game.mode="hangman";game.round=0;game.score=0;game.deck=shuffle(WORDS).slice(0,5);game.guessed=new Set();game.hp=5;game.hintUsed=false;renderHangman(game);
  }
  function masked(word,guessed,reveal=false){return word.toUpperCase().split("").map(ch=>ch===" "?" ":(reveal||guessed.has(ch)?ch:"_")).join(" ")}
  function renderHangman(game){
    const item=game.deck[game.round],done=[...new Set(item.word.toUpperCase().replace(/[^A-Z]/g,""))].every(ch=>game.guessed.has(ch));
    const ships=["Plasma Interceptor","Shield Frigate","Survey Fighter"],shipIndex=game.round%3;
    shell(game,"Starship Word Rescue","SCIENCE ARCADE · MISSION 02",`<main class="hangman-game"><section class="word-rescue-battle"><div class="battle-stars" aria-hidden="true"></div><div class="alien-cruiser" aria-hidden="true"><i></i><i></i><b>ALIEN<br>CRUISER</b></div><div class="rescue-ship-large ship-${shipIndex}" aria-hidden="true"><b>${ships[shipIndex]}</b></div><div class="laser-beam" aria-hidden="true"></div><div class="ship-hp"><span>STARSHIP SHIELD</span><div>${Array.from({length:5},(_,i)=>`<i class="${i<game.hp?"full":""}"></i>`).join("")}</div></div></section><section class="word-rescue-console"><div class="round-counter"><span>WORD ${game.round+1} / 5</span><b>SCORE ${game.score}</b></div><p class="word-clue"><em>${esc(item.pos)}</em>${esc(item.meaning)}</p><div class="masked-word" aria-label="Hidden word">${masked(item.word,game.guessed,done)}</div><div class="letter-console">${LETTERS.map(letter=>`<button data-letter="${letter}" ${game.guessed.has(letter)?"disabled":""}>${letter}</button>`).join("")}</div><div class="word-actions"><button id="wordHint" ${game.hintUsed?"disabled":""}>Hint · reveal one letter</button><p id="wordMessage">Choose a letter. A wrong answer damages one shield.</p></div></section></main>`,{label:"Game Select",best:`${game.best.hangman||0}/5`,action:()=>renderHub(game)});
    document.querySelectorAll("[data-letter]").forEach(button=>button.onclick=()=>guessLetter(game,button.dataset.letter));
    document.getElementById("wordHint").onclick=()=>useHangmanHint(game);
  }
  function useHangmanHint(game){
    if(game.hintUsed||game.locked)return;const item=game.deck[game.round],remaining=[...new Set(item.word.toUpperCase().replace(/[^A-Z]/g,""))].filter(ch=>!game.guessed.has(ch));if(!remaining.length)return;game.hintUsed=true;game.guessed.add(remaining[Math.floor(Math.random()*remaining.length)]);renderHangman(game);checkHangmanSolved(game);
  }
  function guessLetter(game,letter){
    if(game.locked||game.guessed.has(letter))return;game.guessed.add(letter);const item=game.deck[game.round];if(item.word.toUpperCase().includes(letter)){renderHangman(game);checkHangmanSolved(game)}else{game.hp--;renderHangman(game);const screen=game.root.querySelector(".science-arcade-screen"),message=document.getElementById("wordMessage");screen.classList.add(game.hp?"arcade-damage":"arcade-critical");if(message)message.textContent=game.hp?"Laser hit! One shield was lost.":`Starship disabled. The word was ${item.word.toUpperCase()}.`;later(game,()=>{if(game.hp<=0)finishHangmanRound(game,false);else screen.classList.remove("arcade-damage")},game.hp?650:1350)}}
  function checkHangmanSolved(game){const item=game.deck[game.round],solved=[...new Set(item.word.toUpperCase().replace(/[^A-Z]/g,""))].every(ch=>game.guessed.has(ch));if(!solved)return;game.score++;game.locked=true;const message=document.getElementById("wordMessage"),screen=game.root.querySelector(".science-arcade-screen");if(message)message.textContent=`Word restored! ${item.example}`;screen.classList.add("arcade-success");later(game,()=>finishHangmanRound(game,true),1250)}
  function finishHangmanRound(game){game.locked=false;game.round++;if(game.round>=game.deck.length)return finishGame(game,"hangman","Word Rescue complete");game.guessed=new Set();game.hp=5;game.hintUsed=false;renderHangman(game)}

  function startDecoder(game){game.mode="decoder";game.round=0;game.score=0;game.deck=shuffle(PICTURES).slice(0,5);game.placed=[];game.letterOrder=null;game.letterWord="";game.locked=false;game.deck.forEach(item=>{const image=new Image();image.src=item.image});renderDecoder(game)}
  function renderDecoder(game){
    const item=game.deck[game.round];
    if(game.letterWord!==item.word){game.letterOrder=shuffle(item.word.toUpperCase().split("").map((letter,index)=>({letter,index})));game.letterWord=item.word;game.placed=[]}
    const letters=game.letterOrder;
    shell(game,"Picture Word Decoder","SCIENCE ARCADE · MISSION 03",`<main class="decoder-game"><section class="specimen-scanner"><div class="scanner-frame"><div class="decoder-image ${item.position}" role="img" aria-label="Science specimen for ${esc(item.word)}" style="--decoder-image:url('${esc(item.image)}')"></div><i></i></div><div class="scanner-data"><span>SPECIMEN ${String(game.round+1).padStart(2,"0")} · SCAN READY</span><h2>What science word matches this picture?</h2><p><em>${esc(item.pos)}</em>${esc(item.meaning)}</p></div></section><section class="decoder-console"><div class="round-counter"><span>IMAGE ${game.round+1} / 5</span><b>SCORE ${game.score}</b></div><div class="decoder-slots">${item.word.split("").map((_,i)=>`<span>${game.placed[i]?esc(game.placed[i].letter):""}</span>`).join("")}</div><div class="decoder-tiles">${letters.map(tile=>`<button data-tile="${tile.index}" ${game.placed.some(used=>used.index===tile.index)?"disabled":""}>${tile.letter}</button>`).join("")}</div><div class="decoder-actions"><button id="decoderBackspace">⌫ Backspace</button><button id="decoderClear">Clear</button><p id="decoderMessage">Tap the letters in the correct order.</p></div></section></main>`,{label:"Game Select",best:`${game.best.decoder||0}/5`,action:()=>renderHub(game)});
    document.querySelectorAll("[data-tile]").forEach(button=>button.onclick=()=>placeTile(game,Number(button.dataset.tile)));
    document.getElementById("decoderBackspace").onclick=()=>{if(game.locked)return;game.placed.pop();renderDecoder(game)};
    document.getElementById("decoderClear").onclick=()=>{if(game.locked)return;game.placed=[];renderDecoder(game)};
  }
  function placeTile(game,index){if(game.locked||game.placed.some(tile=>tile.index===index))return;const tile=game.letterOrder.find(item=>item.index===index);if(!tile)return;game.placed.push(tile);renderDecoder(game);const item=game.deck[game.round];if(game.placed.length===item.word.length)checkDecoder(game)}
  function checkDecoder(game){
    const item=game.deck[game.round],answer=game.placed.map(tile=>tile.letter).join("").toLowerCase(),screen=game.root.querySelector(".science-arcade-screen"),message=document.getElementById("decoderMessage");game.locked=true;
    if(answer===item.word.toLowerCase()){game.score++;screen.classList.add("arcade-success");if(message)message.textContent=`Decoded: ${item.word.toUpperCase()} — excellent observation!`;later(game,()=>nextDecoder(game),1100)}
    else{screen.classList.add("decoder-error");if(message)message.textContent="The signal does not match. The tiles will reset.";later(game,()=>{game.locked=false;game.placed=[];renderDecoder(game)},850)}
  }
  function nextDecoder(game){game.locked=false;game.round++;if(game.round>=game.deck.length)return finishGame(game,"decoder","Picture Decoder complete");game.placed=[];game.letterOrder=null;game.letterWord="";renderDecoder(game)}

  function finishGame(game,key,title){
    game.best[key]=Math.max(game.best[key]||0,game.score);game.onScore(key,game.score);game.mode="finish";
    shell(game,title,"SCIENCE ARCADE · MISSION COMPLETE",`<main class="arcade-finish"><div class="finish-planet" aria-hidden="true"></div><p>FINAL SCORE</p><h2>${game.score}<small>/5</small></h2><h3>${game.score===5?"Perfect research flight!":game.score>=3?"Mission complete — your science skills are growing.":"Good first scan. Review the field journal and try again."}</h3><div><button id="arcadeReplay">Play again</button><button id="arcadeHome">Choose another game</button></div></main>`,{label:"Game Select",best:`${game.best[key]}/5`,action:()=>renderHub(game)});
    document.getElementById("arcadeReplay").onclick=()=>key==="hangman"?startHangman(game):startDecoder(game);
    document.getElementById("arcadeHome").onclick=()=>renderHub(game);
  }

  function mount(options){destroy();const game={root:options.root,best:{maze:options.mazeBest||0,hangman:0,decoder:0,...options.best},onExit:options.onExit,onMaze:options.onMaze,onScore:options.onScore||(()=>{}),timers:new Set(),locked:false};active=game;renderHub(game)}
  function destroy(){if(!active)return;active.timers.forEach(clearTimeout);active.timers.clear();active=null}
  window.ScienceArcade={mount,destroy};
})();
