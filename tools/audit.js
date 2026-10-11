// ずかんの自動チェック：①「関係することば」と特ちょうの矛盾（ことばだけの質問が特ちょうの「いいえ」になる）
// ② カテゴリ内で「はい」と既定の「いいえ」が混ざっている特ちょう（人の目で見直す候補）
// usage: node tools/audit.js [mix]
const C = require('./load.js')(); const K = C.SKB, DB = K.build(C.SK_TOPICS);
let n1 = 0; const out1 = [];
DB.words.forEach(w => {
  (w.facts || []).forEach(alts => {
    const kw = alts[0]; const p = K.parse(DB, kw + '？'); if (p.t !== 'attr') return;
    const a = K.answerParsed(DB, p, w.id), want = alts.neg ? 'n' : 'y';
    if (a !== 'u' && a !== want) { n1++; out1.push(`${w.w}: 「${kw}」→ ${K.ATTRS[p.a].id}${p.neg ? '!' : ''}=${a}（ことばは ${want}）`); }
  });
});
console.log('① 矛盾', n1); out1.forEach(x => console.log('  ' + x));
if (process.argv[2] === 'mix') {
  Object.keys(DB.cats).forEach(c => {
    const ws = DB.cats[c].words.map(i => DB.words[i]);
    K.ATTRS.forEach(a => {
      const y = ws.filter(w => w.v[a.i] === 1), n = ws.filter(w => w.v[a.i] === 0);
      if (y.length && n.length && y.length >= 2 && n.length >= 2) console.log(`${c}/${a.id}: はい[${y.map(w => w.w).join(' ')}] いいえ[${n.map(w => w.w).join(' ')}]`);
    });
  });
}
