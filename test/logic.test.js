// しってるっこ：ルール・役わり配布・情報もれ・知識ベース・読み取り・NPCの答え／推理のテスト
// usage: node --test test/logic.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const C = require('../tools/load.js')();
const K = C.SKB, B = C.SKBR, L = C.SKL;
const DB = K.build(C.SK_TOPICS);
const eq = (a, b, m) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), m);
const AI = id => K.ATTRS.findIndex(a => a.id === id);
const PW = (C.SK_WEIGHTS && C.SK_WEIGHTS.P) || B.HAND;

// ---------- 知識ベース ----------
test('お題ずかん：300語以上・カテゴリ・難易度・重複なし・整合性', () => {
  const W = DB.words; assert.ok(W.length >= 300, 'words ' + W.length);
  assert.ok(Object.keys(DB.cats).length >= 20);
  const d = { e: 0, n: 0, h: 0 }; W.forEach(w => d[w.diff]++); assert.ok(d.e >= 80 && d.n >= 80 && d.h >= 80, JSON.stringify(d));
  assert.strictEqual((DB.dropped || []).length, 0);
  const seen = {}; W.forEach(w => { const k = K.ATTRS.map(a => w.v[a.i]).join(''); (seen[k] = seen[k] || []).push(w); }); for (const k in seen) { const g = seen[k]; assert.ok(g.length <= 3, '同じ特ちょうが多すぎ: ' + g.map(w => w.w).join('/')); if (g.length > 1) assert.ok(g.every(w => w.facts && Object.keys(w.facts).length), '同じ特ちょうなら 関係ることばで区別できること: ' + g.map(w => w.w).join('/')); }   // 1,000語では特ちょうだけで全部は分けられない → 3語までは「関係ることば」の質問で区別
  const imp = [['s3', 's2'], ['s2', 's1'], ['ani', 'liv'], ['bird', 'liv'], ['fish', 'liv'], ['bug', 'liv'], ['pla', 'liv'], ['fruit', 'food'], ['veg', 'food'], ['dish', 'food'], ['sweets', 'food'], ['food', 'edible']];
  const colors = K.ATTRS.filter(a => a.g === 'color' && a.id !== 'tall').map(a => a.i);
  W.forEach(w => {
    imp.forEach(([a, b]) => { if (b === 'liv' && w.v[AI('food')] === 1) return; if (AI(a) >= 0 && AI(b) >= 0 && w.v[AI(a)] === 1) assert.strictEqual(w.v[AI(b)], 1, w.w + ': ' + a + '⇒' + b); });
    if (w.v[AI('s1')] === 0) assert.notStrictEqual(w.v[AI('s2')], 1, w.w + ' s1=0 なのに s2=1');
    const cs = colors.map(i => w.v[i]); assert.ok(cs.indexOf(1) >= 0 || cs.every(x => x === 2), w.w + ': 色が全部いいえ');
    const yes = K.ATTRS.filter(a => w.v[a.i] === 1).length; assert.ok(yes >= 2, w.w + ' yes=' + yes);
  });
  // 主観的な特ちょう（かわいい・子どもが好き など）は、タグのない語は「わからない」が既定（おだいばんが無理に決めない）
  K.ATTRS.forEach(a => { const y = W.filter(w => w.v[a.i] === 1).length, n = W.filter(w => w.v[a.i] === 0).length; assert.ok(y >= 2 && (n >= 2 || a.def === 'u'), a.id + ' y=' + y + ' n=' + n); });
});
test('お題の名前・別名は「それは○○？」で答えとして読める', () => {
  let bad = [];
  DB.words.forEach(w => { [w.w + '？', 'それは' + w.w + 'ですか？', w.w + 'かな'].forEach(q => { const p = K.parse(DB, q); if (!(p.t === 'guess' && p.w === w.id)) bad.push(q); }); });
  assert.ok(bad.length <= DB.words.length * 3 * 0.01, bad.slice(0, 20).join(' / '));
});

