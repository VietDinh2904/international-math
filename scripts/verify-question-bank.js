const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(__dirname,"..");
const context=vm.createContext({window:{}});
for(const file of ["timo-2020.js","timo-2020-exact.js","timo-remaining.js","smc-2021.js","kangaroo.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,"dist",file),"utf8"),context,{filename:file});
}
const app=fs.readFileSync(path.join(root,"dist","app.js"),"utf8"),dataEnd=app.indexOf("const saved="),answerStart=app.indexOf("function normalize"),answerEnd=app.indexOf("function cleanFigureWatermark");
vm.runInContext(`${app.slice(0,dataEnd)}\nwindow.__papers=papers;`,context,{filename:"app-data.js"});
vm.runInContext(app.slice(answerStart,answerEnd),context,{filename:"answer-modes.js"});
const questions=Object.values(context.window.__papers).flat().filter(Boolean),multipleChoice=questions.filter(q=>context.questionChoices(q.en).length>=2),failures=[];
for(const q of multipleChoice){
  const choices=context.questionChoices(q.en),accepted=context.acceptedAnswers(q).map(context.normalize),letters=choices.map((_,i)=>String.fromCharCode(97+i)),numbers=choices.map((_,i)=>String(i+1));
  if(!letters.some(value=>accepted.includes(value))||!numbers.some(value=>accepted.includes(value)))failures.push({n:q.n,title:q.title,answer:q.answer,accepted:context.acceptedAnswers(q)});
}
const images=questions.filter(q=>q.image),missing=images.filter(q=>!fs.existsSync(path.join(root,"dist",q.image.split("?")[0])));
console.log(JSON.stringify({questions:questions.length,multipleChoice:multipleChoice.length,imageQuestions:images.length,missingImages:missing.map(q=>q.image),answerModeFailures:failures},null,2));
if(missing.length||failures.length)process.exitCode=1;
