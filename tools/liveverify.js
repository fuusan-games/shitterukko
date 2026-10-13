// 公開版の確認：お題を ドッジボール に固定した ひとりゲームで「ボールつかいますか？」→ はい
// usage: node tools/liveverify.js <url>   (PW_CORE=…/playwright-core)
'use strict';
const { chromium } = require(process.env.PW_CORE || '/tmp/pwc/node_modules/playwright-core');
const URL0 = (process.argv[2] || 'https://fuusan-games.github.io/shitterukko/');
const QS = process.argv.slice(3).length ? process.argv.slice(3) : ['ボールつかいますか？', 'ドッチボール？'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ja-JP' })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'turbo&testrole=common&debug=sk-test&testword=' + encodeURIComponent('ドッジボール') + '&v=' + Date.now(), { waitUntil: 'load' });
  await p.fill('#nameIn', 'てすと'); await p.tap('#soloBtn');
  await p.waitForFunction(() => window.__sk.view && window.__sk.view.phase === 'lobby');
  await p.tap('#startBtn');
  for (let i = 0; i < 200; i++) { const ph = await p.evaluate(() => { const G = window.__sk.hostRoom().G; if (G.phase !== 'qa') G.at = Date.now(); else G.npcNext = G.npcNext.map(() => Date.now() + 1e7); return G.phase; }); if (ph === 'qa') break; const dg = await p.$('#dealGo'); if (dg && await dg.isVisible()) await dg.tap().catch(() => {}); await sleep(100); }
  const word = await p.evaluate(() => { const G = window.__sk.hostRoom().G; return G.db.words[G.secret].w + ' / master=' + (G.players[G.master].kind); });
  console.log('お題:', word, '| facts.js loaded:', await p.evaluate(() => !!(window.SK_FACTS && window.SK_FACTS.length)));
  for (const q of QS) {
    await p.fill('#msgIn', q); await p.tap('#sendBtn');
    let r = null;
    for (let i = 0; i < 100 && !r; i++) { await sleep(150); r = await p.evaluate(q => { const G = window.__sk.hostRoom().G; const e = G.qa.find(x => x.text === q); return e && e.ans ? { ans: e.ans, by: e.by } : null; }, q); }
    const shown = await p.evaluate(() => { const L = window.__sk.view.g.log.filter(e => e.t === 'a'); const e = L[L.length - 1]; return e && (e.ans || e.text); });
    console.log(q, '→', r && r.ans, '(画面:', shown, ')');
    await sleep(1200);
  }
  if (errs.length) console.log('JS errors:', errs);
  await b.close();
})();