// ---------- 自由入力の読み取り ----------
function parseAcc(T) {
  let ok = 0; const bad = [];
  T.forEach(([q, exp, neg]) => { const p = K.parse(DB, q); let got; if (p.t === 'attr') got = K.ATTRS[p.a].id + (p.neg ? '!' : ''); else if (p.t === 'guess') got = 'guess:' + (p.w >= 0 ? DB.words[p.w].w : '?'); else if (p.t === 'fact' && p.a == null) got = 'guess:?'; else if (p.t === 'cmp') got = 's' + Math.min(3, DB.words[p.w].size) + (p.big ? '' : '!'); else got = 'none';   // 「車より大きい？」は お題ずかんの語との大きさくらべ
    const want = exp.startsWith('guess') || exp === 'none' ? exp : exp + (neg ? '!' : ''); if (got === want) ok++; else bad.push(q + '→' + got); });
  return { acc: ok / T.length, n: T.length, bad };
}
test('読み取り：調整用セット ≥97%', () => { const r = parseAcc(require('./paraphrases.js')); console.log('    tuned', r.n, (r.acc * 100).toFixed(1) + '%', r.bad.join(' ')); assert.ok(r.acc >= 0.97); });
test('読み取り：未調整（ホールドアウト）セット ≥95%', () => { const r = parseAcc(require('./paraphrases_holdout.js')); console.log('    holdout', r.n, (r.acc * 100).toFixed(1) + '%', r.bad.join(' ')); assert.ok(r.acc >= 0.95); });
test('読み取り：全130の質問文を 語尾・否定を変えて自動生成（≥95%）', () => {
  const T = [];
  K.ATTRS.forEach(a => {
    const core = a.q.replace(/^それは\s*/, '').replace(/[？?]$/, '');
    T.push([a.q, a.id]); T.push([core + 'ですか？', a.id]); T.push(['それって' + core + '？', a.id]); T.push([core + 'かな？', a.id]);
  });
  const r = parseAcc(T); console.log('    generated', r.n, (r.acc * 100).toFixed(1) + '%', r.bad.slice(0, 12).join(' '));
  assert.ok(r.acc >= 0.95);
});

// ---------- 役わり配布 ----------
test('役わり：4〜8人で おだいばん1・しってるっこ1・残りたんてい（おともは6人以上のオプション）', () => {
  for (let n = 4; n <= 8; n++) for (const fol of [false, true]) {
    const cntM = new Array(n).fill(0);
    for (let k = 0; k < 300; k++) {
      const players = []; for (let i = 0; i < n; i++) players.push({ kind: 'npc', ch: ['fuu', 'mimi', 'robo', 'nyaco', 'pochi', 'kon'][i % 6] });
      const G = L.newGame(DB, PW, { players, rng: B.rng(n * 1000 + k + (fol ? 7 : 0)), turbo: true, now: 0, follower: fol });
      const c = r => G.roles.filter(x => x === r).length;
      assert.strictEqual(c('master'), 1); assert.strictEqual(c('insider'), 1);
      assert.strictEqual(c('follower'), fol && n >= 6 ? 1 : 0);
      assert.strictEqual(c('common'), n - 2 - c('follower'));
      cntM[G.master]++;
    }
    cntM.forEach(x => assert.ok(x > 300 / n * 0.5, '席による かたより ' + cntM));
  }
  assert.throws(() => L.newGame(DB, PW, { players: [1, 2, 3].map(() => ({ kind: 'npc', ch: 'fuu' })), turbo: true }));
});

