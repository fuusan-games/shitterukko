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
  ['liv', 'kind', 'それは 生き物？', 'n', ['生き物', 'いきもの', '生物', '生命体', '生命', 'せいめい', '生きて', 'いきて', '命がある', '呼吸', '息', 'いきして']],
  ['ani', 'kind', '動物？', 'n', ['!動物園', '動物', 'どうぶつ', 'あにまる', 'けもの', '獣', 'ほにゅう', '哺乳']],
  ['bird', 'kind', '鳥のなかま？', 'n', ['!焼き鳥', '!やきとり', '!鳥居', '!とりい', '!鶏肉', '鳥', 'とりの', 'とりです', 'とり？', 'とりか']],
  ['fish', 'kind', '魚のなかま？', 'n', ['!金魚', '魚', 'さかな']],
  ['bug', 'kind', '虫？', 'n', ['!てんとう', '昆虫', 'こんちゅう', '虫', 'むし']],
  ['pla', 'kind', '植物？', 'n', ['植物', 'しょくぶつ', '草花', '草', '木の仲間', '花です', '花？', 'はなです', '花か', '花の']],
  ['person', 'kind', '人？', 'n', ['!人の形', '!人形', '!人が', '人間', 'にんげん', '人物', '人です', '人？', '人か', 'ひとです', 'ひと？', '人のこと']],
  ['job', 'kind', '仕事・職業？', 'n', ['職業', 'しょくぎょう', '仕事', 'しごと', '働いて', 'はたらいて', '働く人', 'はたらくひと']],
  ['food', 'kind', '食べ物？', 'n', ['食べ物', 'たべもの', '食品', '食材', 'しょくざい', 'ごはんの', 'おかず']],
  ['edible', 'kind', '食べられる？', 'n', ['食べられ', 'たべられ', '食べれ', 'たべれ', '食える', 'くえる', '食べるもの', '食べる物', '食べること', 'たべること', '口に入れられ', '食用']],
  ['drink', 'kind', '飲み物？', 'n', ['飲み物', 'のみもの', '飲める', 'のめる', '飲めま', 'のめま', '飲むもの', 'どりんく']],
  ['fruit', 'kind', '果物？', 'n', ['果物', 'くだもの', 'ふるーつ', '果実']],
  ['veg', 'kind', '野菜？', 'n', ['野菜', 'やさい', 'べじたぶる']],
  ['dish', 'kind', '料理？', 'n', ['料理', 'りょうり', 'めにゅー', '献立', 'こんだて']],
  ['sweets', 'kind', 'お菓子・デザート？', 'n', ['お菓子', 'おかし', 'すいーつ', 'でざーと', 'おやつ', '菓子']],
  ['meat', 'kind', 'お肉が入ってる・お肉？', 'n', ['!筋肉', '肉', 'にく']],
  ['veh', 'kind', '乗り物？', 'n', ['乗り物', 'のりもの', '人が乗', 'ひとがの', '乗れる', 'のれる', '乗れま', 'のれま']],
  ['made', 'kind', '人が作ったもの？', 'n', ['人が作', 'ひとがつく', '人工', 'じんこう', '作られ', 'つくられ', '作った', 'つくった', '工業', '製品', 'せいひん']],
  ['tool', 'kind', '道具？', 'n', ['道具', 'どうぐ', '~使うもの', '~つかうもの', '~使う物']],
  ['elec', 'kind', '電気で動く？', 'n', ['電気で動', 'でんきでうご', '電気', 'でんき', '電池', 'でんち', '電源', 'こんせんと', '充電', 'じゅうでん', '電化', '家電', 'かでん', '機械', 'きかい', '電子', 'でんし']],
  ['place', 'kind', '場所？', 'n', ['場所', 'ばしょ', '~ところ', '~行ける', '~いける', '~行く', 'お出かけ', 'おでかけ', '~はいれる', 'すぽっと']],
  ['building', 'kind', '建物？', 'n', ['建物', 'たてもの', 'びるです', '建って', '施設', 'しせつ', '屋根']],
  ['sport', 'kind', 'スポーツ？', 'n', ['すぽーつ', '運動', 'うんどう', '競技', 'きょうぎ', '試合', 'しあい', '選手']],
  ['event', 'kind', '行事・イベント？', 'n', ['!夏祭', '行事', 'ぎょうじ', 'いべんと', '祭り', 'まつり', '記念日', 'きねんび', 'お祝い', 'おいわい', '祝日', 'しゅくじつ', '年中行事', '式']],
  ['nature', 'kind', '自然のもの（天気や景色）？', 'n', ['自然', 'しぜん', '天気', 'てんき', '気象', '天候', '景色', 'けしき', '現象']],
  // --- 大きさ・形・さわりごこち ---
  ['s1', 'size', '手のひらより大きい？', 'n', ['@size1']],
  ['s2', 'size', '人より大きい？', 'n', ['@size2']],
  ['s3', 'size', '家より大きい？', 'n', ['@size3']],
  ['carry', 'size', '手で持ち運べる？', 'u', ['持ち運', 'もちはこ', '持つもの', '手で持', 'てでもつ', '持てる', 'もてる', '持って', 'もって', '運べ', 'はこべ', 'ぽけっと', 'かばんに入']],
  ['heavy', 'size', '重い？', 'u', ['重い', 'おもい', '重た', 'おもた', '@light']],
  ['round', 'size', '丸い？', 'n', ['丸', 'まるい', 'まるく', 'まんまる', '球体', '球形', '円形', 'えんけい', 'ぼーる状']],
  ['square', 'size', '四角い？', 'n', ['四角', 'しかく', '長方形', '正方形', '箱', 'はこがた', '角ばって']],
  ['long', 'size', '細長い？', 'n', ['細長', 'ほそなが', '長い', 'ながい', '細い', 'ほそい', '棒', 'ぼう']],
  ['soft', 'size', 'やわらかい？', 'u', ['柔らか', 'やわらか', '軟らか', 'ふわふわ', 'ふかふか', 'ぷにぷに', 'もちもち', 'ふにゃ']],
  ['hard', 'size', 'かたい？', 'u', ['硬い', '固い', '堅い', 'かたい', 'かちかち', 'こちこち']],
  // --- 色 ---
  ['red', 'color', '赤い？', 'c', ['!赤ちゃん', '!あかちゃん', '!赤ん坊', '赤', 'あかい', 'あかいろ', 'まっか', 'れっど']],
  ['white', 'color', '白い？', 'c', ['!面白', '!おもしろ', '!白衣', '白', 'しろい', 'しろ色', 'しろです', 'まっしろ', 'ほわいと']],
  ['black', 'color', '黒い？', 'c', ['!黒板', '黒', 'くろい', 'くろいろ', 'まっくろ', 'ぶらっく']],
  ['yellow', 'color', '黄色い？', 'c', ['黄色', 'きいろ', '黄', 'いえろー', '金色', 'きんいろ']],
  ['green', 'color', '緑色？', 'c', ['緑', 'みどり', 'ぐりーん']],
  ['blue', 'color', '青い？', 'c', ['!青森', '!あおもり', '!青虫', '!青のり', '青', 'あおい', 'あおいろ', '水色', 'みずいろ', 'ぶるー']],
  ['brown', 'color', '茶色い？', 'c', ['茶色', 'ちゃいろ', 'ぶらうん']],
  ['pink', 'color', 'ピンク色？', 'c', ['ぴんく', '桃色', 'ももいろ']],
  ['orange', 'color', 'オレンジ色？', 'c', ['おれんじ色', 'おれんじいろ', '橙', 'だいだい']],
  ['purple', 'color', '紫色？', 'c', ['紫', 'むらさき', 'ぱーぷる']],
  ['gray', 'color', '灰色・グレー？', 'c', ['灰色', 'はいいろ', 'ぐれー', 'ねずみ色', 'ねずみいろ']],
  // --- どこにある？ ---
  ['home', 'where', '家にある？', 'n', ['家の中', 'いえのなか', '家に', 'いえに', '家で', 'いえで', 'うちに', '家庭', 'かてい', '部屋', 'へや', '家にい']],
  ['kitchen', 'where', '台所にある？', 'n', ['台所', 'だいどころ', 'きっちん', '料理に使', '調理']],
  ['bath', 'where', 'お風呂や洗面所にある？', 'n', ['風呂', 'ふろ', '洗面所', '洗面', 'せんめん', 'といれ', 'ばす']],
  ['school', 'where', '学校にある？', 'n', ['学校', 'がっこう', '教室', 'きょうしつ', '授業', 'じゅぎょう', '勉強', 'べんきょう']],
  ['sea', 'where', '海にある・いる？', 'n', ['!海外', '!海老', '海', 'うみ', '浜', 'はま', 'びーち']],
  ['sky', 'where', '空にある？', 'n', ['!空気', '!くうき', '!空港', '!くうこう', '!天気', '!天ぷら', '!天井', '空', 'そら', '上空', '宇宙', 'うちゅう']],
  ['mount', 'where', '山や森にある・いる？', 'n', ['山', 'やま', '森', 'もり', '林', 'はやし']],
  ['outside', 'where', '外にある・いる？', 'n', ['!外国', '外', 'そと', '屋外', 'おくがい', '野外', '外で見', 'そとで']],
  ['store', 'where', 'お店で買える？', 'n', ['お店で買', 'お店で売', 'おみせでか', 'お店', 'おみせ', 'すーぱー', 'こんびに', '店で', '店に', '買え', '売って', 'うって', '売られ', '売ってる', '値段', 'ねだん']],
  ['city', 'where', '町にある・いる？', 'u', ['町', 'まち', '街中', '街', '都会', 'とかい', '都市']],
  ['farm', 'where', '畑や牧場にある・いる？', 'n', ['畑', 'はたけ', '田んぼ', 'たんぼ', '農', 'のう', '牧場', 'ぼくじょう', 'ふぁーむ']],
  ['zoo', 'where', '動物園や水族館にいる？', 'n', ['動物園', 'どうぶつえん', '水族館', 'すいぞくかん']],
  ['japan', 'where', '日本らしいもの（和風）？', 'u', ['日本', 'にほん', 'にっぽん', '和風', 'わふう', '和食', 'わしょく', '和の']],
  ['foreign', 'where', '外国から来たもの？', 'u', ['外国', 'がいこく', '海外', 'かいがい', '西洋', 'せいよう', 'あめりか', '洋風', '洋食']],
  // --- とくちょう ---
  ['move', 'feat', '動く？', 'n', ['動く', 'うごく', '動き', 'うごき', '動け', 'うごけ', '動いて', 'うごいて', '動か', 'うごか']],
  ['legs', 'feat', '足がある？', 'n', ['足がある', '足がな', 'あしがある', 'あしがな', 'あしは', '足は', '足あ', '脚', '足']],
  ['fur', 'feat', '毛が生えてる？', 'n', ['!毛布', '!毛糸', '毛', 'ふさふさ', 'もふもふ']],
  ['fly', 'feat', '空を飛ぶ？', 'n', ['!飛行機', '!羽根', '空を飛', 'そらをと', '空飛', '飛ぶ', '飛べ', '飛ん', '飛び', 'とぶ', 'とべ', 'とんで']],
  ['swim', 'feat', '水の中を泳ぐ？', 'n', ['泳', 'およ', '水中', 'すいちゅう', '水の中', 'みずのなか', '潜', 'もぐ']],
  ['light', 'feat', '光る？', 'n', ['光', 'ひかる', 'ひかり', '明る', 'あかる', 'らいと', '照ら', '輝', 'かがや']],
  ['sound', 'feat', '音が出る？', 'n', ['!音楽', '音', 'おと', '鳴', 'なきごえ', 'うるさ', '声', 'こえ', 'しゃべ']],
  ['hot', 'feat', '熱い・あたたかい？', 'n', ['熱い', 'あつい', '暑い', '温か', '暖か', 'あたたか', 'あったか', 'ほかほか', 'ほっと']],
  ['cold', 'feat', '冷たい？', 'n', ['冷た', 'つめた', '冷え', 'ひえ', '寒い', 'さむい', '凍', 'こお', 'ひんやり']],
  ['sweet', 'feat', '甘い？', 'n', ['甘', 'あまい', 'あまく', 'すいーと']],
  ['spicy', 'feat', '辛い？', 'n', ['辛', 'からい', 'からく', 'ぴりぴり', 'すぱいしー']],
  ['sour', 'feat', 'すっぱい？', 'n', ['すっぱ', '酸っぱ', '酸味']],
  ['water', 'feat', '水に関係ある？', 'n', ['!水着', '!みずぎ', '!水筒', '!水族館', '!水色', '!水玉', '水', 'みず', '濡れ', 'ぬれ', '液体', 'えきたい']],
  ['fire', 'feat', '火に関係ある？', 'n', ['!火曜', '!火山', '!花火', '!火事', '火', 'ほのお', '炎', '燃', 'もえる']],
  ['wood', 'feat', '木でできてる？', 'n', ['木製', 'もくせい', '木で', '木の', '木から', '木材']],
  ['metal', 'feat', '金属でできてる？', 'n', ['金属', 'きんぞく', '鉄', 'てつで', 'めたる', 'すてんれす', 'あるみ']],
  ['paper', 'feat', '紙でできてる？', 'n', ['紙', 'ぺーぱー']],
  ['cloth', 'feat', '布でできてる？', 'n', ['布', 'ぬの', '繊維', '毛糸', 'けいと']],
  ['glass', 'feat', 'ガラスでできてる？', 'n', ['がらす']],
  ['wear', 'feat', '身につけるもの？', 'n', ['身につけ', 'みにつけ', '着るもの', '着る物', '着られ', '着もの', '服', 'ふぁっしょん']],
  ['write', 'feat', '字を書くのに関係ある？', 'n', ['書く', '書け', 'かくもの', '字', '文字', 'もじ']],
  ['play', 'feat', '遊ぶもの？', 'n', ['遊', 'あそ', 'おもちゃ', '玩具', 'げーむ']],
  ['kids', 'feat', '子どもが好き？', 'u', ['!こどもの日', '!子どもの日', '!子供の日', '子供に人気', '子どもに人気', 'こどもに人気', '子どもが好', '子供が好', 'こどもがすき', '子ども', '子供', 'こども', 'きっず']],
  ['music', 'feat', '音楽に関係ある？', 'n', ['音楽', 'おんがく', '楽器', 'がっき', '演奏', 'えんそう', '歌', 'うた', 'りずむ', 'めろでぃ']],
  ['danger', 'feat', '危ない？', 'n', ['危な', '危険', 'あぶな', 'きけん', 'こわい', '怖い', '怪我', '痛い', 'いたい', '毒', 'どく']],
  ['wheels', 'feat', 'タイヤや車輪がある？', 'n', ['たいや', '車輪', 'しゃりん']],
  // --- もっとくわしく ---
  ['pet', 'feat', 'ペットとして飼える？', 'n', ['ぺっと', '飼', 'かえる？', 'かえますか', 'かう？']],
  ['tail', 'feat', 'しっぽがある？', 'n', ['しっぽ', '尻尾', 'しっぽ']],
  ['horn', 'feat', '角（つの）がある？', 'n', ['角が', 'つの', '角は', '角あ', '角']],
  ['stripe', 'feat', 'しま模様？', 'n', ['しま模様', 'しましま', 'しまもよう', 'ぼーだー', 'すとらいぷ', '縞']],
  ['carn', 'feat', 'ほかの動物を食べる（肉食）？', 'n', ['肉食', 'にくしょく', 'ほかの動物を食べ', '動物を食べ', '獲物', 'えもの']],
  ['tall', 'size', '背が高い・高さがある？', 'n', ['背が高', 'せがたか', '高さ', 'たかさ', 'のっぽ', '高い建', '高くそび', '見上げ', 'みあげ']],
  ['ball', 'feat', 'ボールを使う？', 'n', ['!ぼーるぺん', 'ぼーる', '球技', 'きゅうぎ']],
  ['team', 'feat', 'チームでやる？', 'n', ['ちーむ', '団体', 'だんたい', '何人かで', 'みんなで', '大勢で', 'おおぜいで']],
  ['racket', 'feat', 'ラケットを使う？', 'n', ['らけっと']],
  ['kick', 'feat', '足でける？', 'n', ['蹴', 'をける', 'をけっ', 'をけり', 'ぼーるける', 'ぼーるけっ', 'ぼーるをけ', '足でける', 'あしでける', '足を使', 'あしをつか', '足で', 'きっく']],
  ['hand', 'feat', '手を使う？', 'n', ['手を使', 'てをつか', '手で使', '手でにぎ', '手で', '握', 'にぎる']],
  ['throw', 'feat', '投げる？', 'n', ['投げ', 'なげる', 'なげて', 'なげま']],
  ['net', 'feat', 'ネットや網を使う？', 'n', ['ねっと', '網', 'あみ']],
  ['fight', 'feat', '相手と戦う・対戦する？', 'n', ['戦', 'たたか', '対戦', 'たいせん', 'ばとる', '勝負', 'しょうぶ', 'けんか']],
  ['snow', 'feat', '雪に関係ある？', 'n', ['雪', 'ゆき', 'すのー']],
  ['head', 'feat', '頭や顔につける？', 'n', ['頭や顔', '頭に', 'あたまに', '頭の', '顔に', 'かおに', 'かぶる', '目にかけ', 'めにかけ', '耳に', '首に', 'くびに']],
  ['feet', 'feat', '足にはく・つける？', 'n', ['足には', '足につけ', 'あしにつけ', 'あしには', '履く', 'はく？', 'はくもの', '足元']],
  ['contain', 'feat', '中に物を入れる？', 'n', ['入れ物', 'いれもの', '容器', 'ようき', '中に物を入れ', '中に物', '物を入れ', 'ものをいれ', '収納']],
  ['number', 'feat', '数字が書いてある？', 'n', ['数字', 'すうじ', 'ばんごう', '番号']],
  ['read', 'feat', '読むもの？', 'n', ['!読み手', '読み物', 'よみもの', '読む', '読め', '読ん', 'よむ', 'よめ', 'よんで']],
  ['rice', 'feat', 'お米からできてる？', 'n', ['お米', 'おこめ', '米', 'こめ', 'ごはんで']],
  ['noodle', 'feat', 'めん類？', 'n', ['!画面', '!がめん', '!綿', '!めんどう', '!免許', '!めんきょ', '麺', 'めん', 'ぬーどる', 'すする', 'ずるずる']],
  ['bread', 'feat', 'パンや小麦粉を使う？', 'n', ['小麦粉', 'こむぎこ', '小麦', 'こむぎ', 'ぱんを', 'ぱんで', 'ぱんに']],
  ['spoon', 'feat', 'スプーンで食べる？', 'n', ['すぷーんで', 'すぷーんを']],
  ['chop', 'feat', 'おはしで食べる？', 'n', ['お箸で', '箸で', 'はしで', 'おはしで']],
  ['handeat', 'feat', '手で持って食べる？', 'n', ['手で持って食べ', '手で食べ', 'てでたべ', '手づかみ', 'かぶりつ']],
  ['root', 'feat', '土の中で育つ？', 'n', ['土の中で育', '土の中にでき', '土の中', 'つちのなか', '根っこ', '土から']],
  ['leaf', 'feat', '葉っぱ？', 'n', ['葉っぱ', '葉', 'はっぱ', 'りーふ']],
  ['bitter', 'feat', '苦い？', 'n', ['苦', 'にがい', 'にがく', 'びたー']],
  ['work', 'feat', '仕事で使う？', 'n', ['仕事で使', '仕事に使', 'しごとでつか', 'しごとにつか', '働く車', '業務', '作業', 'さぎょう']],
  ['hospital', 'where', '病院にある・いる？', 'n', ['病院', 'びょういん', '病気', 'びょうき']],
  ['mouth', 'feat', '口に関係ある？', 'n', ['!口が大き', '口に関係', '口に入れ', 'くちにいれ', '口につけ', '口', 'くち', '歯']],
  ['money', 'feat', 'お金に関係ある？', 'n', ['お金に関係', 'おかねにかんけい', 'お金', 'おかね', '金額', 'お小遣い']],
  ['cost', 'feat', 'お金がかかる？', 'u', ['お金がかか', 'お金かか', 'おかねがかか', 'おかねかか', 'お金を払', 'お金払', 'お金はら', 'おかねをはら', 'おかねはら', 'お金がいる', 'お金いる', 'おかねがいる', '有料', 'ゆうりょう', '料金', '入場料', 'お金を使', 'おかねをつか']],
  ['solo', 'feat', '一人でできる？', 'u', ['一人で', 'ひとりで', '1人で', 'ひとりでも', '一人でも', '1人でも']],
  ['equip', 'feat', '道具を使う？', 'u', ['道具を使', '道具使', 'どうぐをつか', 'どうぐつか', '道具がい', '道具い', 'どうぐがい', 'どうぐい', '道具が必要', '道具は']],
  ['sleep', 'feat', '寝るときに使う？', 'n', ['寝', 'ねるとき', 'ねるまえ', 'ねむ', '眠', 'すいみん', '睡眠']],
  ['clean', 'feat', 'そうじや洗うのに使う？', 'n', ['掃除', 'そうじ', '洗', 'あらう', 'きれいに', 'せいけつ']],
  ['cut', 'feat', '物を切る？', 'n', ['物を切', 'ものをき', '切る', '切れる', 'かっと']],
  ['eatuse', 'feat', '食べるときに使う？', 'n', ['食べるときに使', '食事に使', '食事で使', '食事のときに使', '食事の時に使', 'しょくじのときに', '食器', 'しょっき', 'たべるときにつか']],
  ['hair', 'feat', '髪の毛に関係ある？', 'n', ['髪', 'かみのけ', 'へあ']],
  ['cute', 'feat', 'かわいい？', 'u', ['かわい', '可愛', 'きゅーと']],
  // --- いつ？ ---
  ['spring', 'season', '春に関係ある？', 'n', ['春', 'はるに', 'はるの', 'はるが', 'はるです', 'はるか']],
  ['summer', 'season', '夏に関係ある？', 'n', ['夏', 'なつ']],
  ['autumn', 'season', '秋に関係ある？', 'n', ['秋', 'あきに', 'あきの', 'あきが', 'あきです']],
  ['winter', 'season', '冬に関係ある？', 'n', ['冬', 'ふゆ']],
  ['night', 'season', '夜に関係ある？', 'n', ['夜', 'よる', '夜中', '夜行']]
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
K.build = function (data, facts) {
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
      // 動物が ほかの動物を食べるかは、タグがなければ「わからない」（ねこ・かえる なども食べる）
      if (v[K.AI.carn] === -1 && (v[K.AI.ani] === 1 || v[K.AI.bird] === 1 || v[K.AI.fish] === 1 || v[K.AI.bug] === 1)) v[K.AI.carn] = 2;
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
      // 道具を使う：ボール・ラケット・ネットを使うものは はい
      if (v[K.AI.equip] === 2 && (v[K.AI.ball] === 1 || v[K.AI.racket] === 1 || v[K.AI.net] === 1)) v[K.AI.equip] = 1;
      // 一人でできる：チームでやるものは いいえ
      if (v[K.AI.solo] === 2 && v[K.AI.team] === 1) v[K.AI.solo] = 0;
      // お金がかかる：お店で買えるものは はい
      if (v[K.AI.cost] === 2 && v[K.AI.store] === 1) v[K.AI.cost] = 1;
      var w = { id: db.words.length, w: names[0], al: names, n: names.map(K.normL), cat: ck, catName: C.name, size: size, diff: diff, v: v };
      var clash = w.n.filter(function (x) { return db.byNorm[x] != null; });
      if (clash.length) { db.dropped.push({ w: names[0], why: 'name clash ' + clash.join(',') + ' with ' + db.words[db.byNorm[clash[0]]].w }); return; }
      w.n.forEach(function (x) { db.byNorm[x] = w.id; });
      db.words.push(w); db.cats[ck].words.push(w.id);
    });
  });
  db.N = db.words.length;
  K.addFacts(db, facts || root.SK_FACTS);
  return db;
};
// ---------- お題ごとの「関係することば」 ----------
// facts = [ 'お題: ことば ことば/書き方 …\n…', … ]（facts.js）。1文字のかなは あいまいなので使わない
function factNorm(x) { return K.normL(K.okuri(x)); }
K.addFacts = function (db, facts) {
  db.factMiss = []; db.factUnknown = [];
  db.words.forEach(function (w) { w.facts = []; });
  (facts || []).forEach(function (block) {
    String(block).split('\n').forEach(function (line) {
      var m = line.match(/^\s*([^:：]+)[:：](.*)$/); if (!m) return;
      var names = m[1].trim().split('/'), id = null;
      for (var i = 0; i < names.length && id == null; i++) { var n = K.normL(names[i]); if (db.byNorm[n] != null) id = db.byNorm[n]; }
      if (id == null) { db.factUnknown.push(names[0]); return; }
      var w = db.words[id];
      m[2].trim().split(/\s+/).forEach(function (tok) {
        var neg = tok[0] === '!'; if (neg) tok = tok.slice(1);   // '!ことば' = その答えは「いいえ」
        var alts = tok.split('/').map(factNorm).filter(function (a) { return a.length >= 2 || /[\u4e00-\u9fff0-9]/.test(a); });
        if (alts.length) { alts.neg = neg; w.facts.push(alts); }
      });
    });
  });
  db.words.forEach(function (w) { if (!w.facts.length) db.factMiss.push(w.w); });
};
// 質問文 t（normL済み）に お題 wid の「関係することば」が出てくるか → [{pos, end}]
K.factHits = function (db, wid, t) {
  var out = [], fs = db.words[wid].facts || [];
  for (var i = 0; i < fs.length; i++) for (var j = 0; j < fs[i].length; j++) { var k = t.indexOf(fs[i][j]); if (k >= 0) { out.push({ pos: k, end: k + fs[i][j].length, s: fs[i][j], neg: !!fs[i].neg }); break; } }
  return out;
};
K.ans = function (db, wid, ai) { return db.words[wid].v[ai]; };   // 1/0/2
K.ANS_TXT = { y: 'はい', n: 'いいえ', u: 'わからない' };
K.code = function (x) { return x === 1 ? 'y' : x === 0 ? 'n' : 'u'; };

