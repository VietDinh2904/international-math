import fs from "node:fs/promises";
import path from "node:path";

const root=path.resolve("dist/assets/open-atlas");
await fs.mkdir(root,{recursive:true});

const provinces=[
  ["ha-noi","Hà Nội","Hoan Kiem Lake Hanoi Vietnam"],["cao-bang","Cao Bằng","Ban Gioc Falls Cao Bang Vietnam"],["tuyen-quang","Tuyên Quang","Na Hang Tuyen Quang Vietnam landscape"],["dien-bien","Điện Biên","Dien Bien Phu monument Vietnam"],["lai-chau","Lai Châu","Lai Chau Vietnam mountains landscape"],["son-la","Sơn La","Moc Chau tea hills Vietnam"],["lao-cai","Lào Cai","Fansipan Sa Pa Vietnam"],["thai-nguyen","Thái Nguyên","Nui Coc Lake Thai Nguyen Vietnam"],["lang-son","Lạng Sơn","Mau Son Lang Son Vietnam"],["quang-ninh","Quảng Ninh","Ha Long Bay Vietnam landscape"],["bac-ninh","Bắc Ninh","But Thap Pagoda Bac Ninh Vietnam"],["phu-tho","Phú Thọ","Hung Temple Phu Tho Vietnam"],["hai-phong","Hải Phòng","Cat Ba island Hai Phong Vietnam"],["hung-yen","Hưng Yên","Pho Hien Hung Yen Vietnam"],["ninh-binh","Ninh Bình","Trang An Ninh Binh Vietnam"],["thanh-hoa","Thanh Hóa","Citadel Ho Dynasty Thanh Hoa Vietnam"],["nghe-an","Nghệ An","Cua Lo beach Nghe An Vietnam"],["ha-tinh","Hà Tĩnh","Ke Go Lake Ha Tinh Vietnam"],["quang-tri","Quảng Trị","Hien Luong Bridge Quang Tri Vietnam"],["hue","Huế","Hue Imperial City Vietnam"],["da-nang","Đà Nẵng","Marble Mountains Da Nang Vietnam"],["quang-ngai","Quảng Ngãi","Ly Son island Quang Ngai Vietnam"],["gia-lai","Gia Lai","Bien Ho Gia Lai Vietnam"],["khanh-hoa","Khánh Hòa","Nha Trang Bay Khanh Hoa Vietnam"],["dak-lak","Đắk Lắk","Dray Nur waterfall Dak Lak Vietnam"],["lam-dong","Lâm Đồng","Da Lat Lam Dong Vietnam landscape"],["dong-nai","Đồng Nai","Tri An Lake Dong Nai Vietnam"],["ho-chi-minh","TP. Hồ Chí Minh","Ho Chi Minh City skyline Vietnam"],["tay-ninh","Tây Ninh","Ba Den mountain Tay Ninh Vietnam"],["dong-thap","Đồng Tháp","Tram Chim National Park Dong Thap Vietnam"],["vinh-long","Vĩnh Long","Vinh Long Mekong River Vietnam"],["an-giang","An Giang","Tra Su cajuput forest An Giang Vietnam"],["can-tho","Cần Thơ","Cai Rang floating market Can Tho Vietnam"],["ca-mau","Cà Mau","Ca Mau Cape Vietnam"]
];

const dynasties=[
  ["van-lang-au-lac","Co Loa Citadel Vietnam"],["ngo","Bach Dang wooden stakes Vietnam archaeology"],["dinh","Hoa Lu ancient capital Vietnam"],["tien-le","Le Dai Hanh temple Hoa Lu Vietnam"],["ly","Imperial Citadel Thang Long Vietnam"],["tran","Tran Temple Nam Dinh Vietnam"],["ho","Citadel Ho Dynasty Thanh Hoa Vietnam"],["le-so","Lam Kinh Thanh Hoa Vietnam"],["mac","Mac dynasty citadel Vietnam"],["le-trung-hung","Luy Thay Quang Binh Vietnam"],["tay-son","Quang Trung Museum Binh Dinh Vietnam"],["nguyen","Hue Imperial City Vietnam"]
];

