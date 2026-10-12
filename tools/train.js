// しってるっこ：NPCの方針パラメータを自己対戦で学習する（CMA-ES風の進化戦略・ワーカースレッド並列）
// usage: node tools/train.js [generations=30] [gamesPerEval=400]
// 出力：weights.js（ゲームが読み込む学習済み重み）、tools/train-report.json（学習曲線・前後比較。お題の20%は学習に使わない“テスト用”）
'use strict';
const { Worker, isMainThread, parentPort } = require('worker_threads');
const os = require('os'), fs = require('fs'), path = require('path');
const S = require('./simlib.js'), { B, play, wonBy, humanBot } = S;
const SMART = B.levelP(B.HAND, 'smart');
// 1卓：4〜7人、人間役0〜2人。偶数ゲーム＝θが しってるっこ（相手の探偵は θ／手作り／人間役のまぜ）、奇数＝θが探偵側（しってるっこは θ／手作り／人間役）
function game(P, words, seed, g, opt) {
  const r = B.rng(seed * 7919 + g * 104729 + 13), n = 4 + Math.floor(r() * 4), h = Math.min(n - 2, r() < 0.35 ? 0 : r() < 0.75 ? 1 : 2);
  const idx = []; for (let i = 0; i < n; i++) idx.push(i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const roles = new Array(n).fill('common'); roles[idx[0]] = 'master'; roles[idx[1]] = 'insider';
  const thetaIns = g % 2 === 0, seats = new Array(n);
  const humans = new Set(); // 人間役の席（しってるっこ側が人間役のこともある）
  const insHuman = !thetaIns && r() < 0.45, insHand = !thetaIns && !insHuman && r() < 0.4;
  if (insHuman) humans.add(idx[1]);
  for (let k = 2; humans.size < h && k < n; k++) humans.add(idx[k]);
  if (r() < 0.45) humans.add(idx[0]);   // ときどき人間がマスター
  for (let i = 0; i < n; i++) {
    if (humans.has(i)) { const hb = humanBot(r); if (roles[i] === 'master' && r() < 0.7) Object.assign(hb, { hedge: true, note: 0.2 }); seats[i] = { kind: 'human', hb }; continue; }   // 人間のおだいばんは あいまいに答えることが多い
    if (roles[i] === 'insider') seats[i] = { kind: 'npc', P: thetaIns ? P : insHand ? opt.hand : P };
    else seats[i] = { kind: 'npc', P: thetaIns ? (r() < 0.5 ? P : opt.hand) : P, noise: thetaIns ? 0.3 : 0 };
  }
  const secret = words[Math.floor(r() * words.length)];
  const limit = [60, 90, 180, 300][Math.floor(r() * 4)];   // 時間にゆとりがない卓も混ぜる（しってるっこの“さりげない誘導”が意味を持つように）
  const G = play(seats, { roles, secret, limit, diff: 'all' }, r);
  return { thetaIns, insWin: G.result.winner === 'insider', comWin: G.result.winner === 'commons', ok: G.result.why !== 'none', q: G.qa.length, t: G.elapsed / G.limit, insGuessed: G.guesser === G.insider };
}
function fitness(P, words, seed, games, opt) {
  let a = { iw: 0, ni: 0, cw: 0, nc: 0, ok: 0, q: 0, t: 0, ig: 0 };
  for (let g = 0; g < games; g++) {
    const x = game(P, words, seed, g, opt);
    if (x.thetaIns) { a.ni++; if (x.insWin) a.iw++; if (x.insGuessed) a.ig++; } else { a.nc++; if (x.comWin) a.cw++; }
    if (x.ok) a.ok++; a.q += x.q; a.t += x.t;
  }
  const ins = a.iw / a.ni, com = a.cw / a.nc, ok = a.ok / games;
  return { f: 0.4 * ins + 0.6 * com + 0.15 * ok, ins, com, ok, q: a.q / games, t: a.t / games, insGuess: a.ig / a.ni };
}
if (!isMainThread) {
  const sp = S.split();
  parentPort.on('message', m => { const P = B.fromVec(m.vec); const words = m.set === 'test' ? sp.test : sp.train; parentPort.postMessage({ id: m.id, r: fitness(P, words, m.seed, m.games, { hand: SMART }) }); });
  return;
}
const GENS = +(process.argv[2] || 30), GAMES = +(process.argv[3] || 400), LAMBDA = 12, MU = 4;
const NW = Math.max(1, Math.min(os.cpus().length, 8));
const workers = [], queue = [], waiting = {}; let nextId = 1;
for (let i = 0; i < NW; i++) { const w = new Worker(__filename); w.busy = false; w.on('message', m => { w.busy = false; waiting[m.id](m.r); delete waiting[m.id]; pump(); }); workers.push(w); }
function pump() { workers.forEach(w => { if (!w.busy && queue.length) { const t = queue.shift(); w.busy = true; waiting[t.id] = t.res; w.postMessage(t.msg); } }); }
function evalVec(vec, seed, games, set) { return new Promise(res => { const id = nextId++; queue.push({ id, res, msg: { id, vec, seed, games, set: set || 'train' } }); pump(); }); }
const Kp = B.PKEYS, D = Kp.length;
const toU = v => v.map((x, i) => (x - Kp[i][1]) / (Kp[i][2] - Kp[i][1]));
const fromU = u => u.map((x, i) => Kp[i][1] + Math.min(1, Math.max(0, x)) * (Kp[i][2] - Kp[i][1]));
function randn(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
(async () => {
  const t0 = Date.now(), rng = B.rng(777), sp = S.split();
  console.log(`words: train ${sp.train.length} / held-out test ${sp.test.length}; params ${D}; workers ${NW}; λ=${LAMBDA} μ=${MU}; ${GENS} gens × ${GAMES} games`);
  const w = []; for (let i = 0; i < MU; i++) w.push(Math.log(MU + 0.5) - Math.log(i + 1)); const ws = w.reduce((a, b) => a + b); for (let i = 0; i < MU; i++) w[i] /= ws;
  // 前回の学習ずみ重みから続きを学習（新しいパラメータは手作りの初期値）
  const PREV = Object.assign({}, B.HAND, (S.C.SK_WEIGHTS && S.C.SK_WEIGHTS.P) || {});
  let mean = toU(B.toVec(PREV)), sigma = 0.12, best = null, curve = [];
  const prevR = await evalVec(B.toVec(PREV), 99, GAMES * 3, 'test');
  console.log('previous weights on test words:', JSON.stringify(prevR));
  const before = await evalVec(B.toVec(B.HAND), 99, GAMES * 3, 'test');
  console.log('hand-tuned on test words:', JSON.stringify(before));
  for (let gen = 0; gen < GENS; gen++) {
    const seed = 1000 + gen, pop = [];
    for (let k = 0; k < LAMBDA; k++) { const z = mean.map(() => randn(rng)); pop.push({ z, u: mean.map((m, i) => Math.min(1, Math.max(0, m + sigma * z[i]))) }); }
    pop.push({ z: mean.map(() => 0), u: mean.slice() });
    const res = await Promise.all(pop.map(p => evalVec(fromU(p.u), seed, GAMES)));
    pop.forEach((p, i) => p.r = res[i]); pop.sort((a, b) => b.r.f - a.r.f);
    const nm = mean.map((_, i) => pop.slice(0, MU).reduce((s, p, k) => s + w[k] * p.u[i], 0));
    const succ = pop.findIndex(p => p.z.every(x => x === 0)) < MU / 2 ? 0.92 : 1.06;   // 平均が上位なら探索をしぼる
    mean = nm; sigma = Math.max(0.04, Math.min(0.3, sigma * succ));
    const m = await evalVec(fromU(mean), 5000 + gen, GAMES);
    curve.push({ gen, best: pop[0].r, mean: m, sigma: +sigma.toFixed(3) });
    if (!best || m.f > best.r.f) best = { u: mean.slice(), r: m, gen };
    console.log(`gen ${gen} best f=${pop[0].r.f.toFixed(3)} mean f=${m.f.toFixed(3)} ins=${m.ins.toFixed(2)} com=${m.com.toFixed(2)} ok=${m.ok.toFixed(2)} σ=${sigma.toFixed(3)} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  // 最終候補（平均と、記録上のベスト）を新しいシードで比べて、良いほうを採用
  const cands = [mean, best.u]; let pick = null;
  for (const u of cands) { const r = await evalVec(fromU(u), 777777, GAMES * 3); if (!pick || r.f > pick.r.f) pick = { u, r }; }
  const P = B.fromVec(fromU(pick.u)); Object.keys(P).forEach(k => P[k] = Math.round(P[k] * 10000) / 10000);
  const after = await evalVec(B.toVec(P), 99, GAMES * 3, 'test');
  console.log('trained on test words:', JSON.stringify(after));
  fs.writeFileSync(path.join(__dirname, '..', 'weights.js'), '/* しってるっこ：学習済みのNPCパラメータ（tools/train.js が自己対戦で学習して書き出したファイル。手で編集しない） */\nthis.SK_WEIGHTS = ' + JSON.stringify({ P, trainedAt: new Date().toISOString(), gens: GENS + ((S.C.SK_WEIGHTS && S.C.SK_WEIGHTS.gens) || 0), games: GAMES }, null, 1) + ';\n');
  fs.writeFileSync(path.join(__dirname, 'train-report.json'), JSON.stringify({ heldOutWords: sp.test.length, before, previous: prevR, after, P, curve }, null, 1));
  console.log('wrote weights.js', JSON.stringify(P), ((Date.now() - t0) / 1000).toFixed(0) + 's');
  process.exit(0);
})();