// ---------- 自由入力の質問を読む ----------
// 戻り値：{ t:'attr', a, neg, also:[{a,neg}] }（特ちょうだけで説明できる質問）
//       | { t:'fact', text, a?, neg? }（特ちょう以外のことばを含む質問：お題ごとの「関係することば」で答える。なければ わからない）
//       | { t:'guess', w:単語id or -1, text } | { t:'none' }
var PFX = /^(ねえ|ねぇ|えっと|えーと|じゃあ|では|それって|それは|それ|あれは|おだいは|お題は|こたえは|答えは|もしかして|ひょっとして|たぶん|ずばり|ズバリ|すばり|ますたー|まずは|つぎに|次に)+/;
function negAfter(t, end) {   // 一致した語の すぐ後ろが 否定 か
  var rest = t.slice(end, end + 9);
  return /^(.{0,4}?)(じゃない|じゃなく|ではない|ではなく|ない|なく|ません|ず[？?]?$|ぬ)/.test(rest) && !/^(.{0,2})(ないぞう|ないふ)/.test(rest);
}
function sizeRule(t) {   // 大きさの言い回し → s1/s2/s3（span も返す）
  var big = /(大き|おおき|でか|でっか|長身)/, small = /(小さ|ちいさ|ちっちゃ|ちっさ|みに)/;
  var refs = [[/(手のひら|てのひら|手|りんご|こぶし|すまほ)/, 's1'], [/(人間|にんげん|ひと|人|大人|おとな|自分|わたし|ぼく)/, 's2'], [/(家|いえ|建物|たてもの|びる|車|くるま)/, 's3']];
  var mb = t.match(big), ms = t.match(small);
  if (!mb && !ms) return null;
  var m0 = mb || ms, span = [m0.index, m0.index + m0[0].length];
  for (var i = 0; i < refs.length; i++) {
    var m = t.match(new RegExp(refs[i][0].source + '.{0,4}?(より|よりも|よか|と比べて|とくらべて|くらい|ぐらい)'));
    if (m) return { a: K.AI[refs[i][1]], neg: !!ms && !mb, spans: [span, [m.index, m.index + m[0].length]] };
  }
  if (/両手|りょうて|抱え|かかえ/.test(t)) { var m2 = t.match(/両手|りょうて|抱え|かかえ/); return { a: K.AI.s1, neg: !!ms, spans: [span, [m2.index, m2.index + m2[0].length]] }; }
  if (mb) return { a: K.AI.s2, neg: false, loose: true, spans: [span] };   // ただ「大きい？」→ 人より大きいか で答える
  return { a: K.AI.s1, neg: true, loose: true, spans: [span] };           // ただ「小さい？」→ 手のひら以下か
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
// 意味をほとんど変えない ことば（助詞・語尾・軽い動詞・つなぎ）。質問の残りが これだけなら「特ちょうだけで説明できる」
var FW = ('を が に で は も の と へ や か ね よ な さ ぞ わ って から まで より など とか だけ しか ばかり くらい ぐらい ' +
  'です ですか でしょうか でしょう だ だよ だよね なの なのか なん なんです なんですか じゃない じゃないの ではない ではありません ますか ません かな かね かしら よね っけ ないです ないの ない なく ず ' +
  'ある あります あるの あった あれば いる います いるの いた いて おる する します してる している しています した しますか される されてる できる できます できてる できている できた できて なる なります なってる なった やる やります やってる やっている やった ' +
  'つかう つかいます つかってる つかって つかえる つかわ つかい 使う 使います 使ってる 使って 使える 使わ 使い 使われ つかわれ 関係 かんけい 関わ かかわ 関連 ' +
  'もの 物 こと とき 時 やつ 感じ かんじ っぽい ぽい みたい 系 なかま 仲間 種類 しゅるい 一種 いっしゅ 的 よく とても すごく ちょっと けっこう 結構 たくさん いっぱい ふつう 普通 ' +
  'みんな 全部 ほとんど 主に おもに 本当に ほんとうに たいてい だいたい 大体 必ず かならず いつも 何か なにか なんか 何 ずっと まあ わりと 割と 結構 けっこう すこし 少し ' +
  'それって それは それ これ あれ ねえ ねぇ えっと えーと じゃあ では もしかして ひょっとして たぶん おだいは お題は こたえは 答えは ずばり すばり つぎに 次に まずは ますたー ' +
  '食べる たべる 食べます たべます 飲む のむ 飲みます のみます の中 相手 いない いません ありません なかった かける お ご 名前 なまえ たぐい 類 るい 製 せい らしい 時期 じき として 自分 じぶん 人気 にんき どこか 見る 見られる 見える 見かける みる みえる 来た きた 来る くる 生えてる はえてる 生えて 出る でる 出ます でます 出す だす 書いてある かいてある 書いて ついてる ついている 付いてる 浮かんでる 浮かぶ うかんでる 育つ そだつ 入る はいる 入ってる はいってる 入って 買える 治す なおす さす 人 ひと ていう という っていう てる ている ています ちゃう じゃう もう まだ 色 いろ 形 かたち').split(' ').map(function (x) { return K.normL(x); }).filter(Boolean);
var FWSET = {}, FWMAX = 0; FW.forEach(function (x) { FWSET[x] = 1; if (x.length > FWMAX) FWMAX = x.length; });
var INFL = /^(させる|られる|れる|せる|かった|くない|くて|ければ|ません|ました|ます|まし|ない|なく|って|った|ている|てる|いて|いた|える|ける|げる|べる|める|れ|る|く|ぐ|ぶ|む|う|つ|す|い|き|ぎ|び|み|り|ち|し|け|げ|べ|め|え|せ|て|た|ん|っ|そう)+/;
// 活用語尾をつけてよい「語幹」（漢字で終わる・かなの動詞/形容詞の語幹）。「たいや＋き」のような名詞には つけない
var STEMEND = /([\u4e00-\u9fff]|およ|もぐ|あそ|なげ|ひか|うご|うごか|あま|から|すっぱ|にが|つめた|あたたか|あったか|やわらか|おも|おもた|かた|あぶな|こわ|かわい|まる|なが|ほそ|ひえ|もえ|ぬれ|たべ|たべられ|たべれ|のめ|のれ|もて|はこべ|よめ|よん|にぎ|あら|とべ|とん|とぶ|さむ|あつ|あか|あお|くろ|しろ|きいろ|ちゃいろ|もちはこ|はこ|うごけ|およい|とんで|しましま|うるさ|おおき|でか|でっか|ちいさ|ちっちゃ|ちっさ|いきて|うごけ|のれま|のめま|たべられ|ひかる|ひかり|さわ|かる)$/;
function fwOnly(seg, afterHit) {   // seg が 意味の軽いことばだけで できているか（単語分割）
  if (!seg) return true;
  if (afterHit) { var m = seg.match(INFL); if (m && m[0].length <= 5 && fwOnly(seg.slice(m[0].length), false)) return true; }
  var n = seg.length, ok = [true]; for (var i = 1; i <= n; i++) ok[i] = false;
  for (var e = 1; e <= n; e++) for (var L = 1; L <= FWMAX && L <= e; L++) if (ok[e - L] && FWSET[seg.slice(e - L, e)]) { ok[e] = true; break; }
  return ok[n];
}
// t のうち spans で覆われていない部分（のこり）に、意味のあることばが残っているか
K._resSegs = function (t, spans) { var out = []; residue(t, spans, out); return out; };
function residue(t, spans, out) {
  var cov = new Uint8Array(t.length), after = new Uint8Array(t.length + 1);
  spans.forEach(function (s) { for (var i = s[0]; i < s[1] && i < t.length; i++) cov[i] = 1; var hs = t.slice(Math.max(0, s[0]), s[1]); if (/[\u4e00-\u9fff]/.test(hs) || STEMEND.test(hs)) after[s[1]] = 1; });
  var i = 0;
  while (i < t.length) {
    if (cov[i]) { i++; continue; }
    var j = i; while (j < t.length && !cov[j]) j++;
    var seg = t.slice(i, j); if (/^[0-9]+$/.test(seg)) { if (!out) return true; out.push(seg); }
    else if (!fwOnly(seg, !!after[i])) { if (!out) return true; out.push(seg); }
    i = j;
  }
  return out ? out.length > 0 : false;
}
// 「しゅるい」や「材料」の語が、ここでは別の意味（いる場所・使う物・目的語）で使われているか
//   例：「動物がいる？」（動物園）「魚使う？」（すし）「紙を切る？」（はさみ）「魚に関係ある？」（つり）
var OBJKIND = { meat: 1, liv: 1, ani: 1, bird: 1, fish: 1, bug: 1, pla: 1, person: 1, job: 1, food: 1, fruit: 1, veg: 1, dish: 1, sweets: 1, veh: 1, tool: 1, building: 1 };
var MATERIAL = { paper: 1, cloth: 1, metal: 1, wood: 1, glass: 1, wear: 1, food: 1, drink: 1 };
function objUse(a, rest) {
  var A0 = K.ATTRS[a];
  if (OBJKIND[A0.id] || MATERIAL[A0.id]) {
    if (/^(が|も|は)?(いる|います|いっぱい|たくさん|おおい|多い|すん|住|あつま|集ま|見られ|みられ|見え|みえ|会え|あえ)/.test(rest)) return true;
    if (/^(を|が|も)?(使|つか|入|はい|いれ|のせ|乗せ|運|はこ|切|き(る|れ)|洗|あら|焼|や(く|い)|入れ|育|そだ|売|う(る|って)|作る|つくる|食べ|たべ|飲|のむ|飼|か(う|え))/.test(rest)) return true;
    if (/^(に|と)(関係|かんけい|関わ|かかわ|関連)/.test(rest)) return true;
    if (/^(が|も|は)?(ある|あり|あっ|でてく|出てく|登場|とうじょう)/.test(rest)) return true;   // 「乗り物ある？」（遊園地）
    if (/^(を|が|も)?(する|して|しま|した|つく|作)/.test(rest)) return true;   // 「料理する？」（コック）
    if (/^を/.test(rest)) return true;
  }
  return false;
}
// 単語さがし（お題の名前が文中にあるか）
var TAILOK = /^(じゃない|じゃないの|かな|でしょ|だよね|のこと|かも|っぽい|でしょう|ですかね|なの|では)?$/;
function findWord(db, core) {   // 「それは○○？」の○○が お題の名前で始まり、あとは語尾だけ
  var best = -1, bl = 0;
  for (var i = 0; i < db.N; i++) { var ns = db.words[i].n; for (var j = 0; j < ns.length; j++) { var x = ns[j]; if (x.length >= 1 && x.length > bl && core.indexOf(x) === 0 && TAILOK.test(core.slice(x.length))) { best = i; bl = x.length; } } }
  return { id: best, len: bl };
}
// 書き方のゆれ（ドッチ／ドッジ、ー の有無、小さい字、ぢ・づ）を そろえた形
K.fz = function (s) {
  return K.normL(s).replace(/ー/g, '').replace(/[ぁぃぅぇぉっゃゅょゎ]/g, function (c) { return { 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ' }[c]; })
    .replace(/ぢ/g, 'じ').replace(/づ/g, 'ず').replace(/ゔ/g, 'ぶ').replace(/を/g, 'お');
};
function dist1(a, b) {   // 編集距離が 1 以下か
  if (a === b) return true; var la = a.length, lb = b.length; if (Math.abs(la - lb) > 1) return false;
  var i = 0, j = 0, d = 0;
  while (i < la && j < lb) { if (a[i] === b[j]) { i++; j++; continue; } if (++d > 1) return false; if (la > lb) i++; else if (lb > la) j++; else { i++; j++; } }
  return d + (la - i) + (lb - j) <= 1;
}
var DAK = { 'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ', 'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ', 'だ': 'た', 'で': 'て', 'ど': 'と', 'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ', 'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ' };
function seion(s) { return s.replace(/[がぎぐげござじずぜぞだでどばびぶべぼぱぴぷぺぽ]/g, function (c) { return DAK[c]; }); }
// 名前のゆれで お題に当たるか（4文字以上で1文字ちがい、または 濁点のちがいだけ）。ほかのお題の名前そのものなら当たらない
K.nearName = function (db, core) {
  var f = K.fz(core); if (!f) return -1; if (db.byNorm[K.normL(core)] != null) return db.byNorm[K.normL(core)];
  var hit = -1, n = 0;
  for (var i = 0; i < db.N; i++) { var ns = db.words[i].al; for (var j = 0; j < ns.length; j++) { var g = K.fz(ns[j]); if (g === f || (f.length >= 4 && g.length >= 4 && seion(g) === seion(f)) || (f.length >= 5 && g.length >= 5 && dist1(f, g))) { if (hit !== i) { hit = i; n++; } break; } } }
  return n === 1 ? hit : -1;
};
var EXACT = { 'ける': 'kick', 'とぶ': 'fly', 'なく': 'sound', 'うごく': 'move', 'ひかる': 'light', 'およぐ': 'swim', };
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
  // ①「それは○○ですか？」型（○○がお題の名前と一致。書き方のゆれも）
  var core = K.stripGuess(raw, db);
  if (core && db.byNorm[core] != null) return { t: 'guess', w: db.byNorm[core], text: core };
  if (NONQ.test(t)) return { t: 'none' };
  if (EXACT[t]) return { t: 'attr', a: K.AI[EXACT[t]], neg: false, kana: EXACT[t] === 'fly' ? 1 : 0, also: [] };
  var nn = core && core.length >= 3 && !/[をにがでへとはも]/.test(core.slice(1)) ? K.nearName(db, core) : -1;
  if (nn >= 0) return { t: 'guess', w: nn, text: core, near: 1 };
  // ② 特ちょう
  var C = compile(), hits = [];
  var sz = sizeRule(t); if (sz) hits.push({ a: sz.a, neg: sz.neg, pos: sz.spans[0][0], end: sz.spans[0][1], spans: sz.spans, len: 3, loose: sz.loose, size: true });
  var blocked = [];
  C.forEach(function (c) { if (c.stop) { var j = t.indexOf(c.s); while (j >= 0) { blocked.push([j, j + c.s.length]); j = t.indexOf(c.s, j + 1); } } });   // stop語（例：「動物園」）が当たった範囲は、ほかの短い語（「動物」）に使わせない
  C.forEach(function (c) {
    if (c.special) {
      if (c.special === 'light') { var ml = t.match(/(軽い|かるい|軽た|軽く|かるく)/); if (ml) hits.push({ a: c.a, neg: !/(軽くない|かるくない)/.test(t), pos: ml.index, end: ml.index + ml[0].length, len: 2 }); }
      return;
    }
    if (c.stop) return;
    var idx = t.indexOf(c.s);
    while (idx >= 0) {
      var inBlock = blocked.some(function (b) { return idx >= b[0] && idx < b[1] && c.s.length < b[1] - b[0]; });
      if (!inBlock && objUse(c.a, t.slice(idx + c.s.length))) inBlock = true;
      if (!inBlock) hits.push({ a: c.a, neg: negAfter(t, idx + c.s.length), pos: idx, end: idx + c.s.length, len: c.s.length, gen: c.gen });
      idx = t.indexOf(c.s, idx + 1);
    }
  });
  // 重ならない一致だけを えらぶ（長いもの優先）
  var sel = [], used = new Uint8Array(t.length);
  hits.slice().sort(function (x, y) { if (!!x.size !== !!y.size) return x.size ? -1 : 1; return (y.end - y.pos) - (x.end - x.pos) || x.pos - y.pos; }).forEach(function (h) {
    var sp = h.spans || [[h.pos, h.end]];
    for (var k = 0; k < sp.length; k++) for (var i = sp[k][0]; i < sp[k][1]; i++) if (used[i]) return;
    sp.forEach(function (s2) { for (var i = s2[0]; i < s2[1]; i++) used[i] = 1; });
    if (!sel.some(function (x) { return x.a === h.a; })) sel.push(h); else sel.push(Object.assign({ dup: 1 }, h));
  });
  var spans = []; sel.forEach(function (h) { (h.spans || [[h.pos, h.end]]).forEach(function (s2) { spans.push(s2); }); });
  // 「それは○○？」で ○○ がお題の名前（あとは語尾だけ）
  var wd = findWord(db, core);
  if (wd.id >= 0 && !(sel.length && sel[0].size)) return { t: 'guess', w: wd.id, text: db.words[wd.id].w };
  var main = sel.filter(function (h) { return !h.dup; });
  main.sort(function (x, y) { if (!!x.gen !== !!y.gen) return x.gen ? 1 : -1; var xk = K.ATTRS[x.a].g === 'kind', yk = K.ATTRS[y.a].g === 'kind'; if (xk !== yk && !x.size && !y.size) { if (xk && y.pos < x.pos) return 1; if (yk && x.pos < y.pos) return -1; } if (!!x.size !== !!y.size) return x.size ? -1 : 1; return (y.end - y.pos) - (x.end - x.pos) || x.pos - y.pos; });
  var res = residue(t, spans);
  if (K.DEBUG) K.DEBUG.push(K._resSegs(t, spans));
  if (main.length && !res) {
    var h = main[0];
    return { t: 'attr', kana: K.ATTRS[h.a].id === 'fly' && !/[飛空]/.test(t) ? 1 : 0, a: h.a, neg: h.neg, loose: !!h.loose, size: h.size ? 1 : 0, also: main.slice(1).filter(function (x) { return !x.gen; }).map(function (x) { return { a: x.a, neg: x.neg }; }) };
  }
  // ③ 特ちょうだけでは説明できない → お題ごとの「関係ることば」で答える
  var out = { t: 'fact', text: t };
  if (main.length) { out.a = main[0].a; out.neg = main[0].neg; }
  return out;
};
// 質問への答え（知識ベースどおり）。p = parse の結果。secret = お題の id
// 方針：自信のない「いいえ」は言わない（わからない にする）
K.answerParsed = function (db, p, secret) {
  if (p.t === 'guess') {
    if (p.w === secret) return 'correct';
    if (p.w < 0) return K.isAnswer(db, p.text, secret) ? 'correct' : 'n';
    var w = db.words[p.w];   // ほかのお題の名前：ふつうは いいえ。ただし お題に深く関係することば（「すし」に「まぐろ」）なら わからない
    if (w.n.some(function (x) { return x.length >= 2 && K.factHits(db, secret, x).some(function (h) { return h.s === x; }); })) return 'u';
    return 'n';
  }
  if (p.t === 'attr') {
    // ただ「大きい？」「小さい？」は、人くらいの大きさなら どちらとも言えない
    if (p.loose && db.words[secret].size === 2) return 'u';
    // ひらがなの「とぶ」は 跳ぶ（ジャンプ）かもしれない
    if (p.kana && K.ATTRS[p.a].id === 'fly' && K.factHits(db, secret, '跳ぶじゃんぷ').length) return 'u';
    var all = [{ a: p.a, neg: p.neg }].concat(p.also || []), got = {};
    for (var i = 0; i < all.length; i++) {
      var x = db.words[secret].v[all[i].a]; if (x === 2) { got.u = 1; continue; }
      var yes = x === 1; if (all[i].neg) yes = !yes; got[yes ? 'y' : 'n'] = 1;
    }
    if (got.y && got.n) return 'u';   // 特ちょうどうしで答えが割れる → 自信がないので わからない
    return got.n ? 'n' : got.u ? 'u' : 'y';
  }
  if (p.t === 'fact') {
    var tr = K.factTruth(db, secret, p);
    if (p.a != null && tr !== 2 && /^(spring|summer|autumn|winter|night|kick)$/.test(K.ATTRS[p.a].id)) {   // 文の中の特ちょうと 関係ることばの答えが割れる → わからない
      var xa = db.words[secret].v[p.a]; if (xa !== 2) { var ya = (xa === 1) !== !!p.neg; if (ya !== (tr === 1)) return 'u'; }
    }
    return tr === 1 ? 'y' : tr === 0 ? 'n' : 'u';
  }
  return 'u';
};
// 「関係ることば」の質問が お題 wid で「はい」になるか（NPCの推理用）：1=はい 0=いいえ（否定形） 2=わからない
K.factTruth = function (db, wid, p) {
  var fh = K.factHits(db, wid, p.text); if (!fh.length) return 2;
  var ys = 0, ns = 0;
  fh.forEach(function (h) { var yes = !h.neg; if (negAfter(p.text, h.end)) yes = !yes; if (yes) ys++; else ns++; });
  return ys && ns ? 2 : ys ? 1 : 0;
};
K.isAnswer = function (db, text, secret) {
  var t = K.stripGuess(text, db), w = db.words[secret]; if (!t) return false;
  if (w.n.indexOf(t) >= 0 || w.n.indexOf(K.normL(text)) >= 0) return true;
  return K.nearName(db, t) === secret;
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