const figures=["Dương Đình Nghệ","Kiều Công Hãn","Nguyễn Bặc","Đinh Điền","Khuông Việt","Đỗ Pháp Thuận","Lý Thường Kiệt","Tô Hiến Thành","Ỷ Lan","Trần Thủ Độ","Trần Hưng Đạo","Trần Quang Khải","Phạm Ngũ Lão","Hồ Nguyên Trừng","Đỗ Mãn","Nguyễn Trãi","Lê Lai","Nguyễn Xí","Lương Thế Vinh","Nguyễn Bỉnh Khiêm","Giáp Hải","Nguyễn Hoàng","Đào Duy Từ","Lê Quý Đôn","Bùi Thị Xuân","Ngô Thì Nhậm","Trần Quang Diệu","Nguyễn Công Trứ","Cao Bá Quát","Trương Định","Nguyễn Tri Phương"];

const artifacts=[
  ["dong-son-drum","Dong Son bronze drum Vietnam"],["bronze-arrow","Co Loa bronze arrowheads Vietnam"],["bach-dang-stake","Bach Dang wooden stakes Vietnam museum"],["ly-tran-jar","Ly Tran ceramic Vietnam museum"],["spear-shield","Vietnam medieval spear shield museum"],["chieu-doi-do","Chieu doi do manuscript Vietnam"],["lam-son-sword","Lam Son uprising sword Vietnam museum"],["hong-duc-code","Hong Duc code Vietnam book"],["hong-duc-map","Hong Duc map Vietnam"],["nguyen-seal","Nguyen dynasty imperial seal Vietnam"],["court-robe","Nguyen dynasty court robe Vietnam"],["hoang-sa-boat","Hoang Sa fleet boat model Vietnam"]
];

const exactMaps=[
  ["vietnam-administrative-2025.jpg","2025 map of Viet Nam.jpg"],["vietnam-provinces-blank-2025.svg","Blank Map of provinces of Vietnam.svg"],["vietnam-relief.svg","Vietnam relief location map.svg"],["vietnam-climate.svg","Vietnam map of Köppen climate classification.svg"],["world-political.svg","Blank world map Robinson projection.svg"],["world-physical.svg","Physical World Map.svg"]
];

let data={provinces:{},dynasties:{},figures:{},artifacts:{},maps:{},generatedAt:new Date().toISOString()};
try{
  const prior=await fs.readFile("dist/open-media-data.js","utf8"),json=prior.replace(/^window\.OpenMediaData=/,"").replace(/;\s*$/,"");
  data={...data,...JSON.parse(json),generatedAt:new Date().toISOString()};
}catch{}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const strip=value=>String(value||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const safe=value=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/gi,"d").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

function licenseAllowed(meta={}){
  const license=strip(meta.LicenseShortName?.value||meta.License?.value);
  return /public domain|cc0|cc by|cc-by|cc by-sa|cc-by-sa/i.test(license);
}

async function commons(params,attempt=0){
  const url=new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({action:"query",format:"json",formatversion:"2",origin:"*",...params}).forEach(([key,value])=>url.searchParams.set(key,value));
  const response=await fetch(url,{headers:{"User-Agent":"SMC-Open-Education-Atlas/1.0"}});
  if(response.status===429&&attempt<3){await sleep(6000*(attempt+1));return commons(params,attempt+1)}
  if(!response.ok)throw new Error(`Commons ${response.status}`);
  return response.json();
}

async function searchImage(query,{portrait=false}={}){
  const json=await commons({generator:"search",gsrsearch:`filetype:bitmap ${query}`,gsrnamespace:"6",gsrlimit:"12",prop:"imageinfo",iiprop:"url|mime|size|extmetadata",iiurlwidth:portrait?700:1100});
  const pages=(json.query?.pages||[]).filter(page=>page.imageinfo?.[0]&&licenseAllowed(page.imageinfo[0].extmetadata));
  const bad=/logo|map|flag|coat of arms|diagram|icon|seal of|locator|emblem|poster|banner/i;
  const ranked=pages.map(page=>{
    const info=page.imageinfo[0],title=page.title.replace(/^File:/,""),ratio=(info.width||1)/(info.height||1);
    let score=0;if(!bad.test(title))score+=8;if(/\.jpe?g$|\.png$/i.test(title))score+=3;if(portrait&&ratio<1.15)score+=3;if(!portrait&&ratio>.9)score+=3;
    for(const word of query.toLowerCase().split(/\s+/).filter(word=>word.length>3))if(title.toLowerCase().includes(word))score+=1;
    return{page,info,title,score};
  }).sort((a,b)=>b.score-a.score);
  return ranked[0]||null;
}

