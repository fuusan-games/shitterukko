// 自然な質問セットで おだいばんの答えを採点：自信のある まちがい（はい⇔いいえ）・わからない・正解
const fs = require('fs'), path = require('path');
const C = require('./load.js')(); const K = C.SKB, DB = K.build(C.SK_TOPICS);
function find(w) { const n = K.normL(w); return DB.byNorm[n] != null ? DB.byNorm[n] : DB.words.findIndex(x => x.w === w); }
function run(file, verbose) {
  const rows = fs.readFileSync(file, 'utf8').split('\n').filter(l => l && l[0] !== '#').map(l => l.split('|'));
  let ok = 0, wrong = 0, unk = 0, amb = 0, miss = [], bad = [];
  rows.forEach(([w, q, e]) => {
    const id = find(w); if (id < 0) { miss.push(w); return; }
    const p = K.parse(DB, q); let a = K.answerParsed(DB, p, id); if (a === 'correct' || a === 'py' || a === 'sp') a = 'y'; if (a === 'pn') a = 'n';   // あいまいな答えは そちら寄りとして採点
    if (e === '?') { amb++; return; }
    if (a === 'u') { unk++; if (verbose) bad.push('U ' + w + '|' + q + '|' + e + ' ' + JSON.stringify(p) + (p.t === 'attr' ? ' ' + K.ATTRS[p.a].id : '')); }
    else if (a === e) ok++;
    else { wrong++; bad.push('X ' + w + '|' + q + '|want ' + e + ' got ' + a + ' ' + JSON.stringify(p) + (p.t === 'attr' ? ' ' + K.ATTRS[p.a].id : '')); }
  });
  const n = ok + wrong + unk;
  return { file: path.basename(file), n, ok, wrong, unk, amb, okPct: +(100 * ok / n).toFixed(1), wrongPct: +(100 * wrong / n).toFixed(1), unkPct: +(100 * unk / n).toFixed(1), missing: miss, bad };
}
module.exports = run;
if (require.main === module) {
  const f = process.argv[2] || path.join(__dirname, '../test/natural_tune.txt'), v = process.argv[3] === 'v';
  const r = run(f, true); console.log(JSON.stringify(Object.assign({}, r, { bad: undefined }))); if (v) r.bad.forEach(b => console.log(b));
}
