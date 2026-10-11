// E2E：しってるっこ — ①ひとり＋NPC・たんてい役（390×844：入力・🧩・🎤・🎯答え・チャット・投票）②ひとり＋NPC・おだいばん役（大きな はい/いいえ/わからない）
// ③375×667（しってるっこ役・キーボード）④ホスト＋ゲストのオンライン（PeerJS＋ローカルSTUN、NPC入り、お題もれチェック、入り直し）
// usage: node test/stun-server.js <box-ip> 3478 &  python3 -m http.server 8643 &  node test/e2e.js <box-ip> 8643
'use strict';
const PWC = process.env.PW_CORE || '/tmp/pwc/node_modules/playwright-core';
const { chromium } = require(PWC);
const IP = process.argv[2] || '172.30.0.2', PORT = process.argv[3] || 8643;
const ROOT = `http://localhost:${PORT}/index.html`;
const NET = `${ROOT}?ice=${encodeURIComponent('stun:' + IP + ':3478')}&turbo`;
const SS = __dirname + '/../screenshots/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = []; const fail = m => { errors.push(m); console.log('  ✗', m); }; const ok = m => console.log('  ✓', m);
const MIC_MOCK = () => {
  class FakeSR { constructor() { window.__sr = this; this.lang = ''; }
    start() { window.__srLang = this.lang; setTimeout(() => this.onstart && this.onstart(), 10); }
    stop() { setTimeout(() => this.onend && this.onend(), 30); } abort() { this.stop(); } }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
  window.__say = (t, fin) => { const r = [{ transcript: t }]; r.isFinal = !!fin; window.__sr.onresult({ results: [r], resultIndex: 0 }); };
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  async function phone(label, w = 390, h = 844) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ja-JP' });
    const p = await ctx.newPage(); p.label = label;
    await p.addInitScript(MIC_MOCK);
    p.on('pageerror', e => fail(`[${label}] JS error ${e.message}`));
    p.on('console', m => { if (m.type() === 'error' && !/PeerJS|WebSocket|net::|ERR_|Failed to load resource/.test(m.text())) fail(`[${label}] console ${m.text()}`); });
    return p;
  }
  const view = p => p.evaluate(() => window.__sk.view && JSON.parse(JSON.stringify(window.__sk.view)));
  const waitV = (p, fn, ms) => p.waitForFunction(new Function('var v = window.__sk.view; return !!v && (' + fn + ');'), null, { timeout: ms || 20000 });
  const hostG = (p, fn) => p.evaluate(fn);
  // NPCの質問と制限時間を止める（turboでは一瞬で終わるので、人間の操作を確かめる間だけ）
  const hold = async (p, ph) => { await waitV(p, 'v.g && v.g.phase === "' + ph + '"', 20000); await p.evaluate(() => { const G = window.__sk.hostRoom().G; G.at = Date.now() + 1e7; }); };
  const release = p => p.evaluate(() => { const G = window.__sk.hostRoom().G; G.at = Date.now(); });
  const freeze = (p, on) => p.evaluate(on => { const G = window.__sk.hostRoom().G; if (!G) return; if (on) { G._fz = G.npcNext.slice(); G.npcNext = G.npcNext.map(() => Date.now() + 1e7); G.deadline = Date.now() + 1e7; if (G.phase === 'talk') G.at = Date.now() + 1e7; } else { G.npcNext = G.npcNext.map(() => Date.now()); G.deadline = Date.now() + 8000; if (G.phase === 'talk') G.at = Date.now(); } }, on);
  async function layout(p, tag) {
    const r = await p.evaluate(() => {
      const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) return false; for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).display === 'none') return false; return true; };
      const fab = document.getElementById('hirobaFab'), fr = fab && vis(fab) ? fab.getBoundingClientRect() : null;
      const scr = document.querySelector('.screen.active') || document.body, sr = scr.getBoundingClientRect(), hits = [];
      scr.querySelectorAll('button, input, select, a').forEach(b => {
        if (!vis(b) || b === fab) return; const r = b.getBoundingClientRect(); if (!r.width || !r.height) return;
        const top = Math.max(r.top, sr.top), bot = Math.min(r.bottom, sr.bottom, innerHeight); if (bot <= top) return;
        if (fr && r.left < fr.right && r.right > fr.left && top < fr.bottom && bot > fr.top) hits.push((b.id || b.className || b.tagName) + ' ' + (b.textContent || '').trim().slice(0, 12));
      });
      const ir = document.getElementById('inRow').getBoundingClientRect(), mi = document.getElementById('msgIn');
      const wide = []; document.querySelectorAll('.screen.active *').forEach(e => { const b = e.getBoundingClientRect(); if (vis(e) && b.right > innerWidth + 1 && getComputedStyle(e).pointerEvents !== 'none' && !e.closest('#players, #sugg, #quick, .seg')) wide.push(e.id || e.className); });
      return { docScroll: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight, fab: !!fr, hits, inGame: document.body.classList.contains('in-game'), inBottom: ir.bottom, vh: innerHeight, font: parseFloat(getComputedStyle(mi).fontSize), wide: wide.slice(0, 5) };
    });
    if (r.hits.length) fail(`[${tag}] ひろばボタンが重なっている: ${r.hits.join(', ')}`);
    if (r.wide.length) fail(`[${tag}] 横にはみ出し: ${r.wide.join(', ')}`);
    if (r.inGame) {
      if (r.fab) fail(`[${tag}] ゲーム中にひろばボタンが出ている`);
      if (r.docScroll > 1) fail(`[${tag}] ゲーム画面がスクロールする ${r.docScroll}`);
      if (r.inBottom > r.vh + 0.5) fail(`[${tag}] 入力欄が画面外 ${r.inBottom}/${r.vh}`);
      if (r.font < 16) fail(`[${tag}] 入力欄の文字が16px未満（iOSでズームする）`);
    }
    return r;
  }
  // ---------- ① ひとり＋NPC ----------

  const ONLY = (process.env.E2E_ONLY || '1234');
  // ---------- ① ひとり・たんてい役 ----------
  if (ONLY.includes('1')) {
  console.log('① ひとり＋NPC・たんてい役（390×844）');
  {
    const p = await phone('common');
    await p.goto(ROOT + '?turbo&testrole=common&from=portal'); await sleep(400);
    const t = await layout(p, 'title'); if (t.fab) ok('タイトルに「🏠 ひろばへ」(?from=portal)'); else fail('タイトルにひろばボタンがない');
    await p.screenshot({ path: SS + 'e2e_01_title.png' });
    await p.fill('#nameIn', 'りょう'); await p.tap('#soloBtn');
    await waitV(p, 'v.phase === "lobby"');
    await p.tap('#npcGrid [data-ch="kon"]'); await p.tap('#lvSeg [data-v="smart"]'); await p.tap('#limitSeg [data-v="300"]'); await p.tap('#diffSeg [data-v="easy"]');
    let v = await view(p);
    v.opts.npcs.length === 5 && v.opts.lv === 'smart' && v.opts.limit === 300 && v.opts.diff === 'easy' && !v.opts.follower ? ok('ロビー：NPC5人（コンタ🦊追加）・かしこい・5分・かんたん・おともなし(既定)') : fail('lobby opts ' + JSON.stringify(v.opts));
    const fd = await p.isDisabled('#folSeg [data-v="on"]'); fd ? fail('6人なのに おとも が押せない') : ok('6人なので おとも オプションが選べる');
    await layout(p, 'lobby'); await p.screenshot({ path: SS + 'e2e_02_lobby.png', fullPage: true });
    await p.tap('#startBtn'); await hold(p, 'deal');
    await sleep(1700); await p.screenshot({ path: SS + 'e2e_03_rolecard.png' });
    v = await view(p); v.g.role === 'common' && !v.g.word ? ok('役わりカード：🔍たんてい（お題は届いていない）') : fail('role card ' + v.g.role + ' ' + v.g.word);
    await p.tap('#dealGo');
    await hold(p, 'night'); await sleep(300); await p.screenshot({ path: SS + 'e2e_04_night.png' });
    const dark = await p.evaluate(() => document.getElementById('nightOv').classList.contains('dark')); dark ? ok('夜：目をとじる画面（暗転）') : fail('night not dark');
    await release(p);
    await waitV(p, 'v.g.phase === "qa"', 15000); await freeze(p, true); await sleep(100);
    v = await view(p); v.g.word == null ? ok('質問タイム：たんていの画面にお題は無い（？？？）') : fail('word visible to common');
    const secret = await hostG(p, () => { const G = window.__sk.hostRoom().G; return { w: G.db.words[G.secret].w, id: G.secret }; });
    // 手入力の質問
    await p.tap('#msgIn'); await p.fill('#msgIn', 'それって生き物ですか？'); await p.tap('#sendBtn');
    await waitV(p, 'v.g.log.some(function(e){return e.t==="a"&&v.g.log.some(function(q){return q.t==="q"&&q.p===v.g.me&&q.qid===e.qid;});})', 8000).then(() => ok('手入力の質問 → NPCおだいばんが答えた'), () => fail('typed question not answered'));
    const kbAns = await hostG(p, () => { const G = window.__sk.hostRoom().G; const e = G.qa.find(x => x.text === 'それって生き物ですか？'); return e && { ans: e.ans, want: G.db.words[G.secret].v[0] === 1 ? 'y' : G.db.words[G.secret].v[0] === 0 ? 'n' : 'u', a: e.parsed.a }; });
    kbAns && kbAns.ans === kbAns.want && kbAns.a === 0 ? ok(`答えは ずかんどおり（${secret.w}：生き物？→${kbAns.ans}）`) : fail('answer mismatch ' + JSON.stringify(kbAns));
    // 🧩 質問ビルダー
    await sleep(1000); await p.tap('#qbBtn'); await p.tap('#qb [data-t="size"]'); await sleep(100);
    await p.screenshot({ path: SS + 'e2e_05_builder.png' });
    await p.tap('#qb .qchips button'); await sleep(400);
    v = await view(p); v.g.log.some(e => e.t === 'q' && e.p === v.g.me && /手のひら/.test(e.text)) ? ok('🧩 質問ビルダー（大きさ→「手のひらより大きい？」）') : fail('builder question not sent');
    // 🎤 で質問（モック）
    await sleep(1000); await p.tap('#qbBtn');
    await p.tap('#micBtn'); await p.evaluate(() => window.__say('えっと、それは食べものかな', true)); await p.tap('#micBtn'); await sleep(500);
    v = await view(p); const mq = v.g.log.find(e => e.t === 'q' && e.p === v.g.me && /食べもの/.test(e.text));
    mq ? ok('🎤 話した質問がそのまま質問に（「' + mq.text + '」）') : fail('mic question not posted');
    await sleep(900);
    await layout(p, 'qa'); await p.screenshot({ path: SS + 'e2e_06_qa.png' });
    // 🎯 答え（候補チップ）
    await p.tap('#ansBtn'); await p.fill('#msgIn', secret.w.slice(0, 1)); await p.dispatchEvent('#msgIn', 'input'); await sleep(150);
    await p.screenshot({ path: SS + 'e2e_07_answer.png' });
    const chip = await p.$(`#sugg button[data-g="${secret.w}"]`);
    if (chip) { await chip.tap(); } else { await p.fill('#msgIn', secret.w); await p.tap('#sendBtn'); }
    await waitV(p, 'v.g.phase !== "qa"', 5000).then(() => ok('🎯 答え「' + secret.w + '」で正解 → 正解者は自分'), () => fail('guess failed'));
    await sleep(300); await p.screenshot({ path: SS + 'e2e_08_found.png' });
    await waitV(p, 'v.g.phase === "talk"', 8000); await freeze(p, true);
    v = await view(p); v.g.word === secret.w ? ok('正解のあとは お題が全員に公開') : fail('word not public after found');
    await p.fill('#msgIn', 'ロボミはどう思う？'); await p.tap('#sendBtn'); await sleep(1600);
    v = await view(p); v.g.log.some(e => e.t === 'npc' && v.g.players[e.p].ch === 'robo' && e.k !== 'talk' || (e.t === 'npc' && v.g.players[e.p].ch === 'robo')) ? ok('話し合い：チャットにロボミ🤖が返事') : fail('robo no reply');
    await layout(p, 'talk'); await p.screenshot({ path: SS + 'e2e_09_talk.png' });
    await p.tap('#skipBtn');
    await waitV(p, 'v.phase === "end"', 30000).then(() => ok('結果画面まで到達（' + secret.w + '）'), () => fail('no end'));
    await sleep(2600); await p.screenshot({ path: SS + 'e2e_10_end.png' });
    v = await view(p); const pr = await p.textContent('#pairRow'), ins = v.g.result.roles.indexOf('insider');
    pr.indexOf(secret.w) >= 0 && pr.indexOf(v.g.players[ins].name) >= 0 ? ok('結果：お題・しってるっこ・勝敗・質問ふりかえり') : fail('end cards');
    (await p.isVisible('#hirobaFab')) ? ok('結果画面では ひろばボタンが戻る') : fail('no fab on end');
    await p.screenshot({ path: SS + 'e2e_11_end_full.png', fullPage: true });
    // 2戦目：たんてい役で投票ボタンを本物のタップで（NPCに当てさせる）
    await p.tap('#againBtn'); await waitV(p, 'v.phase === "game"');
    await p.tap('#dealGo').catch(() => {});
    let v1 = false, v2 = false, tie = false;
    for (let i = 0; i < 500; i++) {
      v = await view(p); if (!v || v.phase === 'end') break; const g = v.g;
      if (g.phase === 'deal') await p.tap('#dealGo').catch(() => {});
      if (g.phase === 'talk') await p.tap('#skipBtn').catch(() => {});
      if (g.phase === 'v1' && g.v1.voters.indexOf(g.me) >= 0 && g.v1.mine == null) { await p.screenshot({ path: SS + 'e2e_12_vote1.png' }); await p.tap('#v1Btns .no'); await p.tap('#cfYes'); v1 = true; }
      if (g.phase === 'v2' && g.v2.mine == null && g.v2.cands.length) { await p.screenshot({ path: SS + 'e2e_13_vote2.png' }); await p.tap('#voteGrid button'); await p.tap('#cfYes'); v2 = true; }
      if (g.phase === 'tie' && g.guesser === g.me) { await p.tap('#voteGrid button'); await p.tap('#cfYes'); tie = true; }
      await sleep(80);
    }
    v1 ? ok('投票①：🙅ボタン＋確認') : fail('no v1 vote'); v2 ? ok('投票②：候補をタップ＋確認') : console.log('  (投票②なし：投票①で決着)');
    await waitV(p, 'v.phase === "end"', 30000).then(() => ok('2戦目も完走：' + 'why=' + 'ok'), () => fail('game2'));
    await sleep(3500); await p.screenshot({ path: SS + 'e2e_14_end2.png' });
    await p.context().close();
  }
  }
  // ---------- ② ひとり・おだいばん役 ----------
  if (ONLY.includes('2')) {
  console.log('② ひとり＋NPC・おだいばん役（390×844）');
  {
    const p = await phone('master');
    await p.goto(ROOT + '?turbo&testrole=master'); await p.fill('#nameIn', 'りょう'); await p.tap('#soloBtn'); await waitV(p, 'v.phase === "lobby"');
    await p.tap('#lvSeg [data-v="ultra"]'); await p.tap('#startBtn'); await hold(p, 'deal');
    await sleep(800); (await p.evaluate(() => document.getElementById('awaken').classList.contains('on') || getComputedStyle(document.getElementById('awaken')).display !== 'none')) ? ok('アストラウルトラ😎：覚醒演出') : console.log('  (覚醒演出の判定できず)');
    await p.screenshot({ path: SS + 'e2e_15a_ultra_awaken.png' }); await sleep(7000); await release(p);
    await waitV(p, 'v.g.eyes === "open"', 20000); await p.evaluate(() => { const G = window.__sk.hostRoom().G; G.at = Date.now() + 1e7; }); await sleep(300);
    let v = await view(p); const w0 = v.g.word;
    await p.screenshot({ path: SS + 'e2e_15_master_night.png' });
    await p.tap('#swapBtn'); await sleep(200); v = await view(p);
    v.g.word && v.g.word !== w0 && v.g.swaps === 1 ? ok(`おだいばん：お題を見て かえられる（${w0}→${v.g.word}）`) : fail('swap');
    await p.tap('#mOkBtn');
    await waitV(p, 'v.g.phase === "qa"', 15000);
    let answered = 0, shot = false, mic = false, agree = 0;
    for (let i = 0; i < 800; i++) {
      v = await view(p); if (!v || v.phase === 'end' || v.g.phase !== 'qa') break;
      const t = v.g.toAnswer;
      if (t) {
        if (!shot) { shot = true; await layout(p, 'master'); await p.screenshot({ path: SS + 'e2e_16_master_answer.png' }); }
        const a = t.hint ? (t.hint.ans === 'correct' ? 'y' : t.hint.ans) : 'u';
        if (!mic && a === 'y') { mic = true; await p.tap('#micBtn'); await p.evaluate(() => window.__say('はい', true)); await p.tap('#micBtn'); await sleep(250); }
        else await p.tap(`#mPanel [data-ans="${a}"]`).catch(() => {});
        answered++; await sleep(60); continue;
      }
      await sleep(40);
    }
    await waitV(p, 'v.phase === "end"', 40000).catch(() => {});
    v = await view(p);
    const byMe = await hostG(p, () => { const G = window.__sk.hostRoom().G; return { m: G.qa.filter(e => e.by === 'master').length, to: G.qa.filter(e => e.by === 'timeout').length, why: G.result && G.result.why, n: G.qa.length, mic: G.log.some(e => e.t === 'a') }; });
    byMe.m >= 3 ? ok(`おだいばん（人間）が ⭕❌🤷 ボタンで ${byMe.m}問に答えた（おまかせ ${byMe.to}問）`) : fail('master answers ' + JSON.stringify(byMe));
    mic ? ok('🎤「はい」と話して答えられる') : console.log('  (🎤で答える場面なし)');
    byMe.why && byMe.why !== 'none' ? ok('NPCたんていが 人間おだいばんの答えで正解（' + byMe.n + '問）') : fail('npcs did not solve ' + JSON.stringify(byMe));
    await sleep(2500); await p.screenshot({ path: SS + 'e2e_17_master_end.png' });
    await p.context().close();
  }
  }
  // ---------- ③ 375×667・しってるっこ役・キーボード ----------
  if (ONLY.includes('3')) {
  console.log('③ 375×667・しってるっこ役');
  {
    const p = await phone('small', 375, 667);
    await p.goto(ROOT + '?turbo&testrole=insider'); await p.fill('#nameIn', 'ちび'); await p.tap('#soloBtn'); await waitV(p, 'v.phase === "lobby"'); await layout(p, 'lobby375');
    await p.tap('#startBtn'); await hold(p, 'deal'); await sleep(1600);
    await p.screenshot({ path: SS + 'e2e_18_375_rolecard.png' }); await p.tap('#dealGo');
    await waitV(p, 'v.g.eyes === "open"', 15000); await p.evaluate(() => { const G = window.__sk.hostRoom().G; G.at = Date.now() + 1e7; }); await sleep(300);
    let v = await view(p); v.g.role === 'insider' && v.g.word ? ok('しってるっこ：夜の自分の番で お題が見える（' + v.g.word + '）') : fail('insider night');
    await p.screenshot({ path: SS + 'e2e_19_375_insider_night.png' }); await release(p);
    await waitV(p, 'v.g.phase === "qa"', 15000); await freeze(p, true); await sleep(150);
    await layout(p, 'qa375'); await p.screenshot({ path: SS + 'e2e_20_375_qa.png' });
    const kb = await p.evaluate(() => { document.documentElement.style.setProperty('--vvh', '330px'); document.body.classList.add('kb'); const r = document.getElementById('inRow').getBoundingClientRect(); return r.bottom; });
    kb <= 330.5 ? ok('キーボード表示時（見える高さ330px）も入力欄が見える ' + Math.round(kb)) : fail('input hidden by keyboard ' + kb);
    await p.screenshot({ path: SS + 'e2e_21_375_keyboard.png' });
    await p.evaluate(() => { document.documentElement.style.setProperty('--vvh', '100%'); document.body.classList.remove('kb'); });
    await freeze(p, false); await p.evaluate(() => { window.__sk.autoplay = true; });
    await waitV(p, 'v.phase === "end"', 60000).then(() => ok('しってるっこ役でも完走'), () => fail('insider game no end'));
    await sleep(2500); await layout(p, 'end375'); await p.screenshot({ path: SS + 'e2e_22_375_end.png' });
    await p.context().close();
  }
  }
  // ---------- ④ オンライン ----------
  if (ONLY.includes('4')) {
  console.log('④ オンライン（ホスト＋ゲスト、NPC入り）');
  {
    const host = await phone('host'), guest = await phone('guest');
    await host.goto(NET + '&testrole=master'); await host.fill('#nameIn', 'ホスト'); await host.tap('#createBtn');
    await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('codeBig').textContent) && !document.getElementById('connecting').classList.contains('active'), null, { timeout: 40000 }).catch(() => {});
    const code = await host.textContent('#codeBig');
    (await host.$('#qr svg')) ? ok('部屋コード ' + code + '・QRコード') : fail('no QR');
    await host.screenshot({ path: SS + 'e2e_23_host_lobby.png', fullPage: true });
    await guest.goto(NET + '&room=' + code); await guest.fill('#nameIn', 'たろう'); await guest.tap('#joinInvitedBtn');
    let joined = true; await waitV(guest, 'v.seats.length === 2', 45000).then(() => ok('ゲストが招待URLで参加（WebRTC）'), () => { joined = false; fail('guest could not join'); });
    if (joined) {
      await host.tap('#npcGrid [data-ch="mimi"]'); await host.tap('#npcGrid [data-ch="pochi"]');
      await waitV(guest, 'v.opts.npcs.length === 4'); ok('ゲストのロビーにNPC設定が反映（合計6人）');
      await host.tap('#startBtn'); await waitV(guest, 'v.phase === "game"', 15000);
      const info = await host.evaluate(() => { const G = window.__sk.hostRoom().G; const W = G.db.words[G.secret]; return { names: W.n.concat([W.w]), word: W.w, roles: G.roles, players: G.players.map(p => p.name) }; });
      const gi = info.players.indexOf('たろう'), grole = info.roles[gi];
      await host.evaluate(() => { window.__sk.autoplay = true; }); await guest.evaluate(() => { window.__sk.autoplay = true; });
      let leaks = [], seen = 0, shotG = false;
      for (let i = 0; i < 600; i++) {
        const gv = await view(guest); if (!gv || gv.phase === 'end') break; if (!gv.g) { await sleep(50); continue; } seen++;
        const g = gv.g, pre = ['deal', 'night', 'qa'].indexOf(g.phase) >= 0, j = JSON.stringify(gv);
        const may = !pre || (grole === 'insider' && (g.phase === 'qa' || (g.phase === 'night' && ['insider', 'open'].indexOf(g.nstep) >= 0)));
        if (!may && (g.word || info.names.some(nm => nm.length >= 2 && JSON.stringify(g.log.filter(e => e.t !== 'q')).indexOf(nm) >= 0))) leaks.push(g.phase + ':word');
        if (g.phase !== 'end' && g.phase !== 'reveal' && (g.roles || (grole === 'common' && g.pal != null) || /:"(insider|follower)"/.test(j.replace('"role":"' + grole + '"', '').replace('"nstep":"insider"', '')) && !(g.v1 && g.v1.yes != null) && !g.v2)) { const jj = j.replace('"role":"' + grole + '"', '').replace('"nstep":"insider"', ''); const mm = jj.match(/.{50}:"(insider|follower)".{10}/); leaks.push(g.phase + ':role(' + grole + ') ' + (mm ? mm[0] : g.roles ? 'roles' : 'pal')); }
        if (!shotG && g.phase === 'qa') { shotG = true; await guest.screenshot({ path: SS + 'e2e_24_guest_qa.png' }); }
        await sleep(40);
      }
      leaks.length === 0 && seen > 10 ? ok(`ゲスト（${grole}）に届く画面データに お題・他人の役わりが入っていない（${seen}回チェック）`) : fail('leak ' + leaks.slice(0, 5).join(','));
      await waitV(guest, 'v.phase === "end"', 60000).then(() => ok('ゲスト側も結果画面まで到達'), () => fail('guest no end'));
      await sleep(2500); await guest.screenshot({ path: SS + 'e2e_25_guest_end.png' });
      await host.evaluate(() => { window.__sk.autoplay = false; }); await host.tap('#toLobbyBtn');
      await waitV(guest, 'v.phase === "lobby"'); await guest.reload(); await sleep(500);
      if (await guest.isVisible('#rejoinBtn')) { await guest.tap('#rejoinBtn'); await waitV(guest, 'v.phase === "lobby" && v.seats.length === 2', 40000).then(() => ok('リロード後「部屋に戻る」で同じ席に復帰'), () => fail('rejoin failed')); }
      else fail('no rejoin button');
    }
    await host.context().close(); await guest.context().close();
  }
  }
  await browser.close();
  console.log(errors.length ? `\n${errors.length} problem(s)` : '\nALL OK');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
