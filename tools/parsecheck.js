const C=require('./load.js')(['topics1.js','topics2.js','topics3.js','kb.js']); const K=C.SKB; const db=K.build(C.SK_TOPICS);
const T=require('../test/paraphrases.js'); let ok=0; const bad=[];
T.forEach(([q,exp,neg])=>{ const p=K.parse(db,q); let got;
 if(p.t==='attr') got=K.ATTRS[p.a].id+(p.neg?'!':''); else if(p.t==='guess') got='guess:'+(p.w>=0?db.words[p.w].w:'?'); else got='none';
 const want = exp.startsWith('guess')||exp==='none'?exp: exp+(neg?'!':'');
 if(got===want) ok++; else bad.push(q+' → '+got+' (want '+want+')'); });
console.log(ok+'/'+T.length, (100*ok/T.length).toFixed(1)+'%'); console.log(bad.join('\n'));
module.exports={ok,n:T.length};