// ---------- 人間4人で手動進行（勝敗表） ----------
function humanGame(roles, o) {
  o = o || {};
  const players = roles.map((_, i) => ({ kind: 'human', sid: i + 1, name: 'P' + i }));
  const G = L.newGame(DB, PW, { players, roles, rng: B.rng(o.seed || 1), turbo: true, now: 0, blackGuess: o.blackGuess, secret: o.secret != null ? o.secret : 5, limit: o.limit });
  let now = 0; const T = (ms) => { now += ms || 30; L.tick(G, now); };
  const until = (ph, max) => { for (let i = 0; i < (max || 2000) && G.phase !== ph; i++) T(); assert.strictEqual(G.phase, ph); };
  return { G, T, until, get now() { return now; } };
}
function toV1(h, guesser) {
  const { G } = h; h.until('night'); h.until('qa', 3000);
  if (G.phase === 'night') { L.masterOk(G, G.master, h.now); h.until('qa'); }
  assert.strictEqual(L.ask(G, guesser, DB.words[G.secret].w + '？', h.now), null);
  assert.strictEqual(G.phase, 'found'); h.until('talk'); L.skip(G, h.now); h.T(); assert.strictEqual(G.phase, 'v1');
}
const R4 = ['master', 'insider', 'common', 'common'], R5 = ['master', 'insider', 'common', 'common', 'common'];
test('勝敗：正解者＝しってるっこ を投票①で過半数 → たんていチームの勝ち（おだいばん含む）', () => {
  const h = humanGame(R4); toV1(h, 1); const G = h.G;
  [0, 2, 3].forEach(p => L.vote1(G, p, true, h.now)); h.until('end');
  eq([G.result.winner, G.result.why], ['commons', 'v1catch']); eq(G.result.winners.sort(), [0, 2, 3]);
});
test('勝敗：正解者＝しってるっこ を見のがす（過半数にならない）→ 正解者が役を明かして しってるっこの勝ち', () => {
  const h = humanGame(R5); toV1(h, 1); const G = h.G;
  [0, 2, 3, 4].forEach(p => L.vote1(G, p, p === 2, h.now)); h.T(); assert.strictEqual(G.phase, 'v1show');
  assert.strictEqual(L.view(G, 3, h.now).gRole, 'insider');
  h.until('end'); eq([G.result.winner, G.result.why], ['insider', 'v1miss']); eq(G.result.winners, [1]); assert.ok(!G.v2);
});
test('投票②：正解者（たんてい）と おだいばんは候補外、正解者・おだいばんも投票する', () => {
  const h = humanGame(R5); toV1(h, 2); const G = h.G;
  [0, 1, 3, 4].forEach(p => L.vote1(G, p, false, h.now)); h.until('v2');
  eq(G.v2.cands, [1, 3, 4]); assert.ok(L.v2Cands(G, 0).length === 3 && L.v2Cands(G, 2).length === 3);
});
test('勝敗：正解者（たんてい）を まちがえて過半数 → しってるっこの勝ち／ブラック版オプションなら正解者も勝ち', () => {
  for (const bg of [false, true]) {
    const h = humanGame(R4, { blackGuess: bg }); toV1(h, 2); const G = h.G;
    [0, 1, 3].forEach(p => L.vote1(G, p, true, h.now)); h.until('end');
    eq([G.result.winner, G.result.why], ['insider', 'v1wrong']);
    eq(G.result.winners.sort(), bg ? [1, 2] : [1]);
  }
});
test('勝敗：投票①が同数（過半数でない）→ 投票②で当たり／外れ', () => {
  for (const hit of [true, false]) {
    const h = humanGame(R5); toV1(h, 2); const G = h.G;
    [0, 1, 3, 4].forEach((p, k) => L.vote1(G, p, k < 2, h.now)); h.until('v2');   // 2対2
    const target = hit ? 1 : 3;
    [0, 1, 2, 3, 4].forEach(p => { const c = L.v2Cands(G, p); L.vote2(G, p, c.indexOf(target) >= 0 ? target : c.filter(x => x !== target)[0], h.now); });
    h.until('end');
    eq([G.result.winner, G.result.why], hit ? ['commons', 'v2catch'] : ['insider', 'v2miss']);
  }
});
test('勝敗：投票②が同数なら 正解者が決める', () => {
  const h = humanGame(['master', 'insider', 'common', 'common', 'common', 'common']); toV1(h, 2); const G = h.G;
  [0, 1, 3, 4, 5].forEach(p => L.vote1(G, p, false, h.now)); h.until('v2');
  const votes = { 0: 1, 1: 3, 2: 4, 3: 1, 4: 3, 5: 4 };   // 1:2票 3:2票 4:2票
  Object.keys(votes).forEach(p => assert.strictEqual(L.vote2(G, +p, votes[p], h.now), null));
  h.until('tie'); assert.strictEqual(L.tiePick(G, 0, 1, h.now), 'いまは決められません');
  assert.strictEqual(L.tiePick(G, 2, 1, h.now), null); h.until('end');
  eq([G.result.winner, G.result.why], ['commons', 'v2catch']);
});
test('勝敗：時間切れ → 全員の負け／話し合い時間＝質問にかかった時間', () => {
  const h = humanGame(R4, { limit: 60 }); const G = h.G; h.until('night'); h.until('qa', 3000); if (G.phase === 'night') { L.masterOk(G, 0, h.now); h.until('qa'); }
  h.until('end', 5000); eq([G.result.winner, G.result.why, G.result.winners.length], ['none', 'none', 0]);
  const h2 = humanGame(R4); toV1Partial(h2);
  function toV1Partial(h) { const G = h.G; h.until('night'); h.until('qa', 3000); if (G.phase === 'night') { L.masterOk(G, 0, h.now); h.until('qa'); } for (let i = 0; i < 100; i++) h.T(); L.ask(G, 2, DB.words[G.secret].w + '？', h.now); h.until('talk'); assert.ok(Math.abs(G.talkDur - Math.max(G.T.talkMin, G.elapsed)) < 1 && G.elapsed >= 2900); }
});
test('ルール：おだいばんは質問できない・正解者は投票①に投票しない・知らないお題はかえられる（公式どおり回数制限なし）', () => {
  const h = humanGame(R4); const G = h.G; h.until('night'); for (let i = 0; i < 200 && G.nstep !== 'master'; i++) h.T();
  assert.strictEqual(L.swap(G, 1, h.now), 'いまは変えられません');
  const seen = new Set([G.secret]); for (let k = 0; k < 8; k++) { assert.strictEqual(L.swap(G, 0, h.now), null); seen.add(G.secret); } assert.ok(seen.size >= 8);
  L.masterOk(G, 0, h.now); h.until('qa'); assert.ok(L.ask(G, 0, '生き物？', h.now));
  L.ask(G, 3, '生き物？', h.now); assert.strictEqual(G.pending.length, 1); assert.ok(G.pending[0].human);
  assert.strictEqual(L.answer(G, 0, G.pending[0].qid, 'y', h.now), null);
  L.ask(G, 2, DB.words[G.secret].w + '？', h.now); h.until('talk'); L.skip(G, h.now); h.T(); assert.ok(L.vote1(G, 2, true, h.now));
});

