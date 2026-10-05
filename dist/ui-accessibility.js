(()=>{
  "use strict";
  const STORE="international-math-reading-zoom-v1",levels=[1,1.15,1.3,1.45,1.6];
  let index=Math.max(0,levels.indexOf(Number(localStorage.getItem(STORE)||1)));
  function apply(){const value=levels[index];document.documentElement.style.setProperty("--reading-zoom",value);localStorage.setItem(STORE,String(value));const output=document.getElementById("readingZoomLevel");if(output)output.textContent=`${Math.round(value*100)}%`;const out=document.getElementById("readingZoomOut"),up=document.getElementById("readingZoomIn");if(out)out.disabled=index===0;if(up)up.disabled=index===levels.length-1}
  function init(){document.getElementById("readingZoomOut").onclick=()=>{index=Math.max(0,index-1);apply()};document.getElementById("readingZoomIn").onclick=()=>{index=Math.min(levels.length-1,index+1);apply()};apply()}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
