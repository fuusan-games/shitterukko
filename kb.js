/* しってるっこ：お題の「知識ベース」と質問の読み取り（ブラウザ／Node 共通・DOMなし）
 * ・属性（はい／いいえで答えられる質問）ごとに、どのお題が はい(1)／いいえ(0)／わからない(2) かを持つ
 * ・自由入力の質問は、言いかえ・否定・かな表記ゆれ を吸収して属性に読み替える（わからなければ「わからない」）
 */
(function (root) {
'use strict';
var K = {};
var PUNCT = /[\s、。，．,.!！?？「」『』（）()【】\[\]・…〜~ー－\-ｰ:：;；"'“”‘’]/g;
K.norm = function (s) {
  s = String(s == null ? '' : s);
  try { s = s.normalize('NFKC'); } catch (e) {}
  s = s.toLowerCase().replace(/[\u30a1-\u30f6]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  return s.replace(PUNCT, '');
};
// 「ー」を残す版（スープ≠スプーン のような判定用）
K.normL = function (s) {
  s = String(s == null ? '' : s);
  try { s = s.normalize('NFKC'); } catch (e) {}
  s = s.toLowerCase().replace(/[\u30a1-\u30f6]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  return s.replace(/[\s、。，．,.!！?？「」『』（）()【】\[\]・…〜~:：;；"'“”‘’]/g, '');
};
K.rng = function (seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// ---------- 属性（質問）の一覧 ----------
// id, グループ, 質問文（NPCがそのまま聞く・質問ボタンにも使う）, 既定値（タグがないときの答え 'n'|'u'）, 読み取りパターン（ひらがな化したテキストに当てる）
// パターンは上から順に試す（具体的なもの→一般的なもの）。'!' で始まるものは「この語の後ろに否定が来たら反転」しない
var A = [
  // --- しゅるい ---
  ['liv', 'kind', 'それは 生き物？', 'n', ['生き物', 'いきもの', '生物', '生命', 'せいめい', '生きて', 'いきて', '命がある', '呼吸', '息', 'いきして']],
  ['ani', 'kind', '動物？', 'n', ['!動物園', '動物', 'どうぶつ', 'あにまる', 'けもの', '獣', 'ほにゅう', '哺乳']],
  ['bird', 'kind', '鳥のなかま？', 'n', ['!焼き鳥', '!やきとり', '鳥', 'とりの', 'とりです', 'とり？', 'とりか']],
  ['fish', 'kind', '魚のなかま？', 'n', ['!金魚', '魚', 'さかな']],
  ['bug', 'kind', '虫？', 'n', ['!てんとう', '昆虫', 'こんちゅう', '虫', 'むし']],
  ['pla', 'kind', '植物？', 'n', ['植物', 'しょくぶつ', '草花', '草', '木の仲間', '花です', '花？', 'はなです', '花か', '花の']],
  ['person', 'kind', '人？', 'n', ['人間', 'にんげん', '人物', '人です', '人？', '人か', 'ひとです', 'ひと？', '人のこと', 'だれか', '誰か']],
  ['job', 'kind', '仕事・職業？', 'n', ['職業', 'しょくぎょう', '仕事', 'しごと', '働いて', 'はたらいて', '働く人', 'はたらくひと']],
  ['food', 'kind', '食べ物？', 'n', ['食べ物', 'たべもの', '食品', '食材', 'しょくざい', 'ごはんの', 'おかず']],
  ['edible', 'kind', '食べられる？', 'n', ['食べられ', 'たべられ', '食べれ', 'たべれ', '食える', 'くえる', '~食べる', '~たべる', '食べること', 'たべること', '口に入れられ', '食用']],
  ['drink', 'kind', '飲み物？', 'n', ['飲み物', 'のみもの', '飲め', 'のめ', '飲む', 'のむ', 'ドリンク', 'どりんく']],
  ['fruit', 'kind', '果物？', 'n', ['果物', 'くだもの', 'ふるーつ', '果実']],
  ['veg', 'kind', '野菜？', 'n', ['野菜', 'やさい', 'べじたぶる']],
  ['dish', 'kind', '料理？', 'n', ['料理', 'りょうり', 'めにゅー', '献立', 'こんだて']],
  ['sweets', 'kind', 'お菓子・デザート？', 'n', ['お菓子', 'おかし', 'すいーつ', 'でざーと', 'おやつ', '菓子']],
  ['meat', 'kind', 'お肉が入ってる・お肉？', 'n', ['!筋肉', '肉', 'にく']],
  ['veh', 'kind', '乗り物？', 'n', ['乗り物', 'のりもの', '乗れ', 'のれ', '乗る', 'のる', '乗って', 'のって']],
  ['made', 'kind', '人が作ったもの？', 'n', ['人が作', 'ひとがつく', '人工', 'じんこう', '作られ', 'つくられ', '作った', 'つくった', '工業', '製品', 'せいひん']],
  ['tool', 'kind', '道具？', 'n', ['道具', 'どうぐ', '~使うもの', '~つかうもの', '~使う物']],
  ['elec', 'kind', '電気で動く？', 'n', ['電気', 'でんき', '電池', 'でんち', '電源', 'こんせんと', '充電', 'じゅうでん', '電化', '家電', 'かでん', '機械', 'きかい', '電子', 'でんし']],
  ['place', 'kind', '場所？', 'n', ['場所', 'ばしょ', '~ところ', '所です', '~行ける', '~いける', '~行く', 'お出かけ', 'おでかけ', '~はいれる', 'すぽっと']],
  ['building', 'kind', '建物？', 'n', ['建物', 'たてもの', 'びる', '建って', 'たって', '施設', 'しせつ', '屋根']],
  ['sport', 'kind', 'スポーツ？', 'n', ['すぽーつ', '運動', 'うんどう', '競技', 'きょうぎ', '試合', 'しあい', '選手']],
  ['event', 'kind', '行事・イベント？', 'n', ['!夏祭', '行事', 'ぎょうじ', 'いべんと', '祭り', 'まつり', '記念日', 'きねんび', 'お祝い', 'おいわい', '祝日', 'しゅくじつ', '年中行事', '式']],
  ['nature', 'kind', '自然のもの（天気や景色）？', 'n', ['自然', 'しぜん', '天気', 'てんき', '気象', '天候', '景色', 'けしき', '現象']],
  // --- 大きさ・形・さわりごこち ---
  ['s1', 'size', '手のひらより大きい？', 'n', ['@size1']],
  ['s2', 'size', '人より大きい？', 'n', ['@size2']],
  ['s3', 'size', '家より大きい？', 'n', ['@size3']],
  ['carry', 'size', '手で持ち運べる？', 'u', ['持ち運', 'もちはこ', '持つもの', '手で持', 'てでもつ', '持てる', 'もてる', '持って', 'もって', '運べ', 'はこべ', 'ぽけっと', 'かばんに入']],
  ['heavy', 'size', '重い？', 'u', ['重い', 'おもい', '重た', 'おもた', '@light']],
  ['round', 'size', '丸い？', 'n', ['丸', 'まる', '球', 'たま', '円', 'えんけい', 'ぼーる状']],
  ['square', 'size', '四角い？', 'n', ['四角', 'しかく', '長方形', '正方形', '箱', 'はこがた', '角ばって']],
  ['long', 'size', '細長い？', 'n', ['細長', 'ほそなが', '長い', 'ながい', '細い', 'ほそい', '棒', 'ぼう']],
  ['soft', 'size', 'やわらかい？', 'u', ['柔らか', 'やわらか', '軟らか', 'ふわふわ', 'ふかふか', 'ぷにぷに', 'もちもち', 'ふにゃ']],
  ['hard', 'size', 'かたい？', 'u', ['硬い', '固い', '堅い', 'かたい', 'かちかち', 'こちこち']],
  // --- 色 ---
  ['red', 'color', '赤い？', 'c', ['赤', 'あか', 'れっど']],
  ['white', 'color', '白い？', 'c', ['!面白', '!おもしろ', '白', 'しろい', 'しろ色', 'しろです', 'ほわいと']],
  ['black', 'color', '黒い？', 'c', ['黒', 'くろ', 'ぶらっく']],
  ['yellow', 'color', '黄色い？', 'c', ['黄色', 'きいろ', '黄', 'いえろー', '金色', 'きんいろ']],
  ['green', 'color', '緑色？', 'c', ['緑', 'みどり', 'ぐりーん']],
  ['blue', 'color', '青い？', 'c', ['青', 'あお', '水色', 'みずいろ', 'ぶるー']],
  ['brown', 'color', '茶色い？', 'c', ['茶色', 'ちゃいろ', 'ぶらうん']],
  ['pink', 'color', 'ピンク色？', 'c', ['ぴんく', '桃色', 'ももいろ']],
  ['orange', 'color', 'オレンジ色？', 'c', ['おれんじ色', 'おれんじいろ', '橙', 'だいだい']],
  ['purple', 'color', '紫色？', 'c', ['紫', 'むらさき', 'ぱーぷる']],
  ['gray', 'color', '灰色・グレー？', 'c', ['灰色', 'はいいろ', 'ぐれー', 'ねずみ色', 'ねずみいろ']],
  // --- どこにある？ ---
  ['home', 'where', '家にある？', 'n', ['家の中', 'いえのなか', '家に', 'いえに', '家で', 'いえで', 'うちに', '家庭', 'かてい', '部屋', 'へや', '家にい']],
  ['kitchen', 'where', '台所にある？', 'n', ['台所', 'だいどころ', 'きっちん', '料理に使', '調理']],
  ['bath', 'where', 'お風呂や洗面所にある？', 'n', ['風呂', 'ふろ', '洗面', 'せんめん', 'といれ', 'ばす']],
  ['school', 'where', '学校にある？', 'n', ['学校', 'がっこう', '教室', 'きょうしつ', '授業', 'じゅぎょう', '勉強', 'べんきょう']],
  ['sea', 'where', '海にある・いる？', 'n', ['!海外', '!海老', '海', 'うみ', '浜', 'はま', 'びーち']],
  ['sky', 'where', '空にある？', 'n', ['空', 'そら', '上空', '宇宙', 'うちゅう', '天']],
  ['mount', 'where', '山や森にある・いる？', 'n', ['山', 'やま', '森', 'もり', '林', 'はやし']],
  ['outside', 'where', '外にある・いる？', 'n', ['!外国', '外', 'そと', '屋外', 'おくがい', '野外', '外で見', 'そとで']],
  ['store', 'where', 'お店で買える？', 'n', ['お店', 'おみせ', '店', 'みせ', '買え', '買う', '売って', 'うって', '売られ', 'すーぱー', 'こんびに', '値段', 'ねだん']],
  ['city', 'where', '町にある・いる？', 'u', ['町', 'まち', '街', '都会', 'とかい', '都市']],
  ['farm', 'where', '畑や牧場にある・いる？', 'n', ['畑', 'はたけ', '田んぼ', 'たんぼ', '農', 'のう', '牧場', 'ぼくじょう', 'ふぁーむ']],
  ['zoo', 'where', '動物園や水族館にいる？', 'n', ['動物園', 'どうぶつえん', '水族館', 'すいぞくかん']],
  ['japan', 'where', '日本らしいもの（和風）？', 'u', ['日本', 'にほん', 'にっぽん', '和風', 'わふう', '和食', 'わしょく', '和の']],
  ['foreign', 'where', '外国から来たもの？', 'u', ['外国', 'がいこく', '海外', 'かいがい', '西洋', 'せいよう', 'あめりか', '洋風', '洋食']],
  // --- とくちょう ---
  ['move', 'feat', '動く？', 'n', ['動く', 'うごく', '動き', 'うごき', '動け', 'うごけ', '動いて', 'うごいて', '動か', 'うごか', '走', 'はしる']],
  ['legs', 'feat', '足がある？', 'n', ['足', 'あし', '脚']],
  ['fur', 'feat', '毛が生えてる？', 'n', ['毛', 'け が', 'けがは', 'ふさふさ', 'もふもふ']],
  ['fly', 'feat', '空を飛ぶ？', 'n', ['空を飛', 'そらをと', '空飛', 'そらと', '飛', 'とぶ', 'とべ', 'とんで', '羽', 'はね', '翼', 'つばさ']],
  ['swim', 'feat', '水の中を泳ぐ？', 'n', ['泳', 'およ', '水中', 'すいちゅう', '水の中', 'みずのなか', '潜', 'もぐ']],
  ['light', 'feat', '光る？', 'n', ['光', 'ひか', '明る', 'あかる', 'らいと', '照ら', 'てら', '輝', 'かがや']],
  ['sound', 'feat', '音が出る？', 'n', ['音', 'おと', '鳴', 'なる？', 'なきごえ', 'うるさ', '声', 'こえ', 'しゃべ']],
  ['hot', 'feat', '熱い・あたたかい？', 'n', ['熱い', 'あつい', '暑い', '温か', '暖か', 'あたたか', 'あったか', 'ほかほか', 'ほっと']],
  ['cold', 'feat', '冷たい？', 'n', ['冷た', 'つめた', '冷え', 'ひえ', '寒い', 'さむい', '凍', 'こお', 'ひんやり']],
  ['sweet', 'feat', '甘い？', 'n', ['甘', 'あまい', 'あまく', 'すいーと']],
  ['spicy', 'feat', '辛い？', 'n', ['辛', 'からい', 'からく', 'ぴりぴり', 'すぱいしー']],
  ['sour', 'feat', 'すっぱい？', 'n', ['すっぱ', '酸っぱ', '酸味']],
  ['water', 'feat', '水に関係ある？', 'n', ['水', 'みず', '濡れ', 'ぬれ', '液体', 'えきたい', 'ぬれる']],
  ['fire', 'feat', '火に関係ある？', 'n', ['!火曜', '火', 'ほのお', '炎', '燃', 'もえ', '焼']],
  ['wood', 'feat', '木でできてる？', 'n', ['木製', 'もくせい', '木で', 'きで', '木の', '木から', '木', '木材']],
  ['metal', 'feat', '金属でできてる？', 'n', ['金属', 'きんぞく', '鉄', 'てつで', 'めたる', 'すてんれす', 'あるみ']],
  ['paper', 'feat', '紙でできてる？', 'n', ['紙', 'ぺーぱー']],
  ['cloth', 'feat', '布でできてる？', 'n', ['布', 'ぬの', '生地', 'きじ', '繊維', '毛糸', 'けいと']],
  ['glass', 'feat', 'ガラスでできてる？', 'n', ['がらす']],
  ['wear', 'feat', '身につけるもの？', 'n', ['身につけ', 'みにつけ', '着る', '着られ', '着て', '着もの', '服', 'ふく', 'ふぁっしょん']],
  ['write', 'feat', '字を書くのに関係ある？', 'n', ['書く', '書け', 'かくもの', '字', '文字', 'もじ']],
  ['play', 'feat', '遊ぶもの？', 'n', ['遊', 'あそ', 'おもちゃ', '玩具', 'げーむ']],
  ['kids', 'feat', '子どもが好き？', 'u', ['子ども', '子供', 'こども', 'きっず', '小学生', '幼児']],
  ['music', 'feat', '音楽に関係ある？', 'n', ['音楽', 'おんがく', '楽器', 'がっき', '演奏', 'えんそう', '歌', 'うた', 'りずむ', 'めろでぃ']],
  ['danger', 'feat', '危ない？', 'n', ['危な', '危険', 'あぶな', 'きけん', 'こわい', '怖い', '怪我', '痛い', 'いたい', '毒', 'どく']],
  ['wheels', 'feat', 'タイヤや車輪がある？', 'n', ['たいや', '車輪', 'しゃりん']],
  // --- もっとくわしく ---
  ['pet', 'feat', 'ペットとして飼える？', 'n', ['ぺっと', '飼', 'かえる？', 'かえますか', 'かう？']],
  ['tail', 'feat', 'しっぽがある？', 'n', ['しっぽ', '尻尾', 'しっぽ']],
  ['horn', 'feat', '角（つの）がある？', 'n', ['角が', 'つの', '角は', '角あ']],
  ['stripe', 'feat', 'しま模様？', 'n', ['しま模様', 'しましま', 'しまもよう', 'ぼーだー', 'すとらいぷ', '縞']],
  ['carn', 'feat', 'ほかの動物を食べる（肉食）？', 'n', ['肉食', 'にくしょく', 'ほかの動物を食べ', '動物を食べ', '獲物', 'えもの']],
  ['tall', 'size', '背が高い・高さがある？', 'n', ['背が高', 'せがたか', '高さ', 'たかさ', 'のっぽ', '高い建', '高くそび', '見上げ', 'みあげ']],
  ['ball', 'feat', 'ボールを使う？', 'n', ['ぼーるを', 'ぼーるで', 'ぼーる使', '球技', 'きゅうぎ']],
  ['team', 'feat', 'チームでやる？', 'n', ['ちーむ', '団体', 'だんたい', '何人かで', 'みんなで']],
  ['racket', 'feat', 'ラケットを使う？', 'n', ['らけっと']],
  ['kick', 'feat', '足でける？', 'n', ['蹴', '足でける', 'あしでける', 'けるの', 'きっく']],
  ['hand', 'feat', '手を使う？', 'n', ['手を使', 'てをつか', '手で使', '手でにぎ', '握', 'にぎ']],
  ['throw', 'feat', '投げる？', 'n', ['投げ', 'なげ']],
  ['net', 'feat', 'ネットや網を使う？', 'n', ['ねっと', '網', 'あみ']],
  ['fight', 'feat', '相手と戦う・対戦する？', 'n', ['戦', 'たたか', '対戦', 'たいせん', 'ばとる', '勝負', 'しょうぶ', 'けんか']],
  ['snow', 'feat', '雪に関係ある？', 'n', ['雪', 'ゆき', 'すのー']],
  ['head', 'feat', '頭や顔につける？', 'n', ['頭に', 'あたまに', '頭の', '顔に', 'かおに', 'かぶる', '目に', '耳に', '首に', 'くびに']],
  ['feet', 'feat', '足にはく・つける？', 'n', ['足には', '足につけ', 'あしにつけ', 'あしには', '履く', 'はく？', 'はくもの', '足元']],
  ['contain', 'feat', '中に物を入れる？', 'n', ['入れ物', 'いれもの', '~入れる', '~いれる', '容器', 'ようき', '中に物', 'しまう', '収納']],
  ['number', 'feat', '数字が書いてある？', 'n', ['数字', 'すうじ', '数', 'かず', 'ばんごう', '番号']],
  ['read', 'feat', '読むもの？', 'n', ['読', 'よむ', 'よめ', 'よんで']],
  ['rice', 'feat', 'お米からできてる？', 'n', ['お米', 'おこめ', '米', 'こめ', 'ごはんで']],
  ['noodle', 'feat', 'めん類？', 'n', ['麺', 'めん', 'ぬーどる', 'すする', 'ずるずる']],
  ['bread', 'feat', 'パンや小麦粉を使う？', 'n', ['小麦', 'こむぎ', 'ぱんを', 'ぱんで', 'ぱんに']],
  ['spoon', 'feat', 'スプーンで食べる？', 'n', ['すぷーんで', 'すぷーんを']],
  ['chop', 'feat', 'おはしで食べる？', 'n', ['お箸で', '箸で', 'はしで', 'おはしで']],
  ['handeat', 'feat', '手で持って食べる？', 'n', ['手で持って食べ', '手で食べ', 'てでたべ', '手づかみ', 'かぶりつ']],
  ['root', 'feat', '土の中で育つ？', 'n', ['土の中', 'つちのなか', '地面の下', '地下', '根っこ', '根', '土から', '掘']],
  ['leaf', 'feat', '葉っぱ？', 'n', ['葉', 'はっぱ', 'りーふ']],
  ['bitter', 'feat', '苦い？', 'n', ['苦', 'にがい', 'にがく', 'びたー']],
  ['work', 'feat', '仕事で使う？', 'n', ['仕事で使', '仕事に使', 'しごとでつか', 'しごとにつか', '働く車', '業務', '作業', 'さぎょう']],
  ['hospital', 'where', '病院にある・いる？', 'n', ['病院', 'びょういん', '病気', 'びょうき', 'けが', '治', 'なお']],
  ['mouth', 'feat', '口に関係ある？', 'n', ['口', 'くち', '歯', 'くちに', '口に入れて使']],
  ['money', 'feat', 'お金に関係ある？', 'n', ['お金', 'おかね', '金額', 'お年玉', 'おとしだま', 'お小遣い']],
  ['sleep', 'feat', '寝るときに使う？', 'n', ['寝', 'ねる', 'ねむ', '眠', 'すいみん', '睡眠']],
  ['clean', 'feat', 'そうじや洗うのに使う？', 'n', ['掃除', 'そうじ', '洗', 'あらう', 'きれいに', 'せいけつ']],
  ['cut', 'feat', '物を切る？', 'n', ['切る', 'きる？', '切れる', 'きれる', 'カット', 'かっと']],
  ['eatuse', 'feat', '食べるときに使う？', 'n', ['食べるときに使', '食事に使', '食事で使', '食事のときに使', '食事の時に使', 'しょくじのときに', '食器', 'しょっき', 'たべるときにつか']],
  ['hair', 'feat', '髪の毛に関係ある？', 'n', ['髪', 'かみのけ', 'へあ']],
  ['cute', 'feat', 'かわいい？', 'u', ['かわい', '可愛', 'きゅーと']],
  // --- いつ？ ---
  ['spring', 'season', '春に関係ある？', 'n', ['春', 'はる']],
  ['summer', 'season', '夏に関係ある？', 'n', ['夏', 'なつ']],
  ['autumn', 'season', '秋に関係ある？', 'n', ['秋', 'あき']],
  ['winter', 'season', '冬に関係ある？', 'n', ['冬', 'ふゆ']],
  ['night', 'season', '夜に関係ある？', 'n', ['夜', 'よる', '夜中', '夜行', '暗', 'くらい']]
];
K.ATTRS = A.map(function (a, i) { return { i: i, id: a[0], g: a[1], q: a[2], def: a[3], pats: a[4] }; });
K.AI = {}; K.ATTRS.forEach(function (a) { K.AI[a.id] = a.i; });
K.NA = K.ATTRS.length;
K.GROUPS = [['kind', 'しゅるい'], ['size', '大きさ・形'], ['where', 'どこ'], ['feat', 'とくちょう'], ['color', '色'], ['season', 'いつ']];

// ---------- 知識ベースを組み立てる ----------
// data = { cat: { name, base:'tag tag', items:'名前/別名 大きさ 難易度 タグ…\n…' } }
// タグ：'x'＝はい、'-x'＝いいえ、'?x'＝わからない。大きさ：1=手のひら以下 2=人くらいまで 3=家くらいまで 4=家より大きい 0=形がない
var CAT_DERIVE = {   // カテゴリから自動で決まる答え
  food: { food: 1, edible: 1, made: 2, store: 1 },
  drink: { drink: 1, made: 2, store: 1, water: 1, edible: 0 },
  obj: { made: 1 }, place: { place: 1, carry: 0 }, abs: { carry: 2 }
};
K.build = function (data) {
  var db = { words: [], cats: {}, byNorm: {}, dropped: [] };
  Object.keys(data).forEach(function (ck) {
    var C = data[ck]; db.cats[ck] = { id: ck, name: C.name, words: [] };
    C.items.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (line) {
      var tok = line.split(/\s+/), names = tok[0].split('/'), size = +tok[1], diff = tok[2], tags = (C.base + ' ' + tok.slice(3).join(' ')).split(/\s+/).filter(Boolean);
      var v = new Int8Array(K.NA); for (var i = 0; i < K.NA; i++) v[i] = -1;   // -1 = 未設定
      var set = function (id, val) { var ai = K.AI[id]; if (ai == null) { db.dropped.push({ w: names[0], why: 'unknown tag ' + id }); return; } v[ai] = val; };
      // 大きさ
      if (size === 0) { set('s1', 2); set('s2', 2); set('s3', 2); }
      else { set('s1', size >= 2 ? 1 : 0); set('s2', size >= 3 ? 1 : 0); set('s3', size >= 4 ? 1 : 0); set('carry', size === 1 ? 1 : size === 2 ? 2 : 0); if (size >= 3) set('heavy', 1); if (size === 1) set('heavy', 0); }
      var kind = C.kind || ''; var dv = CAT_DERIVE[kind]; if (dv) Object.keys(dv).forEach(function (k) { set(k, dv[k]); });
      tags.forEach(function (t) { var val = 1; if (/\?$/.test(t)) { t = '?' + t.replace(/^[-?]/, '').slice(0, -1); } if (t[0] === '-') { val = 0; t = t.slice(1); } else if (t[0] === '?') { val = 2; t = t.slice(1); } set(t, val); });
      // 色：ひとつでも色タグがあれば ほかの色は「いいえ」、なければ全部「わからない」
      var hasCol = K.ATTRS.some(function (a) { return a.def === 'c' && v[a.i] === 1; });
      // 既定値
      K.ATTRS.forEach(function (a) { if (v[a.i] !== -1) return; v[a.i] = a.def === 'c' ? (hasCol ? 0 : 2) : a.def === 'u' ? 2 : 0; });
      // 筋の通らない組み合わせを直す
      if (v[K.AI.ani] === 1) v[K.AI.liv] = 1;
      if (v[K.AI.person] === 1) v[K.AI.liv] = 1;
      if (v[K.AI.fruit] === 1 || v[K.AI.veg] === 1 || v[K.AI.dish] === 1 || v[K.AI.sweets] === 1) { v[K.AI.food] = 1; v[K.AI.edible] = 1; }
      if (v[K.AI.food] === 1) v[K.AI.edible] = 1;
      // 反対の特ちょう（やわらかい⇔かたい、和風⇔外国から）と、乗り物・電化製品は やわらかくない
      if (v[K.AI.soft] === 1 && v[K.AI.hard] === 2) v[K.AI.hard] = 0;
      if (v[K.AI.hard] === 1 && v[K.AI.soft] === 2) v[K.AI.soft] = 0;
      if (v[K.AI.japan] === 1 && v[K.AI.foreign] === 2) v[K.AI.foreign] = 0;
      if (v[K.AI.foreign] === 1 && v[K.AI.japan] === 2) v[K.AI.japan] = 0;
      if ((v[K.AI.veh] === 1 || v[K.AI.elec] === 1) && v[K.AI.soft] === 2) v[K.AI.soft] = 0;
      var w = { id: db.words.length, w: names[0], al: names, n: names.map(K.normL), cat: ck, catName: C.name, size: size, diff: diff, v: v };
      var clash = w.n.filter(function (x) { return db.byNorm[x] != null; });
      if (clash.length) { db.dropped.push({ w: names[0], why: 'name clash ' + clash.join(',') + ' with ' + db.words[db.byNorm[clash[0]]].w }); return; }
      w.n.forEach(function (x) { db.byNorm[x] = w.id; });
      db.words.push(w); db.cats[ck].words.push(w.id);
    });
  });
  db.N = db.words.length;
  return db;
};
K.ans = function (db, wid, ai) { return db.words[wid].v[ai]; };   // 1/0/2
K.ANS_TXT = { y: 'はい', n: 'いいえ', u: 'わからない' };
K.code = function (x) { return x === 1 ? 'y' : x === 0 ? 'n' : 'u'; };

// ---------- 自由入力の質問を読む ----------
// 戻り値：{ t:'attr', a:属性番号, neg:否定？ } | { t:'guess', w:単語id or -1, text:答えの部分 } | { t:'none' }
var PFX = /^(ねえ|ねぇ|えっと|えーと|じゃあ|では|それって|それは|それ|あれは|おだいは|お題は|こたえは|答えは|もしかして|ひょっとして|たぶん|ずばり|ズバリ|すばり|ますたー|まずは|つぎに|次に)+/;
var SFX = /(なんですか|なのですか|でしょうか|なんでしょうか|ですか|ですかね|なの|なのか|ですね|でしょ|じゃない|かな|かね|だよね|ですよね|か|だ|です|だよ|で合ってる|であってる)*$/;
function negAfter(t, end) {   // 一致した語の すぐ後ろが 否定 か
  var rest = t.slice(end, end + 9);
  return /^(.{0,4}?)(じゃない|じゃなく|ではない|ではなく|ない|なく|ません|ず[？?]?$|ぬ)/.test(rest) && !/^(.{0,2})(ないぞう|ないふ)/.test(rest);
}
function sizeRule(t) {   // 大きさの言い回し → s1/s2/s3
  var big = /(大き|おおき|でか|でっか|長身)/, small = /(小さ|ちいさ|ちっちゃ|ちっさ|ミニ|みに)/;
  var refs = [[/(手のひら|てのひら|手|りんご|こぶし|すまほ)/, 's1'], [/(人間|にんげん|ひと|人|大人|おとな|自分|わたし|ぼく)/, 's2'], [/(家|いえ|建物|たてもの|ビル|びる|車|くるま)/, 's3']];
  var hasBig = big.test(t), hasSmall = small.test(t);
  if (!hasBig && !hasSmall) return null;
  for (var i = 0; i < refs.length; i++) {
    var m = t.match(new RegExp(refs[i][0].source + '.{0,4}?(より|よりも|よか|と比べて|とくらべて|くらい|ぐらい)'));
    if (m) return { a: K.AI[refs[i][1]], neg: hasSmall && !hasBig };
  }
  if (/両手|りょうて|抱え|かかえ/.test(t)) return { a: K.AI.s1, neg: hasSmall };
  if (hasBig) return { a: K.AI.s2, neg: false, loose: true };   // ただ「大きい？」→ 人より大きいか で答える
  return { a: K.AI.s1, neg: true, loose: true };                 // ただ「小さい？」→ 手のひら以下か
}
var COMPILED = null;
function compile() {
  if (COMPILED) return COMPILED;
  COMPILED = [];
  K.ATTRS.forEach(function (a) {
    a.pats.forEach(function (p) {
      if (p[0] === '@') { COMPILED.push({ a: a.i, special: p.slice(1) }); return; }
      var stop = p[0] === '!', gen = p[0] === '~'; if (stop || gen) p = p.slice(1);
      COMPILED.push({ a: a.i, s: K.normL(p), stop: stop, gen: gen, len: p.length });
    });
  });
  return COMPILED;
}
// 単語さがし（お題の名前が文中にあるか）
var TAILOK = /^(じゃない|じゃないの|かな|でしょ|だよね|のこと|かも|っぽい|でしょう|ですかね|なの|では)?$/;
function findWord(db, core) {   // 「それは○○？」の○○が お題の名前で始まり、あとは語尾だけ
  var best = -1, bl = 0;
  for (var i = 0; i < db.N; i++) { var ns = db.words[i].n; for (var j = 0; j < ns.length; j++) { var x = ns[j]; if (x.length >= 1 && x.length > bl && core.indexOf(x) === 0 && TAILOK.test(core.slice(x.length))) { best = i; bl = x.length; } } }
  return { id: best, len: bl };
}
var EXACT = { 'ける': 'kick', 'とぶ': 'fly', 'なく': 'sound', 'うごく': 'move', 'ひかる': 'light', 'およぐ': 'swim', 'でかい': 's2', 'ちいさい': 's1' };
var NONQ = /^(うーん|うーむ|うん|ええ|へえ|へー|なるほど|こんにちは|こんばんは|おはよう|ありがとう|よろしく|はい|いいえ|ok|おっけー|わかった|すごい|やった|w+|笑)+$/;
var SFXL = ['なんでしょうか', 'でしょうか', 'なんですか', 'なのですか', 'ですかね', 'ですよね', 'であってる', 'で合ってる', 'ですか', 'ですね', 'なのか', 'じゃない', 'だよね', 'でしょ', 'だよ', 'です', 'なの', 'かな', 'かね', 'か', 'だ', 'ね'];
K.stripGuess = function (text, db) {   // db を渡すと、語尾を1つずつ外しながら お題の名前に一致するところで止める
  var t = K.normL(text).replace(PFX, ''), guard = 0;
  if (db && db.byNorm[t] != null) return t;
  while (guard++ < 4) {
    var hit = false;
    for (var i = 0; i < SFXL.length; i++) { var x = K.normL(SFXL[i]); if (t.length > x.length && t.slice(-x.length) === x) { t = t.slice(0, -x.length); hit = true; break; } }
    if (!hit) break;
    if (db && db.byNorm[t] != null) return t;
  }
  return t;
};
// 送りがなの まざった書き方（食べもの・乗りもの・生きもの・飲みもの…）を 漢字の「物」にそろえる
K.okuri = function (s) { return String(s).replace(/([\u4e00-\u9fff][\u3041-\u3093])もの/g, '$1物').replace(/([\u4e00-\u9fff])もの/g, '$1物'); };
K.parse = function (db, text) {
  var raw = K.okuri(String(text || '')), t = K.normL(raw);
  if (!t) return { t: 'none' };
  // ①「それは○○ですか？」型（○○がお題の名前と完全一致）
  var core = K.stripGuess(raw, db);
  if (core && db.byNorm[core] != null) return { t: 'guess', w: db.byNorm[core], text: core };
  // ② 属性
  var C = compile(), hits = [];
  if (NONQ.test(t)) return { t: 'none' };
  if (EXACT[t]) return { t: 'attr', a: K.AI[EXACT[t]], neg: false };
  var sz = sizeRule(t); if (sz) hits.push({ a: sz.a, neg: sz.neg, pos: 0, len: 3, loose: sz.loose, size: true });
  var blocked = [];
  C.forEach(function (c) { if (c.stop) { var j = t.indexOf(c.s); while (j >= 0) { blocked.push([j, j + c.s.length]); j = t.indexOf(c.s, j + 1); } } });   // stop語（例：「動物園」）が当たった範囲は、ほかの短い語（「動物」）に使わせない
  C.forEach(function (c) {
    if (c.special) {
      if (c.special === 'light' && /(軽い|かるい|軽た)/.test(t)) hits.push({ a: c.a, neg: !/(軽くない|かるくない)/.test(t), pos: 0, len: 2 });
      return;
    }
    var idx = t.indexOf(c.s); if (idx < 0) return;
    for (var b = 0; b < blocked.length; b++) if (idx >= blocked[b][0] && idx < blocked[b][1] && idx + c.s.length - idx < blocked[b][1] - blocked[b][0]) return;
    if (c.stop) { blocked.push([idx, idx + c.s.length]); return; }
    hits.push({ a: c.a, neg: negAfter(t, idx + c.s.length), pos: idx, len: c.s.length, gen: c.gen });
  });
  // 「食べられる」と「食べ物」→ どちらもあれば「食べ物」を優先 などは、長い一致・先に書かれた方を優先
  hits = hits.filter(function (h) { return h.len >= 1; });
  var wd = findWord(db, core);
  if (hits.length) {
    hits.sort(function (x, y) { if (!!x.gen !== !!y.gen) return x.gen ? 1 : -1; var xk = K.ATTRS[x.a].g === 'kind', yk = K.ATTRS[y.a].g === 'kind'; if (xk !== yk && !x.size && !y.size) { if (xk && y.pos < x.pos) return 1; if (yk && x.pos < y.pos) return -1; } if (!!x.size !== !!y.size) return x.size ? -1 : 1; return y.len - x.len || x.pos - y.pos; });
    var h = hits[0];
    if (wd.id >= 0 && !h.size) return { t: 'guess', w: wd.id, text: db.words[wd.id].w };
    return { t: 'attr', a: h.a, neg: h.neg, loose: !!h.loose };
  }
  if (wd.id >= 0) return { t: 'guess', w: wd.id, text: db.words[wd.id].w };
  // ③ 短い名詞だけ（「たいやき？」）→ 辞書にない答え
  if (core.length >= 1 && core.length <= 10 && !/[をにがでへとはも]/.test(core.slice(1))) return { t: 'guess', w: -1, text: core };
  return { t: 'none' };
};
// 質問への答え（知識ベースどおり）。p = parse の結果。secret = お題の id
K.answerParsed = function (db, p, secret) {
  if (p.t === 'guess') { if (p.w === secret) return 'correct'; if (p.w < 0 && K.isAnswer(db, p.text, secret)) return 'correct'; return 'n'; }
  if (p.t !== 'attr') return 'u';
  var x = db.words[secret].v[p.a]; if (x === 2) return 'u';
  var yes = x === 1; if (p.neg) yes = !yes; return yes ? 'y' : 'n';
};
K.isAnswer = function (db, text, secret) {
  var t = K.stripGuess(text, db), w = db.words[secret]; if (!t) return false;
  return w.n.indexOf(t) >= 0 || w.n.indexOf(K.normL(text)) >= 0;
};
// NPC が口にする質問文（同じ属性でも言い回しを少し変える）
K.PHRASES = {
  liv: ['それって 生き物？', '生きてるもの？'], ani: ['動物？', '動物のなかま？'], pla: ['植物？', '植物のなかま？'], person: ['人のこと？', '人間？'],
  food: ['食べ物？', 'それって 食べ物？'], edible: ['食べられる？', 'それ、食べられる？'], drink: ['飲み物？', '飲めるもの？'], veh: ['乗り物？', '人が乗れるもの？'],
  made: ['人が作ったもの？', '人工のもの？'], tool: ['道具？', '何かに使う道具？'], elec: ['電気で動く？', '電気を使う？'], place: ['場所？', '行ける場所？'], building: ['建物？'],
  s1: ['手のひらより大きい？', '片手で持てるより大きい？'], s2: ['人より大きい？', '大人より大きい？'], s3: ['家より大きい？'],
  home: ['家にある？', 'ふつうの家にある？'], store: ['お店で買える？', '売ってる？'], outside: ['外にある？', '外で見かける？'], kitchen: ['台所にある？', 'キッチンで使う？']
};
K.phrase = function (ai, r) { var a = K.ATTRS[ai], ph = K.PHRASES[a.id]; if (ph && r) return ph[Math.floor(r() * ph.length)]; return a.q; };
if (typeof module !== 'undefined' && module.exports) module.exports = K; else root.SKB = K;
})(this);