// ---------- 情報もれ（お題・役わりが 見てはいけない人の端末に送られない） ----------
test('もれなし：お題は おだいばん（夜の自分の番から）・しってるっこ（自分の番から）だけ。役わりは本人だけ', () => {
  for (let k = 0; k < 40; k++) {
    const n = 4 + (k % 5), players = []; for (let i = 0; i < n; i++) players.push(i < 2 ? { kind: 'human', sid: i + 1, name: 'H' + i } : { kind: 'npc', ch: ['fuu', 'mimi', 'robo', 'nyaco', 'pochi', 'kon'][i % 6] });
    const G = L.newGame(DB, PW, { players, rng: B.rng(500 + k), turbo: true, now: 0, lv: 'smart', follower: k % 2 === 0, diff: 'all' });
    const W = DB.words[G.secret], names = W.n.concat([W.w]);
    let now = 0, steps = 0, foundSeen = false;
    while (G.phase !== 'end' && steps++ < 20000) {
      now += 20; L.tick(G, now);
      if (G.phase === 'night' && G.nstep === 'master' && players[G.master].kind === 'human') L.masterOk(G, G.master, now);
      if (G.phase === 'qa') G.pending.filter(e => e.human).forEach(e => L.answer(G, G.master, e.qid, K.answerParsed(DB, e.parsed, G.secret) === 'correct' ? 'y' : K.answerParsed(DB, e.parsed, G.secret), now));
      if (G.phase === 'v1') G.v1.voters.forEach(p => { if (players[p].kind === 'human' && G.v1.votes[p] == null) L.vote1(G, p, false, now); });
      if (G.phase === 'v2') [0, 1].forEach(p => { if (G.v2.votes[p] == null && L.v2Cands(G, p).length) L.vote2(G, p, L.v2Cands(G, p)[0], now); });
      if (G.phase === 'tie' && G.guesser < 2) L.tiePick(G, G.guesser, G.v2.tops[0], now);
      if (steps % 7) continue;
      const pre = ['deal', 'night', 'qa'].indexOf(G.phase) >= 0; if (!pre) foundSeen = true;
      for (let p = -1; p < n; p++) {
        const v = L.view(G, p, now), js = JSON.stringify(v), role = p >= 0 ? G.roles[p] : null;
        const ni = ['close', 'master', 'insider', 'open'].indexOf(G.nstep);
        const may = !pre || (role === 'master' && (G.phase === 'qa' || ni >= 1)) || (role === 'insider' && (G.phase === 'qa' || ni >= 2));
        if (!may) {
          assert.ok(v.word == null && v.cat == null, 'word sent to ' + role + ' in ' + G.phase);
          // 公開ログ（NPCの発言・質問文）にお題が出ていない（はずれの「それは○○？」の○○は別の言葉）
          names.forEach(nm => { if (nm.length >= 2) assert.ok(!v.log.some(e => e.t !== 'q' && String(e.text || e.say || '').includes(nm)), 'log leaks ' + nm + ' in ' + G.phase); });
        }
        if (G.phase !== 'end' && G.phase !== 'reveal') {
          assert.ok(v.roles == null && v.result == null && v.qaFull == null);
          if (role !== 'insider' && role !== 'follower') assert.ok(v.pal == null);
          const shown = G.v1 && G.v1.yes != null;   // 投票①のあとは 正解者の役わりだけ公開
          if (!shown) assert.ok(!/:"(insider|follower)"/.test(js.replace('"role":"' + role + '"', '').replace('"nstep":"insider"', '')), 'role leak to ' + role + ' in ' + G.phase);
          if (p !== G.master) assert.ok(v.toAnswer == null);
        }
      }
    }
    assert.strictEqual(G.phase, 'end'); assert.ok(foundSeen || G.result.why === 'none');
  }
});

