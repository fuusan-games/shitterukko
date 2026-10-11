// 「関係することば」と特ちょうの既定値の矛盾を、データの直し案にする（人が確認してから tools/tagfix.py で反映）
// 方針：お題の行で はっきり書いた値は変えない。既定（カテゴリ・全体の既定）の「いいえ」だけを
//   性質の特ちょう（色・季節・形・音・お金）なら「はい」、それ以外は「わからない」に。しゅるい・場所の「〜？」(それ自体か) は変えない
const C = require('./load.js')(); const K = C.SKB, DB = K.build(C.SK_TOPICS);
const fs = require('fs'), path = require('path');
const IDENT = new Set(K.ATTRS.filter(a => a.g === 'kind').map(a => a.id).concat(['s1', 's2', 's3', 'tall', 'fur', 'legs', 'liv']));
const PROP = new Set(['red', 'white', 'black', 'yellow', 'green', 'blue', 'brown', 'pink', 'orange', 'purple', 'gray', 'spring', 'summer', 'autumn', 'winter', 'round', 'square', 'heavy', 'sound', 'money', 'night']);
// お題の行に はっきり書いたタグ
const expl = {};
['topics1.js', 'topics2.js', 'topics3.js'].forEach(f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8').split('\n').forEach(l => {
  const t = l.trim().split(/\s+/); if (t.length < 3 || !/^[0-4]$/.test(t[1])) return;
  expl[t[0].split('/')[0]] = new Set(t.slice(3).map(x => x.replace(/^[-?]/, '').replace(/\?$/, '')));
}));
const fix = {}, kept = [];
DB.words.forEach(w => (w.facts || []).forEach(alts => {
  if (alts.neg) return;
  const p = K.parse(DB, alts[0] + '？'); if (p.t !== 'attr' || (p.also && p.also.length) || p.neg) return;
  const id = K.ATTRS[p.a].id; if (IDENT.has(id) || w.v[p.a] !== 0) return;
  if (expl[w.w] && expl[w.w].has(id)) { kept.push(w.w + ':' + id + '(' + alts[0] + ')'); return; }
  const tag = PROP.has(id) ? id : '?' + id;
  fix[w.w] = ((fix[w.w] || '') + ' ' + tag).trim();
}));
console.log(JSON.stringify(fix));
console.error('はっきり書いた「いいえ」と ことばが食い違う（そのまま）:', kept.join(' '));
