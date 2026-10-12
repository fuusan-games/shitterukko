// 人間っぽい（あいまいに答える）おだいばん × NPCたんてい の自己対戦：正解率・平均質問数
// usage: node tools/hedgesim.js [games=300] [weights=trained|hand] [words=test|real]
'use strict';
const S = require('./simlib.js'), { B, DB, K } = S;
const N = +(process.argv[2] || 300), base = process.argv[3] === 'hand' ? B.HAND : ((S.C.SK_WEIGHTS && S.C.SK_WEIGHTS.P) || B.HAND);
const REAL = ['すなどけい', 'キックボクシング', 'マインクラフト', 'りんご', 'よじげん'].map(w => DB.byNorm[K.normL(w)]);
const words = process.argv[4] === 'real' ? REAL : S.split().test.concat(REAL);
let ok = 0, q = 0, qs = [];
for (let g = 0; g < N; g++) {
  const r = B.rng(9001 + g * 17), n = 5, roles = ['master', 'insider', 'common', 'common', 'common'];
  const hb = Object.assign(S.humanBot(r), { hedge: true, note: 0.25, err: process.argv[5] ? +process.argv[5] : 0.03 });
  const seats = roles.map((ro, i) => i === 0 ? { kind: 'human', hb } : { kind: 'npc', P: B.levelP(base, 'smart'), lvP: true });
  const G = S.play(seats, { roles, secret: words[g % words.length], limit: 300, diff: 'all', lv: 'smart' }, r);
  if (G.result.why !== 'none' && G.guesser >= 0) { ok++; q += G.qa.length; qs.push(G.qa.length); }
}
qs.sort((a, b) => a - b);
console.log(JSON.stringify({ games: N, words: process.argv[4] || 'test+real', solve: +(ok / N).toFixed(3), avgQ: +(q / Math.max(1, ok)).toFixed(1), medianQ: qs[qs.length >> 1] || 0 }));