// ---------- NPC ----------
test('NPCおだいばん：答えは ずかんと 100% 一致（わからない属性は「わからない」）', () => {
  let n = 0;
  for (let k = 0; k < 30; k++) {
    const players = []; for (let i = 0; i < 5; i++) players.push({ kind: 'npc', ch: ['fuu', 'mimi', 'robo', 'nyaco', 'pochi'][i] });
    const G = L.newGame(DB, PW, { players, rng: B.rng(900 + k), turbo: true, now: 0, lv: ['easy', 'normal', 'smart', 'ultra'][k % 4], diff: 'all' });
    let now = 0; while (G.phase !== 'end' && now < 60000) { now += 20; L.tick(G, now); }
    G.qa.forEach(e => {
      if (e.parsed.t !== 'attr') return; n++;
      const x = DB.words[G.secret].v[e.parsed.a], want = x === 2 ? 'u' : ((x === 1) !== !!e.parsed.neg ? 'y' : 'n');
      const okA = want === 'u' ? ['u', 'py', 'pn'] : want === 'y' ? ['y', 'py'] : ['n', 'pn'];   // 人間らしい「部分的に…」は 同じ向きなら一致とみなす
      assert.ok(okA.includes(e.ans), e.text + ' @' + DB.words[G.secret].w + ' ' + e.ans + ' want ' + want);
    });
  }
  assert.ok(n > 200, 'questions ' + n);
});
test('NPCたんてい：学習ずみの頭脳は ほぼ必ず5分以内に正解（学習に使っていないお題でも）', () => {
  const test = DB.words.filter(w => w.id % 5 === 2).map(w => w.id);
  let ok = 0, q = 0, N = 60;
  for (let k = 0; k < N; k++) {
    const players = []; for (let i = 0; i < 5; i++) players.push({ kind: 'npc', ch: ['fuu', 'mimi', 'robo', 'nyaco', 'pochi'][i] });
    const G = L.newGame(DB, PW, { players, rng: B.rng(1300 + k), turbo: true, now: 0, lv: 'ultra', diff: 'all', secret: test[k % test.length] });
    let now = 0; while (G.phase !== 'end' && now < 60000) { now += 20; L.tick(G, now); }
    if (G.result.why !== 'none') ok++; q += G.qa.length;
  }
  console.log('    held-out words: solved', ok + '/' + N, 'avg questions', (q / N).toFixed(1));
  assert.ok(ok / N >= 0.9);
});
test('NPCの推理：あからさまな しってるっこ は 情報もれ が大きく、ほぼ見つかる', () => {
  let caught = 0, N = 40;
  for (let k = 0; k < N; k++) {
    const players = []; for (let i = 0; i < 5; i++) players.push({ kind: 'npc', ch: ['fuu', 'mimi', 'robo', 'nyaco', 'pochi'][i] });
    const G = L.newGame(DB, PW, { players, rng: B.rng(2000 + k), turbo: true, now: 0, lv: 'ultra', diff: 'all', roles: R5 });
    G.P[1] = Object.assign({}, G.P[1], { sig: 4, sigLate: 4, decoy: 0 });   // 露骨に誘導する しってるっこ
    let now = 0; while (G.phase !== 'end' && now < 60000) { now += 20; L.tick(G, now); }
    if (G.result.winner === 'commons') caught++;
  }
  console.log('    blatant insider caught', caught + '/' + N);
  assert.ok(caught / N >= 0.7);
});
test('チャット・質問の入力は 40文字・制御文字なしに整える', () => {
  assert.strictEqual(L.cleanText('<b>あ\u0001い</b>' + 'x'.repeat(80)).length, 40);
  assert.ok(!/[<>]/.test(L.cleanText('<script>')));
});

