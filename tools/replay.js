// 実際の人間とのゲーム（data/transcripts.json）を NPC の頭脳でなぞる。
// 各質問を NPC と同じ読み取り（K.parse / K.parseAnswer）→ 証拠（B.apply、ひとこと・「近い」込み）にして、
// 正解のお題が「いちばん上・確率 ≥ th」になった最初の質問番号＝NPCがそこで当てられる、として数える。
// usage: node tools/replay.js [th=0.35]
const C = require('./load.js')(), K = C.SKB, B = C.SKBR, L = C.SKL;
const DB = K.build(C.SK_TOPICS), th = +(process.argv[2] || 0.35);
const T = require('../data/transcripts.json').games;
let solved = 0, out = [];
for (const g of T) {
  const w = DB.byNorm[K.normL(g.topic)]; if (w == null) { out.push({ topic: g.topic, err: 'not in KB' }); continue; }
  const G = { pub: B.pub(DB, DB.words.map((_, i) => i), { eps: 0.08 }) }; let at = 0, at1 = 0, pw = 0, k = 0, rank = -1;
  for (const e of g.qa) {
    const ans = K.parseAnswer(e.a); if (ans === 'correct') break; k++;
    const p = K.parse(DB, e.q); if (ans == null) continue;   // あいまい（Yep など）→ 確認待ち、証拠にしない
    const note = e.a.length > 3 ? e.a : '';
    let rec = null;
    if (p.t === 'attr') rec = { p: 0, a: p.a, neg: p.neg, ans: ans };
    else if (p.t === 'guess' && p.w >= 0) rec = { p: 0, w: p.w, ans: (ans === 'pn' || ans === 'py' || ans === 'sp' || /(近い|ちかい|惜しい|おしい|感じ|寄り|っぽい)/.test(note)) ? 'near' : 'n' };
    else if (p.t !== 'none') rec = { p: 0, f: p.text || e.q, pq: p.t === 'guess' ? { t: 'fact', text: p.text } : p, ans: ans };
    if (rec) B.apply(G.pub, rec);
    if (note) L.hintKeys(G, note);
    const pr = B.probs(G.pub).p; let top = 0; for (let j = 1; j < DB.N; j++) if (pr[j] > pr[top]) top = j;
    rank = 1; for (let j = 0; j < DB.N; j++) if (pr[j] > pr[w]) rank++;
    if (!at && top === w && pr[w] >= th) at = k; if (!at1 && top === w) at1 = k; pw = pr[w];
  }
  if (process.env.TOP && g.topic === process.env.TOP) { const pr = B.probs(G.pub).p; console.log([...pr].map((x, i) => [x, DB.words[i].w]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(x => x[1] + ':' + x[0].toFixed(2)).join(' ')); }
  if (at) solved++;
  out.push({ topic: g.topic, humanQ: g.qa.length, npcSolvedAt: at || null, finalRank: rank, top1At: at1 || null, finalP: +pw.toFixed(3) });
}
console.log(JSON.stringify({ games: T.length, solved, th }));
out.forEach(o => console.log(JSON.stringify(o)));
