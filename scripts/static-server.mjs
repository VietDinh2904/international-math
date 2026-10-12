import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const port=Number(process.argv[2]||8765),root=join(process.cwd(),"dist");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".json":"application/json"};
http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),relative=normalize(pathname==="/"?"index.html":pathname.slice(1));
  if(relative.startsWith("..")){response.writeHead(403).end("Forbidden");return}
  let file=join(root,relative);
  try{if(statSync(file).isDirectory())file=join(file,"index.html");response.writeHead(200,{"Content-Type":types[extname(file).toLowerCase()]||"application/octet-stream","Cache-Control":"no-store"});createReadStream(file).pipe(response)}catch{response.writeHead(404).end("Not found")}
}).listen(port,"127.0.0.1",()=>console.log(`Local: http://127.0.0.1:${port}`));