// ---------- おだいばんが 自信をもって まちがえない ----------
test('おだいばん：「ボールつかいますか？」（ドッジボール）は はい、書き方のゆれ「ドッチボール」は 正解', () => {
  const id = DB.byNorm[K.normL('ドッジボール')];
  ['ボールつかいますか？', 'ボールを使いますか？', 'ぼーるつかう？', 'ボールで遊ぶ？'].forEach(q => assert.strictEqual(K.answerParsed(DB, K.parse(DB, q), id), 'y', q));
  ['ドッチボール？', 'それはドッチボールですか？', 'どっぢぼーる'].forEach(q => assert.strictEqual(K.answerParsed(DB, K.parse(DB, q), id), 'correct', q));
});
test('おだいばん：自然な質問セット（1,300問以上）で 自信のある まちがいは 0.5% 以下', () => {
  const run = require('../tools/natcheck.js');
  ['natural_tune.txt', 'natural_holdout.txt', 'natural_holdout2.txt'].forEach(f => {
    const r = run(require('path').join(__dirname, f));
    assert.ok(r.wrongPct <= 0.5, f + ' wrong ' + r.wrongPct + '% ' + r.bad.filter(b => b[0] === 'X').slice(0, 5).join(' / '));
    assert.ok(r.unkPct <= 20, f + ' unk ' + r.unkPct + '%');
  });
});
