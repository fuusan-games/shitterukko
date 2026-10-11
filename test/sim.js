// しってるっこ：NPCの強さの統計（学習に使っていない20%のお題で測る）
// usage: node test/sim.js [gamesPerCell=150]  → 表を表示し tools/sim-report.json に保存
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path'), fs = require('fs');
const S = require('../tools/simlib.js'), { B, play } = S;
const TRAINED = (S.C.SK_WEIGHTS && S.C.SK_WEIGHTS.P) || B.HAND;
const LVS = ['easy', 'normal', 'smart', 'ultra'];
// cell: { kind: 'solve'|'catch'|'survive', lv, base: 'trained'|'hand', opp }
function runCell(cell, N) {
  const sp = S.split(), words = sp.test, base = cell.base === 'hand' ? B.HAND : TRAINED;
  let a = { n: 0, ok: 0, q: 0, t: 0, comWin: 0, insWin: 0 };
  for (let g = 0; g < N; g++) {
    const r = B.rng(4242 + g * 31 + (cell.seed || 0)), n = 5 + (g % 2), roles = ['master', 'insider'].concat(new Array(n - 2).fill('common'));
    const secret = words[g % words.length], lvP = B.levelP(base, cell.lv), seats = [];
    for (let i = 0; i < n; i++) {
      let s = { kind: 'npc', P: lvP, lvP: true };
      if (roles[i] === 'insider') {
        if (cell.kind === 'catch') s = cell.opp === 'human' ? { kind: 'human', hb: S.humanBot(r) } : { kind: 'npc', P: cell.opp === 'hand' ? B.levelP(B.HAND, 'smart') : B.levelP(TRAINED, 'ultra'), lvP: true };
        if (cell.kind === 'survive') s = { kind: 'npc', P: lvP, lvP: true };
      } else if (cell.kind === 'survive') s = { kind: 'npc', P: B.levelP(TRAINED, cell.opp), lvP: true };
      seats.push(s);
    }
    const G = play(seats, { roles, secret, limit: cell.limit || 300, diff: 'all', lv: cell.kind === 'survive' ? cell.opp : cell.lv }, r);
    a.n++; if (G.result.why !== 'none') { a.ok++; a.q += G.qa.length; a.t += G.elapsed / G.limit; }
    if (G.result.winner === 'commons') a.comWin++; if (G.result.winner === 'insider') a.insWin++;
  }
  return { ok: a.ok / a.n, q: a.ok ? a.q / a.ok : 0, t: a.ok ? a.t / a.ok : 0, comWin: a.comWin / a.n, insWin: a.insWin / a.n };
}
if (!isMainThread) { parentPort.on('message', m => parentPort.postMessage({ i: m.i, r: runCell(m.cell, m.N) })); return; }
const N = +(process.argv[2] || 150);
const cells = [];
LVS.forEach(lv => cells.push({ kind: 'solve', lv, opp: 'trained', limit: 300 }));
LVS.forEach(lv => cells.push({ kind: 'solve', lv, opp: 'trained', limit: 120 }));
LVS.forEach(lv => ['hand', 'trained', 'human'].forEach(opp => cells.push({ kind: 'catch', lv, opp })));
LVS.forEach(lv => ['normal', 'ultra'].forEach(opp => cells.push({ kind: 'survive', lv, opp })));
// 学習の前後（手作りの初期値 vs 学習ずみ、どちらも最強設定）
['hand', 'trained'].forEach(base => { cells.push({ kind: 'solve', lv: 'ultra', base, limit: 120, tag: 'ba' }); ['hand', 'human'].forEach(opp => cells.push({ kind: 'catch', lv: 'ultra', base, opp, tag: 'ba' })); cells.push({ kind: 'survive', lv: 'ultra', base, opp: 'normal', tag: 'ba' }); });
cells.forEach((c, i) => c.seed = i * 7);
const W = []; let next = 0, done = 0; const res = new Array(cells.length);
const t0 = Date.now();
new Promise(resolve => {
  for (let k = 0; k < 8; k++) { const w = new Worker(__filename); W.push(w); w.on('message', m => { res[m.i] = m.r; done++; if (next < cells.length) w.postMessage({ i: next, cell: cells[next++], N }); else if (done === cells.length) resolve(); }); if (next < cells.length) w.postMessage({ i: next, cell: cells[next++], N }); }
}).then(() => {
  const pc = x => (x * 100).toFixed(0) + '%';
  console.log(`games per cell: ${N}, held-out words only (${S.split().test.length}), ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log('\n[正解率] 5〜6人卓（NPCだけ）  level | 5分: 正解率 平均質問数 使った時間 | 2分: 正解率');
  LVS.forEach((lv, k) => { const a = res[k], b = res[4 + k]; console.log(`  ${lv.padEnd(6)} | ${pc(a.ok)} ${a.q.toFixed(1)}問 ${pc(a.t)} | ${pc(b.ok)}`); });
  console.log('\n[見やぶり率] たんていNPC（level）が勝つ割合  vs 手作りしってるっこ / 学習ずみしってるっこ / 人間っぽいしってるっこ');
  LVS.forEach((lv, k) => { const o = 8 + k * 3; console.log(`  ${lv.padEnd(6)} | ${pc(res[o].comWin)} / ${pc(res[o + 1].comWin)} / ${pc(res[o + 2].comWin)}`); });
  console.log('\n[生きのこり率] しってるっこNPC（level）が勝つ割合  vs ふつうのたんてい / アストラウルトラのたんてい');
  LVS.forEach((lv, k) => { const o = 20 + k * 2; console.log(`  ${lv.padEnd(6)} | ${pc(res[o].insWin)} / ${pc(res[o + 1].insWin)}`); });
  console.log('\n[学習の前後]（最強設定）  2分の正解率 | 見やぶり率 vs手作り / vs人間っぽい | 生きのこり率 vsふつう');
  ['hand', 'trained'].forEach((b, k) => { const o = 28 + k * 4; console.log(`  ${(b === 'hand' ? '学習前(手作り)' : '学習後').padEnd(10)} | ${pc(res[o].ok)} | ${pc(res[o + 1].comWin)} / ${pc(res[o + 2].comWin)} | ${pc(res[o + 3].insWin)}`); });
  fs.writeFileSync(path.join(__dirname, '..', 'tools', 'sim-report.json'), JSON.stringify({ N, cells: cells.map((c, i) => Object.assign({}, c, res[i])) }, null, 1));
  W.forEach(w => w.terminate());
});