async function exactImage(file){
  const json=await commons({titles:`File:${file}`,prop:"imageinfo",iiprop:"url|mime|size|extmetadata",iiurlwidth:"1500"});
  const page=json.query?.pages?.[0],info=page?.imageinfo?.[0];
  if(!info||!licenseAllowed(info.extmetadata))return null;
  return{page,info,title:file,score:99};
}

async function saveImage(hit,folder,base){
  const info=hit.info,source=info.thumburl||info.url,response=await fetch(source,{headers:{"User-Agent":"SMC-Open-Education-Atlas/1.0"}});
  if(!response.ok)throw new Error(`image ${response.status}`);
  const type=(response.headers.get("content-type")||info.mime||"").toLowerCase();
  const ext=type.includes("svg")?"svg":type.includes("png")?"png":type.includes("webp")?"webp":"jpg";
  const relative=`assets/open-atlas/${folder}/${base}.${ext}`,target=path.resolve("dist",relative);
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.writeFile(target,Buffer.from(await response.arrayBuffer()));
  const meta=info.extmetadata||{};
  return{asset:relative,title:hit.title,source:info.descriptionurl||`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(hit.title)}`,author:strip(meta.Artist?.value)||"Wikimedia Commons contributor",license:strip(meta.LicenseShortName?.value||meta.License?.value)||"Open license",caption:strip(meta.ImageDescription?.value)||strip(meta.ObjectName?.value)||hit.title};
}

for(const [fileName,file] of exactMaps){
  if(data.maps[fileName])continue;
  try{const hit=await exactImage(file);if(hit)data.maps[fileName]=await saveImage(hit,"maps",fileName.replace(/\.[^.]+$/,""));console.log("map",fileName,hit?.title||"MISS")}catch(error){console.warn("map failed",fileName,error.message)}
  await sleep(800);
}

for(const [id,name,query] of provinces){
  if(data.provinces[id])continue;
  try{const hit=await searchImage(query);if(hit)data.provinces[id]=await saveImage(hit,"provinces",id);console.log("province",name,hit?.title||"MISS")}catch(error){console.warn("province failed",name,error.message)}
  await sleep(900);
}

for(const [id,query] of dynasties){
  if(data.dynasties[id])continue;
  try{const hit=await searchImage(query);if(hit)data.dynasties[id]=await saveImage(hit,"heritage",id);console.log("dynasty",id,hit?.title||"MISS")}catch(error){console.warn("dynasty failed",id,error.message)}
  await sleep(900);
}

for(const name of figures){
  if(data.figures[name])continue;
  try{const hit=await searchImage(`${name} Vietnam portrait statue`,{portrait:true});if(hit&&hit.score>=11)data.figures[name]=await saveImage(hit,"figures",safe(name));console.log("figure",name,data.figures[name]?.title||"EMPTY")}catch(error){console.warn("figure failed",name,error.message)}
  await sleep(900);
}

for(const [id,query] of artifacts){
  if(data.artifacts[id]||id==="hong-duc-map")continue;
  try{const hit=await searchImage(query);if(hit&&hit.score>=10)data.artifacts[id]=await saveImage(hit,"artifacts",id);console.log("artifact",id,data.artifacts[id]?.title||"EMPTY")}catch(error){console.warn("artifact failed",id,error.message)}
  await sleep(900);
}

await fs.writeFile("dist/open-media-data.js",`window.OpenMediaData=${JSON.stringify(data,null,2)};\n`);
console.log("wrote",Object.fromEntries(Object.entries(data).filter(([,value])=>value&&typeof value==="object"&&!Array.isArray(value)).map(([key,value])=>[key,Object.keys(value).length])));
