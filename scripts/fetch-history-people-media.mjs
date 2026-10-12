import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const repo=process.cwd(),source=await readFile(join(repo,"dist/history-world-data.js"),"utf8"),sandbox={window:{}};
vm.runInNewContext(source,sandbox);
const names=[...new Set(sandbox.window.HistoryWorldData.dynasties.flatMap(period=>[...period.kings.map(item=>item.name),...period.figures.map(item=>item.name)]))];
const outDir=join(repo,"dist/assets/open-atlas/people");await mkdir(outDir,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const slug=value=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const api=async url=>{for(let attempt=0;attempt<4;attempt++){const response=await fetch(url,{headers:{"User-Agent":"InternationalMathAtlas/1.0 (educational project)"}});if(response.status===429){await sleep(1800*(attempt+1));continue}if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json()}throw new Error(`Rate limited: ${url}`)};
const allowed=value=>/public domain|cc0|cc by|cc-by|cc by-sa|cc-by-sa|creative commons attribution/i.test(value||"");
let records={};
const priorPath=join(repo,"dist/history-people-media.js");
if(existsSync(priorPath)){const priorSandbox={window:{}};vm.runInNewContext(await readFile(priorPath,"utf8"),priorSandbox);records=priorSandbox.window.HistoryPeopleMedia||{}}
for(let offset=0;offset<names.length;offset+=30){
  const batch=names.slice(offset,offset+30),pageUrl=`https://vi.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(batch.join("|"))}`;
  const pages=Object.values((await api(pageUrl)).query?.pages||{}),fileToName=new Map();
  for(const page of pages)if(page.pageimage)fileToName.set(page.pageimage,page.title);
  const files=[...fileToName.keys()];if(!files.length)continue;
  const metaUrl=`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(files.map(file=>`File:${file}`).join("|"))}`;
  const commonsPages=Object.values((await api(metaUrl)).query?.pages||{}),localMetaUrl=`https://vi.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(files.map(file=>`File:${file}`).join("|"))}`,localPages=Object.values((await api(localMetaUrl)).query?.pages||{}),seen=new Set(),imagePages=[...commonsPages,...localPages];
  for(const imagePage of imagePages){
    const file=imagePage.title?.replace(/^File:/i,""),name=fileToName.get(file),info=imagePage.imageinfo?.[0];if(!name||!info)continue;
    if(seen.has(name))continue;seen.add(name);
    const meta=info.extmetadata||{},license=meta.LicenseShortName?.value||meta.UsageTerms?.value||"";if(!allowed(license))continue;
    const url=info.thumburl||info.url,extension=/\.png(?:\?|$)/i.test(url)?"png":"jpg",asset=`assets/open-atlas/people/${slug(name)}.${extension}`,path=join(repo,"dist",asset);
    if(!existsSync(path)){const response=await fetch(url,{headers:{"User-Agent":"InternationalMathAtlas/1.0 (educational project)"}});if(!response.ok)continue;await writeFile(path,Buffer.from(await response.arrayBuffer()))}
    records[name]={asset,title:file,source:meta.DescriptionUrl?.value||`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,author:(meta.Artist?.value||"Wikimedia contributor").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),license,kind:"Hình tượng, tranh hoặc ảnh di tích do hậu thế thực hiện; không mặc định là chân dung đương thời."};
    await sleep(350);
  }
  await sleep(1300);
}
await writeFile(join(repo,"dist/history-people-media.js"),`window.HistoryPeopleMedia=${JSON.stringify(records,null,2)};\n`);
console.log(`Saved ${Object.keys(records).length}/${names.length} verified open-license images.`);
