(()=>{
  "use strict";
  const expansion=window.ScienceExpansion;
  if(!expansion)return;

  const word=(en,vi,meaning,pos,example)=>({en,vi,meaning,pos,example});
  const mcq=(prompt,choices,right,why,hint1,hint2)=>({type:"mcq",prompt,choices,right,why,hint1,hint2});
  const tf=(prompt,statement,booleanAnswer,why,hint1,hint2)=>({type:"truefalse",prompt,statement,booleanAnswer,why,hint1,hint2});
  const gap=(prompt,gapPrompt,choices,right,why,hint1,hint2)=>({type:"gap",prompt,gapPrompt,choices,right,why,hint1,hint2});
  const matching=(prompt,pairs,why,hint1,hint2)=>({type:"matching",prompt,pairs,why,hint1,hint2});

  function makeQuestions(meta,dayIndex,terms){
    const fact=meta.facts[dayIndex],t0=terms[0],t1=terms[1],t2=terms[2];
    const statement=mcq("Which statement best supports today's investigation?",[fact,"The evidence shows that living systems never change.","Only size matters, so structure and environment can be ignored."],0,fact,"Look for the statement connected to the weekly question.","Use the evidence in today's field log.");
    const truth=tf("Test today's evidence.",fact,true,"This statement summarizes the scientific evidence in today's lesson.","Return to the field log.","The statement is supported by the lesson evidence.");
    const vocabulary=gap("Complete the science vocabulary record.",`The term meaning “${t0.meaning}” is ____.`,[t0.en,t1.en,t2.en],0,`${t0.en} means ${t0.meaning}.`,"Compare the three definitions.",`The answer begins with ${t0.en.charAt(0).toUpperCase()}.`);
    const pairs=matching("Match each science term to its meaning.",terms.map(item=>({left:item.en,right:item.meaning})),"The three terms describe evidence used in this investigation.","Start with the most familiar term.","Use the vocabulary examples as clues.");
    if(dayIndex===0)return[statement,truth,pairs];
    if(dayIndex===1)return[vocabulary,statement,truth];
    if(dayIndex===2)return[pairs,statement,vocabulary];
    if(dayIndex===3)return[truth,pairs,statement];
    return[statement,vocabulary,truth,pairs,mcq("What is the strongest answer to the weekly question?",[meta.answer,"The weekly evidence is unrelated to the question.","One observation always explains every ecosystem and organism."],0,meta.answer,"Connect all four investigations.","Choose the explanation that uses several pieces of evidence.")];
  }

  function makeWeek(meta){
    const days=[null];
    for(let i=0;i<5;i++){
      const terms=[meta.terms[i%meta.terms.length],meta.terms[(i+1)%meta.terms.length],meta.terms[(i+2)%meta.terms.length]];
      days.push({
        day:i+1,
        title:meta.dayTitles[i],
        short:meta.dayShort[i],
        image:meta.background,
        icon:meta.icons[i],
        reward:`${meta.reward} ${i+1}`,
        rewardIcon:i===4?"💎":["🗺️","🔬","🧪","📊"][i],
        story:`${meta.context} ${meta.facts[i]}`,
        guide:meta.guide,
        guideLine:meta.guideLines[i],
        words:terms,
        questions:makeQuestions(meta,i,terms)
      });
    }
    return {number:meta.number,title:meta.title,subtitle:`Grade ${meta.grade} · Big Idea ${meta.bigIdea} · Week ${meta.bookWeek}${meta.review?" · Unit Review":""}`,guide:meta.guide,hero:meta.background,days,source:{grade:meta.grade,bigIdea:meta.bigIdea,bookWeek:meta.bookWeek,pages:meta.pages},overview:meta.facts};
  }

  const g5BodyTerms=[
    word("cell","tế bào","the smallest living unit of an organism","noun","A muscle cell performs a specialized job."),
    word("tissue","mô","a group of similar cells working together","noun","Muscle tissue produces movement."),
    word("organ","cơ quan","a body structure made of different tissues","noun","Skin is the body's largest organ."),
    word("organ system","hệ cơ quan","a group of organs cooperating to perform major functions","noun phrase","The digestive system is an organ system."),
    word("specialized","chuyên biệt","adapted to perform a particular function","adjective","A red blood cell is specialized to carry oxygen.")
  ];
  const g5BearTerms=[
    word("adaptation","đặc điểm thích nghi","a feature that helps an organism survive or reproduce","noun","A panda's extra thumb is an adaptation for gripping bamboo."),
    word("consumer","sinh vật tiêu thụ","an organism that obtains energy by eating other organisms","noun","Both pandas and polar bears are consumers."),
    word("herbivore","động vật ăn cỏ","an animal that eats mostly plants","noun","A panda is a specialized herbivore."),
    word("omnivore","động vật ăn tạp","an animal that eats both plants and animals","noun","Many bears are omnivores."),
    word("carnivore","động vật ăn thịt","an animal that eats other animals","noun","A polar bear is mainly a carnivore.")
  ];
  const g5LionTerms=[
    word("predator","động vật săn mồi","an animal that hunts and eats other animals","noun","A lion is a savanna predator."),
    word("prey","con mồi","an organism hunted by a predator","noun","Zebras can become prey for lions."),
    word("savanna","xavan","a tropical grassland with scattered trees","noun","Lions live in the African savanna."),
    word("food chain","chuỗi thức ăn","a single pathway of feeding and energy transfer","noun phrase","Grass, zebra and lion form a food chain."),
    word("food web","lưới thức ăn","interconnected food chains in an ecosystem","noun phrase","The savanna food web includes many predators and prey.")
  ];
  const g5RainforestTerms=[
    word("producer","sinh vật sản xuất","an organism that makes its own food","noun","Rainforest plants are producers."),
    word("canopy","tán rừng","the leafy roof formed by rainforest trees","noun","Many rainforest species live in the canopy."),
    word("understory","tầng dưới tán","the shaded plant layer below the canopy","noun","Young trees grow in the understory."),
    word("epiphyte","thực vật biểu sinh","a plant that grows on another plant without taking its food","noun","An orchid can grow as an epiphyte high in a tree."),
    word("diversity","sự đa dạng","the variety of living things in an area","noun","Warm wet conditions support rainforest diversity.")
  ];
  const g5EcoTerms=[
    word("ecosystem","hệ sinh thái","a community of organisms interacting with their environment","noun","A rainforest is a complex ecosystem."),
    word("producer","sinh vật sản xuất","an organism that makes food from light or chemicals","noun","Plants are producers in most land ecosystems."),
    word("consumer","sinh vật tiêu thụ","an organism that gets energy by eating","noun","A lion is a consumer."),
    word("decomposer","sinh vật phân hủy","an organism that breaks down dead material","noun","Earthworms help decomposers recycle matter."),
    word("adaptation","đặc điểm thích nghi","a feature that improves survival in an environment","noun","Webbed feet are a polar bear adaptation.")
  ];
  const g6GeneticsTerms=[
    word("gene","gen","a segment of DNA that influences a trait","noun","A gene can influence kernel color."),
    word("chromosome","nhiễm sắc thể","a package of DNA and protein inside a cell nucleus","noun","Human body cells normally contain chromosome pairs."),
    word("DNA","ADN","the genetic material carrying hereditary instructions","noun","DNA is copied when cells divide."),
    word("heredity","di truyền","the transmission of traits from parents to offspring","noun","Heredity creates family resemblances."),
    word("genetic variation","biến dị di truyền","inherited differences among members of a species","noun phrase","Corn colors show genetic variation.")
  ];
  const g6ExtinctionTerms=[
    word("ecosystem","hệ sinh thái","organisms and nonliving conditions interacting in an area","noun","Habitat loss changes an ecosystem."),
    word("extinction","sự tuyệt chủng","the permanent loss of every member of a species","noun","The dodo experienced extinction."),
    word("niche","ổ sinh thái","an organism's role and way of obtaining resources in an ecosystem","noun","A species cannot survive if its niche disappears."),
    word("predation","sự săn mồi","the interaction in which one animal hunts another","noun","Introduced predators can increase predation."),
    word("uninhabitable","không thể sinh sống","unable to support life for a particular organism","adjective","Severe change can make a habitat uninhabitable.")
  ];
  const g6CrocTerms=[
    word("exploit","tận dụng","to use a resource or condition successfully","verb","Crocodiles exploit many kinds of habitat."),
    word("ectothermic","biến nhiệt","depending mainly on outside sources for body heat","adjective","An ectothermic crocodile warms in sunlight."),
    word("dormancy","trạng thái ngủ nghỉ","a resting state with greatly reduced activity","noun","Dormancy helps crocodiles survive drought."),
    word("endangered","nguy cấp","at serious risk of extinction","adjective","The gharial is endangered."),
    word("conservation","bảo tồn","protection and careful management of nature","noun","Habitat conservation can protect crocodiles.")
  ];
  const g6PolarTerms=[
    word("threatened","bị đe dọa","likely to become endangered if conditions worsen","adjective","Melting sea ice leaves polar bears threatened."),
    word("tundra","lãnh nguyên","a cold treeless region with frozen subsoil","noun","Some polar bears forage on tundra land."),
    word("carnivorous","ăn thịt","feeding mainly on animals","adjective","Polar bears are highly carnivorous."),
    word("malnourished","suy dinh dưỡng","in poor health because of insufficient or unbalanced food","adjective","A bear unable to catch seals may become malnourished."),
    word("foraging","kiếm ăn","searching widely for food","noun","Some bears are foraging on land.")
  ];
  const g6HumanTerms=[
    word("hominid","họ người","a human or an extinct human ancestor","noun","Early hominids developed useful tools."),
    word("omnivore","động vật ăn tạp","an organism that eats plants and animals","noun","Humans are flexible omnivores."),
    word("bipedalism","đi bằng hai chân","habitual movement using two legs","noun","Bipedalism freed the hands to carry tools."),
    word("technology","công nghệ","tools and methods developed to solve problems","noun","Clothing is a technology for cold climates."),
    word("glaciation","thời kỳ băng hà","a period when large areas are covered by ice","noun","Humans survived repeated glaciations.")
  ];
  const g6SurvivalTerms=[
    word("adaptability","khả năng thích nghi","the capacity to adjust to changing conditions","noun","Human adaptability supports survival."),
    word("specialized","chuyên hóa","suited to a narrow set of conditions or resources","adjective","Polar bears are specialized sea-ice hunters."),
    word("generalized","không chuyên hóa","able to use a broad range of habitats or resources","adjective","Crocodiles have many generalized adaptations."),
    word("extinction","sự tuyệt chủng","the permanent disappearance of a species","noun","Habitat loss can increase extinction risk."),
    word("conservation","bảo tồn","actions that protect species and habitats","noun","Conservation can reduce human threats.")
  ];

  const commonReviewTitles=["Comprehension Mission","Vocabulary Mission","Visual Model","Hands-on Investigation","Chapter Synthesis"];
  const commonShort=["Review Evidence","Word Connections","Build the Model","Test the Idea","Final Report"];
  const commonIcons=["🧠","🔤","🗺️","🧪","🏆"];
  const commonGuides=["Read the evidence before choosing.","Use meaning and context together.","Connect each level in the diagram.","Predict, observe and explain.","Combine evidence from every week."];

  const metas=[
    {number:26,grade:5,bigIdea:1,bookWeek:5,pages:"32-35",review:true,title:"How do cells build tissues, organs and systems?",answer:"Specialized cells form tissues, tissues form organs and organs cooperate in systems.",background:"assets/microscopic-world-v1.png",guide:"Nova",reward:"Body Systems Review",context:"This chapter review connects cells, skin, digestion and circulation.",dayTitles:commonReviewTitles,dayShort:commonShort,icons:commonIcons,guideLines:commonGuides,terms:g5BodyTerms,facts:["Muscle and bone cells form tissues with different structures and functions.","Skin layers work together as one protective organ.","Digestive organs break down food, absorb nutrients and expel waste.","Blood cells and plasma perform transport, defense and repair jobs.","The body is organized from cells to tissues, organs and organ systems."]},
    {number:27,grade:5,bigIdea:2,bookWeek:2,pages:"44-49",title:"Why do pandas eat plants but polar bears eat meat?",answer:"Each bear has adaptations for the food and conditions available in its own ecosystem.",background:"assets/science-winter-review-v1.png",guide:"Bao",reward:"Bear Adaptation",context:"Pandas and polar bears belong to the bear family but occupy very different ecosystems.",dayTitles:["Two Bears, Two Habitats","Panda Plant Diet","Polar Bear Hunting","Habitat Change","Bear Evidence Review"],dayShort:["Compare Habitats","Bamboo Tools","Arctic Predator","Vulnerable Niches","Diet Review"],icons:["🐼","🎋","🐻‍❄️","🌍","🔬"],guideLines:["Compare habitat before diet.","Connect teeth and paws to bamboo.","Connect sea ice and seals to hunting.","Specialization can become a weakness when habitat changes.","Use anatomy, diet and habitat in one explanation."],terms:g5BearTerms,facts:["Both bears are consumers, but their habitats provide different foods.","Pandas use an extra thumb and flat molars to grip and grind bamboo.","Polar bears use powerful limbs, webbed feet and sharp teeth to hunt seals from sea ice.","Highly specialized diets make both species vulnerable when their habitats shrink.","Diet differences are explained by inherited adaptations and available resources."]},
    {number:28,grade:5,bigIdea:2,bookWeek:3,pages:"50-55",title:"Is the lion really the king of the jungle?",answer:"Lions are top predators in savannas, where they share a complex food web with competitors, prey and producers.",background:"assets/science-winter-migration-v1.png",guide:"Leo",reward:"Savanna Food Web",context:"Lions live mainly in grassland savannas rather than dense jungles.",dayTitles:["Where Lions Live","Build a Food Chain","Competition at the Top","When a Food Web Changes","Savanna Evidence Review"],dayShort:["Savanna Habitat","Energy Path","Rival Predators","Web Balance","Lion Review"],icons:["🦁","🌾","🐆","🕸️","🔬"],guideLines:["Correct the habitat myth first.","Follow arrows from food to consumer.","Several predators can compete for the same prey.","Changing one population can affect many others.","A top predator still depends on the whole web."],terms:g5LionTerms,facts:["Lions are top predators of open savanna ecosystems, not tropical jungle rulers.","Plants feed herbivores, and herbivores transfer energy to carnivores such as lions.","Lions compete with hyenas and cheetahs for some of the same prey.","Removing or adding a species can change several connected food chains.","The lion is one important predator within a complex savanna food web."]},
    {number:29,grade:5,bigIdea:2,bookWeek:4,pages:"56-61",title:"How can so many different plants live in the rainforest?",answer:"Warmth, rain, abundant light above the forest floor and many vertical layers create numerous plant niches.",background:"assets/garden-room-v1.png",guide:"Flora",reward:"Rainforest Layer",context:"Tropical rainforests support extraordinary plant diversity in several vertical layers.",dayTitles:["Rainforest Producers","Layers of Light","Life Above the Ground","Diversity Supports Life","Rainforest Evidence Review"],dayShort:["Plant Energy","Forest Layers","Epiphytes","Living Variety","Layer Review"],icons:["🌱","🌳","🌺","🦜","🔬"],guideLines:["Begin with photosynthesis.","Compare sunlight at different heights.","Not every plant roots in soil.","Many plant niches support many animal niches.","Connect climate, layers and plant strategies."],terms:g5RainforestTerms,facts:["Rainforest plants are producers that use abundant light and water to make food.","The overstory, canopy, understory and forest floor receive different amounts of light.","Epiphytes grow on tree branches to reach light without taking food from the tree.","A stable warm wet climate and layered habitat support high diversity.","Different plant strategies reduce direct competition and fill many rainforest niches."]},
    {number:30,grade:5,bigIdea:2,bookWeek:5,pages:"62-65",review:true,title:"How does every organism fill a role in an ecosystem?",answer:"Producers, consumers and decomposers interact through food webs and each species has adaptations for its role.",background:"assets/garden-room-v1.png",guide:"Gaia",reward:"Ecosystem Review",context:"This chapter review connects soil, bear diets, savanna food webs and rainforest layers.",dayTitles:commonReviewTitles,dayShort:commonShort,icons:commonIcons,guideLines:commonGuides,terms:g5EcoTerms,facts:["Earthworms improve soil by mixing material, making tunnels and processing dead matter.","Pandas and polar bears have different feeding adaptations for different habitats.","Savanna predators and prey form overlapping food chains.","Rainforest layers create many habitats for producers and consumers.","A healthy ecosystem depends on connected roles and recycled matter."]},
    {number:31,grade:6,bigIdea:1,bookWeek:5,pages:"32-35",review:true,title:"How can heredity predict traits?",answer:"Genes on chromosomes pass from parents to offspring, while variation and environment influence the traits expressed.",background:"assets/microscopic-world-v1.png",guide:"Mendel",reward:"Genetics Review",context:"This chapter review connects hybrids, gene pairs, corn variation and identical twins.",dayTitles:commonReviewTitles,dayShort:commonShort,icons:commonIcons,guideLines:commonGuides,terms:g6GeneticsTerms,facts:["Species, hybrids and fertility are distinguished by inheritance and reproduction.","Dominant and recessive gene forms can be modeled with probability.","Mutation, recombination and selective breeding change trait patterns in corn.","Identical twins share a starting genome but environment and epigenome create differences.","DNA extraction provides visible evidence that living cells contain genetic material."]},
    {number:32,grade:6,bigIdea:2,bookWeek:1,pages:"38-43",title:"What causes a species to become extinct?",answer:"A species becomes extinct when environmental change, habitat loss or disrupted relationships prevent survival and reproduction.",background:"assets/science-winter-review-v1.png",guide:"Dodo",reward:"Extinction Evidence",context:"Extinction is the permanent loss of a species and can occur gradually or during mass-extinction events.",dayTitles:["Extinction Through Time","Connected Species","Sudden Environmental Change","Human-Caused Loss","Extinction Review"],dayShort:["Fossil Record","Coextinction","Uninhabitable World","Habitat Loss","Risk Review"],icons:["🦴","🕸️","☄️","🏭","🔬"],guideLines:["Read the pattern across time.","One species may depend on another.","Ask whether survival and reproduction remain possible.","Trace the change back to habitat and resources.","Combine natural and human causes."],terms:g6ExtinctionTerms,facts:["Most species that have ever lived are extinct, while extinction rates change through time.","Predation, competition and dependence can cause one population change to affect another.","Asteroid impacts, climate shifts and disasters can make habitats uninhabitable.","Modern habitat destruction, hunting and introduced species accelerate many extinctions.","Extinction occurs when no members remain to reproduce and continue the species."]},
    {number:33,grade:6,bigIdea:2,bookWeek:2,pages:"44-49",title:"How have crocodiles survived for millions of years?",answer:"Generalized adaptations let crocodiles use varied habitats, foods and survival strategies, although human threats now endanger them.",background:"assets/science-wetland-effects-v2.png",guide:"Cora",reward:"Crocodile Survival",context:"Crocodiles have survived major environmental changes across millions of years.",dayTitles:["A Flexible Niche","Predator Adaptations","Drought Survival","Conservation Challenge","Crocodile Review"],dayShort:["Many Habitats","Hunting Tools","Dormant Refuge","Protect Species","Survival Review"],icons:["🐊","🦷","🏜️","🛡️","🔬"],guideLines:["Look for flexibility rather than one narrow specialty.","Connect body structures to hunting.","Reduced activity saves energy and water.","Adaptability cannot remove every human threat.","Use habitat, diet and physiology together."],terms:g6CrocTerms,facts:["Crocodiles exploit freshwater, saltwater and even seasonally dry habitats.","Top-positioned senses, strong jaws, swimming speed and an ectothermic body support hunting.","Salt glands and dormancy help some crocodiles survive difficult water conditions and drought.","Habitat loss, pollution and overhunting have made several crocodile species endangered.","Generalized adaptations explain long survival, while conservation addresses modern threats."]},
    {number:34,grade:6,bigIdea:2,bookWeek:3,pages:"50-55",title:"If the ice cap melts, why can't polar bears just adapt?",answer:"Polar bears are highly specialized for sea ice and seals, so physical evolution may not keep pace with rapid habitat loss.",background:"assets/science-winter-review-v1.png",guide:"Nanuq",reward:"Polar Survival",context:"Polar bears depend on a cold Arctic ecosystem shaped by sea ice.",dayTitles:["A Threatened Niche","Sea-Ice Hunter","Food Shortage","Behavioral Change","Polar Bear Review"],dayShort:["Arctic Habitat","Seal Diet","Malnutrition","Land Foraging","Adaptation Review"],icons:["🧊","🐻‍❄️","🐟","🏔️","🔬"],guideLines:["Identify the habitat feature being lost.","A specialized diet creates dependence.","Less hunting time means less energy.","Behavior can change faster than inherited anatomy.","Compare the speed of warming with evolution."],terms:g6PolarTerms,facts:["Melting sea ice threatens the platform polar bears use for hunting and travel.","Polar bears are carnivorous specialists that obtain most energy from seals.","Longer ice-free periods can leave bears malnourished before enough food is found.","Some bears forage on land, but land foods often provide less energy than seals.","Adaptation requires time and variation, so rapid warming may outpace evolutionary change."]},
    {number:35,grade:6,bigIdea:2,bookWeek:4,pages:"56-61",title:"Would humans survive if there was another ice age?",answer:"Humans would likely survive through flexible diets, cooperation and technology, although survival would depend on resources and planning.",background:"assets/moon-bio-lab-v1.png",guide:"Lucy",reward:"Human Adaptation",context:"Humans and earlier hominids spread across many climates during periods of major environmental change.",dayTitles:["Human Distribution","Flexible Diet","Hands and Tools","Living Through Glaciation","Human Survival Review"],dayShort:["Across Earth","Omnivore Advantage","Bipedal Technology","Ice-Age Evidence","Adaptability Review"],icons:["🌍","🥕","🪨","🧊","🔬"],guideLines:["Wide distribution is evidence of adaptability.","A broad diet opens more habitats.","Free hands can carry and make tools.","Humans evolved during repeated climate swings.","Resources and technology support the conclusion."],terms:g6HumanTerms,facts:["Hominids spread from Africa into many regions and climates.","Omnivory allowed early humans to use a broader range of available foods.","Bipedalism freed the hands, supporting tool use and developing technology.","Humans evolved through glaciations and survived large changes in temperature.","Flexible behavior, cooperation and technology make human survival likely but not automatic."]},
    {number:36,grade:6,bigIdea:2,bookWeek:5,pages:"62-65",review:true,title:"What determines whether a species survives change?",answer:"Survival depends on the speed of change, available variation, flexible behavior, habitat protection and the fit between adaptations and conditions.",background:"assets/science-winter-review-v1.png",guide:"Gaia",reward:"Survival Review",context:"This chapter review compares extinction, crocodiles, polar bears and human adaptability.",dayTitles:commonReviewTitles,dayShort:commonShort,icons:commonIcons,guideLines:commonGuides,terms:g6SurvivalTerms,facts:["Habitat loss is a major driver of modern extinction.","Generalized crocodile adaptations allow many foods and habitats.","Specialized polar bear adaptations create strong dependence on sea ice.","Human diets, bipedalism and technology support wide distribution.","Conservation protects the habitats and time species need to survive change."]}
  ];

  metas.forEach(meta=>{
    expansion.weeks[meta.number]=makeWeek(meta);
    expansion.habitats[meta.number]={name:`${meta.title.replace(/\?$/,"")} Hologram`,region:`Grade ${meta.grade} · Big Idea ${meta.bigIdea}`,zone:meta.review?"Review archive · hands-on station":"Five-day chapter field site",background:meta.background,accent:meta.grade===5?"#59dfbb":"#92a7ff"};
  });
  let allWeeks=null;

  const books=[
    {id:"g5",grade:5,title:"Daily Science Grade 5",color:"#45d7a5",dark:"#0b6e60",chapters:[
      {number:1,title:"Cells & Body Systems",bigIdea:"Living things are made mostly of cells, and specialized cells perform specialized functions.",background:"assets/microscopic-world-v1.png",weeks:[18,19,20,21,26]},
      {number:2,title:"Ecosystems & Roles",bigIdea:"An ecosystem is a community in which every living thing fills a role.",background:"assets/garden-room-v1.png",weeks:[6,27,28,29,30]}
    ]},
    {id:"g6",grade:6,title:"Daily Science Grade 6",color:"#8d9cff",dark:"#3d3d91",chapters:[
      {number:1,title:"Heredity & Genetics",bigIdea:"Living things inherit a combination of traits from their parents.",background:"assets/microscopic-world-v1.png",weeks:[22,23,24,25,31]},
      {number:2,title:"Survival & Extinction",bigIdea:"Changes in the environment can affect the survival of a species.",background:"assets/science-winter-review-v1.png",weeks:[32,33,34,35,36]}
    ]}
  ];
  const bookWeekNumbers=new Set(books.flatMap(book=>book.chapters.flatMap(chapter=>chapter.weeks)));

  function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
  function closeLayer(layer){layer?.remove()}
  function openBook(root,book){
    const layer=document.createElement("div");
    layer.className="science-book-layer";
    layer.setAttribute("role","dialog");
    layer.setAttribute("aria-modal","true");
    layer.setAttribute("aria-label",book.title);
    layer.style.setProperty("--book-color",book.color);
    layer.style.setProperty("--book-dark",book.dark);
    layer.innerHTML=`<article class="science-book-open"><button class="science-book-close" aria-label="Close ${esc(book.title)}">×</button><header><small>INFINITY LIBRARY · GRADE ${book.grade}</small><h2>${esc(book.title)}</h2><p>10 weeks · 2 chapters · choose a chapter hologram</p></header><div class="science-chapter-spread">${book.chapters.map(chapter=>`<button class="science-chapter-page" data-chapter="${chapter.number}" style="--chapter-bg:url('${chapter.background}')"><span>CHAPTER ${chapter.number}</span><strong>${esc(chapter.title)}</strong><p>${esc(chapter.bigIdea)}</p><b>5 weeks · Open hologram →</b></button>`).join("")}</div></article>`;
    document.body.appendChild(layer);
    layer.querySelector(".science-book-close").onclick=()=>closeLayer(layer);
    layer.onclick=event=>{if(event.target===layer)closeLayer(layer)};
    layer.querySelectorAll("[data-chapter]").forEach(button=>button.onclick=()=>openChapter(root,book,book.chapters.find(ch=>ch.number===Number(button.dataset.chapter)),layer));
  }

  function openChapter(root,book,chapter,bookLayer){
    const layer=document.createElement("div");
    layer.className="science-chapter-layer";
    layer.setAttribute("role","dialog");
    layer.setAttribute("aria-modal","true");
    layer.setAttribute("aria-label",`${book.title} Chapter ${chapter.number}`);
    layer.style.setProperty("--book-color",book.color);
    layer.style.setProperty("--chapter-bg",`url('${chapter.background}')`);
    const lessons=chapter.weeks.map((siteWeek,index)=>({siteWeek,index,week:(allWeeks||expansion.weeks)[siteWeek]}));
    layer.innerHTML=`<article class="science-chapter-hologram"><button class="science-book-close" aria-label="Close chapter hologram">×</button><div class="chapter-hologram-stage" tabindex="0" role="button" aria-label="Reveal lessons in ${esc(chapter.title)}"><div class="chapter-holo-image"></div><div class="chapter-holo-rings"><i></i><i></i><i></i></div><div class="chapter-holo-copy"><small>GRADE ${book.grade} · CHAPTER ${chapter.number}</small><h2>${esc(chapter.title)}</h2><p>${esc(chapter.bigIdea)}</p><b>Touch the hologram to reveal 5 weeks</b></div></div><section class="chapter-lesson-popup" hidden><header><div><small>CHAPTER ${chapter.number} · SAME COLOR LEARNING SET</small><h3>Choose a week</h3></div><button class="chapter-lessons-close" aria-label="Hide lesson list">×</button></header><div>${lessons.map(({siteWeek,index,week})=>`<button data-book-week="${siteWeek}"><span>${index===4?"REVIEW":"WEEK "+(index+1)}</span><strong>${esc(week.title)}</strong><small>${week.days.length-1} learning days · ${week.days.slice(1).reduce((sum,day)=>sum+day.questions.length,0)} questions</small><b>Open lesson →</b></button>`).join("")}</div></section></article>`;
    document.body.appendChild(layer);
    const popup=layer.querySelector(".chapter-lesson-popup"),stage=layer.querySelector(".chapter-hologram-stage");
    const reveal=()=>{popup.hidden=false;layer.classList.add("lessons-visible")};
    stage.onclick=reveal;
    stage.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();reveal()}};
    layer.querySelector(".chapter-lessons-close").onclick=()=>{popup.hidden=true;layer.classList.remove("lessons-visible")};
    layer.querySelector(".science-book-close").onclick=()=>closeLayer(layer);
    layer.onclick=event=>{if(event.target===layer)closeLayer(layer)};
    layer.querySelectorAll("[data-book-week]").forEach(button=>button.onclick=()=>{
      const target=root.querySelector(`[data-week="${button.dataset.bookWeek}"]`);
      if(target){closeLayer(layer);closeLayer(bookLayer);target.click()}
    });
  }

  function mount(root){
    if(!root||root.querySelector(".science-book-library"))return;
    const heading=root.querySelector(".science-week-heading"),selector=root.querySelector(".science-week-selector");
    if(!heading||!selector)return;
    const section=document.createElement("section");
    section.className="science-book-library";
    section.innerHTML=`<div class="science-book-library-heading"><div><p class="science-kicker">INFINITY LIBRARY · SCIENCE BOOKS</p><h2>Open a book, then touch a chapter hologram</h2><p>Each chapter keeps one color, one background world and five connected weeks.</p></div><span>20 book weeks · 4 chapters</span></div><div class="science-book-shelf">${books.map(book=>`<button class="science-book-cover" data-science-book="${book.id}" style="--book-color:${book.color};--book-dark:${book.dark}"><i></i><small>DAILY SCIENCE</small><strong>GRADE<br>${book.grade}</strong><span>${book.chapters.length} chapters · 10 weeks</span><b>Open book →</b></button>`).join("")}</div>`;
    heading.before(section);
    section.querySelectorAll("[data-science-book]").forEach(button=>button.onclick=()=>openBook(root,books.find(book=>book.id===button.dataset.scienceBook)));
    selector.querySelectorAll("[data-week]").forEach(button=>{if(bookWeekNumbers.has(Number(button.dataset.week)))button.closest(".science-week-card").classList.add("book-week-hidden")});
    const remaining=[...selector.querySelectorAll(".science-week-card:not(.book-week-hidden)")].length;
    heading.querySelector("h2").textContent=`${remaining} independent expeditions`;
    heading.querySelector(".science-kicker").textContent="BONUS & EARLIER FIELD EXPEDITIONS";
  }

  const observer=new MutationObserver(()=>{
    const root=document.querySelector(".science-lab-screen.research-index");
    if(root)mount(root);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  function bindWeeks(weeks){
    allWeeks=weeks;
    if(weeks[6]){
      weeks[6].subtitle="Grade 5 · Big Idea 2 · Week 1";
      weeks[6].source={grade:5,bigIdea:2,bookWeek:1,pages:"38-43"};
    }
  }
  window.ScienceBooks={books,mount,bookWeekNumbers,bindWeeks};
})();
