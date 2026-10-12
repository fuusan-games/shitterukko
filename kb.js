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
  ['pla', 'kind', '植物？', 'n', ['植物', 'しょくぶつ', '草花', '草', '木の仲間', '花です', '花？', 'はなです', '花か', '花の', '植物由来', 'しょくぶつゆらい', '植物から', 'しょくぶつから']],
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
  ['fur', 'feat', '毛が生えてる？', 'n', ['!毛布', '!毛糸', '毛', 'ふさふさ', 'もふもふ', 'もこもこ', 'ふわふわのけ']],
  ['fly', 'feat', '空を飛ぶ？', 'n', ['!飛行機', '!羽根', '空を飛', 'そらをと', '空飛', '飛ぶ', '飛べ', '飛ん', '飛び', 'とぶ', 'とべ', 'とんで']],
  ['swim', 'feat', '水の中を泳ぐ？', 'n', ['泳', 'およ', '水中', 'すいちゅう', '水の中', 'みずのなか', '潜', 'もぐ']],
  ['light', 'feat', '光る？', 'n', ['光', 'ひかる', 'ひかり', '明る', 'あかる', 'らいと', '照ら', '輝', 'かがや']],
  ['sound', 'feat', '音が出る？', 'n', ['!音楽', '!おとな', '!おとこ', '!おとう', '!おとし', '!おとめ', '!おとも', '!おとず', '!おととい', 'ってなく', 'ってな', 'ほえる', '吠', '音', 'おと', '鳴', 'なきごえ', 'うるさ', '声', 'こえ', 'しゃべ']],
  ['hot', 'feat', '熱い・あたたかい？', 'n', ['熱い', 'あつい', '暑い', '温か', '暖か', 'あたたか', 'あったか', 'ほかほか', 'ほっと']],
  ['cold', 'feat', '冷たい？', 'n', ['冷た', 'つめた', '冷え', 'ひえ', '寒い', 'さむい', '凍', 'こお', 'ひんやり']],
  ['sweet', 'feat', '甘い？', 'n', ['甘', 'あまい', 'あまく', 'すいーと']],
  ['spicy', 'feat', '辛い？', 'n', ['辛', 'からい', 'からく', 'ぴりぴり', 'すぱいしー']],
  ['sour', 'feat', 'すっぱい？', 'n', ['すっぱ', '酸っぱ', '酸味']],
  ['water', 'feat', '水に関係ある？', 'n', ['!水着', '!みずぎ', '!水筒', '!水族館', '!水色', '!水玉', '水', 'みず', '濡れ', 'ぬれ', '液体', 'えきたい']],
  ['fire', 'feat', '火に関係ある？', 'n', ['!火曜', '!火山', '!花火', '!火事', '火', 'ほのお', '炎', '燃', 'もえる', 'ひをつか', 'ひがで', 'ひをつけ', 'ひにかけ', 'ひがつ', 'ひをけ', 'ひであぶ']],
  ['wood', 'feat', '木でできてる？', 'n', ['木製', 'もくせい', '木で', '木の', '木から', '木材', 'きでできて', 'きでつく', 'きでできた']],
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
  ['hand', 'feat', '手を使う？', 'n', ['手を使', 'てをつか', '手で使', '手でにぎ', '手で', '握', 'にぎる', 'てでもつ', 'てでさわ', 'てでつか']],
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
  ['noodle', 'feat', 'めん類？', 'n', ['!画面', '!がめん', '!綿', '!めんどう', '!免許', '!めんきょ', '!めんをかぶ', '!お面', '!おめん', '!めんどうな', '麺', 'めん', 'ぬーどる', 'すする', 'ずるずる']],
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
  ['night', 'season', '夜に関係ある？', 'n', ['夜', 'よる', '夜中', '夜行']],
  // 活動・概念（人は「スポーツ」や「遊び」を“形のないもの”として考える。さわれる・見えるは あいまい）
  ['combat', 'feat', '格闘技？', 'n', ['格闘技', 'かくとうぎ', '格闘', 'かくとう', '武道', '武術', 'ぶじゅつ', 'まーしゃるあーつ']],
  ['strike', 'feat', '打撃系？', 'n', ['打撃', 'だげき', '殴', 'なぐ', 'ぱんち', 'パンチ']],
  ['grapple', 'feat', '相手と組み合う？', 'n', ['組み合', 'くみあ', '組み技', 'くみわざ', '組む', 'くむ？', 'つかみあ', '投げ技', 'なげわざ', '寝技', 'ねわざ']],
  ['body', 'feat', '体を動かす？', 'n', ['!運動会', '!うんどうかい', '!運動場', '!うんどうじょう', '体を動か', 'からだをうごか', '体を使', 'からだをつか', '運動', 'うんどう', '汗をかく', 'あせをかく']],
  ['winlose', 'feat', '勝ち負けがある？', 'n', ['勝ち負け', 'かちまけ', '勝敗', 'しょうはい', '試合', 'しあい', '競う', 'きそう', '競争', 'きょうそう', '勝ち', 'かち？', '負け', 'まけ？']],
  ['hobby', 'feat', '趣味？', 'u', ['趣味', 'しゅみ', 'ほびー', '娯楽', 'ごらく']],
  ['touch', 'feat', 'さわれる？', 'u', ['さわれ', '触れ', 'さわる', '触る', 'さわって', '触って', 'さわった', '手でふれ']],
  ['visible', 'feat', '目に見える？', 'u', ['目に見え', 'めにみえ', '目で見え', 'めでみえ', '見えるもの', 'みえるもの', '目で見る', 'めでみる']],
  ['abstract', 'feat', '形のないもの？', 'n', ['形がない', 'かたちがない', '形のない', 'かたちのない', '概念', 'がいねん', '抽象', 'ちゅうしょう', 'ことがら']],
  ['time', 'feat', '時間に関係ある？', 'n', ['!時間帯', '!じかんたい', '時間', 'じかん', '時の流れ', 'ときのながれ', '時刻', 'じこく', '過去', 'かこ', '未来', 'みらい']],
  ['science', 'feat', '科学に関係ある？', 'n', ['科学', 'かがく', '理科', 'りか', '物理', 'ぶつり', '実験', 'じっけん']],
  ['natural', 'feat', '自然にあるもの？', 'n', ['自然にある', 'しぜんにある', '自然のもの', 'しぜんのもの', '自然にでき', 'しぜんにでき', '天然', 'てんねん', '自然由来', 'しぜんゆらい']],
  ['proper', 'feat', '固有の名前？', 'n', ['固有', 'こゆう', '作品の名前', 'さくひんのなまえ', '商品の名前', '商品名', 'しょうひんめい', 'タイトル', 'たいとる', 'ブランド', 'ぶらんど', 'ひとつのゲームの名前', '作品', 'さくひん', '名前がついた']],
  ['videogame', 'feat', 'ビデオゲーム？', 'n', ['てれびげーむ', 'ビデオゲーム', 'びでおげーむ', 'ゲーム機で', 'げーむきで', 'ゲームで遊', 'げーむであそ', 'ゲームをする', 'げーむをする', 'ゲームする', 'げーむする', 'ゲームの名前', 'げーむのなまえ', 'スマホゲーム', 'すまほげーむ', 'オンラインゲーム', 'おんらいんげーむ']],
  ['app', 'feat', 'アプリやネットのサービス？', 'n', ['アプリ', 'あぷり', 'サービス', 'さーびす', 'サイト', 'さいと', 'えすえぬえす', 'SNS']],
  ['chara', 'feat', 'キャラクター？', 'n', ['キャラクター', 'きゃらくたー', 'キャラ', 'きゃら']],
  ['online', 'feat', 'インターネットやオンラインに関係ある？', 'n', ['オンライン', 'おんらいん', 'インターネット', 'いんたーねっと', 'ネットで', 'ねっとで', 'ネットに', 'ねっとに', '配信', 'はいしん', '動画', 'どうが', 'ゆーちゅーぶ']],
  ['screen', 'feat', '画面で見る？', 'n', ['画面', 'がめん', 'もにたー', 'ディスプレイ', 'でぃすぷれい']]
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
      var explicit = {};
      tags.forEach(function (t) { explicit[t.replace(/^[-?]/, '').replace(/\?$/, '')] = 1; });
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
      // 活動・概念の特ちょう（カテゴリから）
      var akind = ck === 'spo' || ck === 'evt' || ck === 'hob';
      if (!explicit.abstract && akind) v[K.AI.abstract] = 1; else if (!explicit.abstract && ck === 'nat') v[K.AI.abstract] = 2;
      if (v[K.AI.touch] === 2 && !akind && kind !== 'abs' && kind !== 'place' && kind !== 'drink') v[K.AI.touch] = 1;
      if (v[K.AI.visible] === 2 && !akind && kind !== 'abs') v[K.AI.visible] = 1;
      if (v[K.AI.body] === 0 && ck === 'spo' && !explicit.body) v[K.AI.body] = 1;
      if (v[K.AI.body] === 0 && (kind === 'ani' || kind === 'person') && !explicit.body) v[K.AI.body] = 2;
      if (v[K.AI.winlose] === 0 && !explicit.winlose && v[K.AI.fight] === 1) v[K.AI.winlose] = 1;
      if (v[K.AI.winlose] === 0 && !explicit.winlose && ck === 'spo') v[K.AI.winlose] = 2;
      if (v[K.AI.hobby] === 2 && !explicit.hobby && (ck === 'spo' || ck === 'hob')) v[K.AI.hobby] = 1;
      if (v[K.AI.hobby] === 2 && !explicit.hobby && /^(ani|food|drink|place|person)$/.test(kind)) v[K.AI.hobby] = 0;
      if (v[K.AI.combat] === 1 && v[K.AI.fight] === 0) v[K.AI.fight] = 1;
      // 道具を使う：ボール・ラケット・ネットを使うものは はい
      if (v[K.AI.equip] === 2 && (v[K.AI.ball] === 1 || v[K.AI.racket] === 1 || v[K.AI.net] === 1)) v[K.AI.equip] = 1;
      // 一人でできる：チームでやるものは いいえ
      if (v[K.AI.solo] === 2 && v[K.AI.team] === 1) v[K.AI.solo] = 0;
      // お金がかかる：お店で買えるものは はい
      if (v[K.AI.cost] === 2 && v[K.AI.store] === 1) v[K.AI.cost] = 1;
      // 人によって答えが割れるもの：果物・野菜は「生き物？」「人が作った？」に 部分的にそう（育てた作物）
      var part = {};
      if ((ck === 'fru' || ck === 'veg') && !explicit.liv) { v[K.AI.liv] = 2; part[K.AI.liv] = 'py'; }
      if ((ck === 'fru' || ck === 'veg') && !explicit.made) { v[K.AI.made] = 2; part[K.AI.made] = 'py'; }
      if ((ck === 'fru' || ck === 'veg') && v[K.AI.pla] === 2) v[K.AI.pla] = 1;   // 植物由来
      if (ck === 'pla' && names[0] === 'いね' && !explicit.made) { v[K.AI.made] = 2; part[K.AI.made] = 'py'; }
      // 自然にあるもの ＝ 人が作ったものの反対
      if (!explicit.natural) { var mv = v[K.AI.made]; v[K.AI.natural] = part[K.AI.made] ? 2 : mv === 1 ? 0 : mv === 0 ? 1 : 2; if (part[K.AI.made]) part[K.AI.natural] = 'py'; }
      var w = { part: part, id: db.words.length, w: names[0], al: names, n: names.map(K.normL), cat: ck, catName: C.name, size: size, diff: diff, v: v };
      var clash = w.n.filter(function (x) { return db.byNorm[x] != null; });
      if (clash.length) { db.dropped.push({ w: names[0], why: 'name clash ' + clash.join(',') + ' with ' + db.words[db.byNorm[clash[0]]].w }); return; }
      w.n.forEach(function (x) { db.byNorm[x] = w.id; });
      db.words.push(w); db.cats[ck].words.push(w.id);
    });
  });
  db.N = db.words.length;
  K.addFacts(db, facts || root.SK_FACTS); K.addNouns(db);
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
        alts.slice().forEach(function (a) { var b = a.replace(/を/g, ''); if (b !== a && b.length >= 3 && alts.indexOf(b) < 0) alts.push(b); });   // 「皮をむ」→「皮む」（話しことばは を を落とす）
        if (alts.length) { alts.neg = neg; w.facts.push(alts); }
      });
    });
  });
  db.words.forEach(function (w) { if (!w.facts.length) db.factMiss.push(w.w); });
};
// 質問文 t（normL済み）に お題 wid の「関係することば」が出てくるか → [{pos, end}]
// 書き方のゆれをそろえた形（ー・小さい字・を→お など）と、元の位置への対応
function fzMap(t) {
  var s = '', map = [];
  for (var i = 0; i < t.length; i++) { var c = t[i]; if (c === 'ー' || c === '〜' || c === '~') continue; var f = K.fz(c); if (!f) continue; s += f; map.push(i); }
  map.push(t.length); return { s: s, map: map };
}
var FZC = {};
function fzc(x) { return FZC[x] || (FZC[x] = K.fz(x).replace(/[ー〜~]/g, '')); }
K.factHits = function (db, wid, t) {
  var out = [], fs = db.words[wid].facts || [], F = null;
  for (var i = 0; i < fs.length; i++) {
    var hit = false;
    for (var j = 0; j < fs[i].length; j++) { var k = t.indexOf(fs[i][j]); if (k >= 0) { out.push({ pos: k, end: k + fs[i][j].length, s: fs[i][j], neg: !!fs[i].neg }); hit = true; break; } }
    if (hit) continue;
    if (!F) F = fzMap(t);
    for (j = 0; j < fs[i].length; j++) { var g = fzc(fs[i][j]); if (g.length < 2) continue; k = F.s.indexOf(g); if (k >= 0) { out.push({ pos: F.map[k], end: F.map[k + g.length - 1] + 1, s: fs[i][j], neg: !!fs[i].neg }); break; } }
  }
  return out;
};
K.ans = function (db, wid, ai) { return db.words[wid].v[ai]; };   // 1/0/2
K.ANS_TXT = { y: 'はい', n: 'いいえ', u: 'わからない', py: '部分的にそう', pn: '部分的に違う', sp: 'はい、でも もっと具体的に' };
K.ANSWERS = ['y', 'n', 'u', 'py', 'pn', 'sp', 'correct'];
// おだいばんが 文字や声で答えたとき（人はよく あいまいに答える：「部分的にそう」「はいとは言いづらい」「もっと具体的に」）
//  y/n/u/correct に加えて py＝だいたいはい（一部・場合による）、pn＝ちょっとちがう（言いづらい・全部ではない）、sp＝はい、でも もっと具体的に（上位の なかま）
K.parseAnswer = function (t) {
  var s = K.normL(String(t || '')).replace(/[、。,.!！…・〜~ー\s]/g, '');
  if (!s) return null;
  s = s.replace(/^(家|いえ|イエ)(です|だよ|でーす)?/, 'いいえ$2');   // 音声入力で「いいえです」が「家です」になる
  if (/^(せいかい|正解|あたり|当たり|大正解|だいせいかい)/.test(s)) return 'correct';
  if (/(具体的|ぐたいてき|もっとくわしく|もっと詳しく|もうすこしくわしく)/.test(s) && !/(ちがう|違う|いいえ)?(もっと)?(しんぷる|シンプル)/.test(s)) return /^(いいえ|ちがう|違う|ちがいます)/.test(s) && !/(すぽーつ|なかま|仲間|ちかい|近い)/.test(s) ? 'sp' : 'sp';
  if (/(概念|がいねん)/.test(s) && !/^(はい|いいえ)/.test(s)) return 'u';   // 「その概念ではない」＝質問がかみあわない
  if (/(部分的|ぶぶんてき|一部|いちぶ)(に|は)?(違|ちが)/.test(s)) return 'pn';
  var neg0 = /^(いいえ|いや|ちがう|違う|ちがいます|違います|no|のー|ううん|ぜんぜん|全然)/.test(s);
  if (/(言いづら|いいづら|言いにく|いいにく|とは言えない|とはいえない|とは言いきれ|とはいいきれ|すべてではない|全てではない|全部ではない|ぜんぶではない|ちょっとちがう|ちょっと違う|すこしちがう|少し違う|ちかいけど|近いけど|ちかい|近い|おしい|惜しい|メインではない|めいんではない|メインじゃない|めいんじゃない|9割いいえ|9わりいいえ|ではない|じゃない)/.test(s)) return 'pn';
  if (/(部分的|ぶぶんてき|一部|いちぶ|場合による|ばあいによる|ものによる|おおむね|だいたい|大体|ほぼ|ある意味|あるいみ|半分|はんぶん|ときどき|時々|たまに|ことがある|こともある|けど|けれど|でも|要素による|ようそによる|まあはい|まぁはい|9割はい|9わりはい)/.test(s)) return neg0 ? 'pn' : 'py';
  if (neg0) return 'n';
  if (/^(はい|うん|そう|yes|いえす|そうです|そのとおり|その通り|あってる|合ってる)/.test(s)) return 'y';
  if (/^(わからない|わかりません|わかんない|びみょう|微妙|どちらとも|どっちとも|むずかしい|難しい|なんとも)/.test(s) || /(わからない|わかんない)/.test(s)) return 'u';
  return null;
};
K.code = function (x) { return x === 1 ? 'y' : x === 0 ? 'n' : 'u'; };

// ---------- 自由入力の質問を読む ----------
// 戻り値：{ t:'attr', a, neg, also:[{a,neg}] }（特ちょうだけで説明できる質問）
//       | { t:'fact', text, a?, neg? }（特ちょう以外のことばを含む質問：お題ごとの「関係することば」で答える。なければ わからない）
//       | { t:'guess', w:単語id or -1, text } | { t:'none' }
var PFX = /^(ねえ|ねぇ|えっと|えーと|じゃあ|では|それって|それは|それ|あれは|おだいは|お題は|こたえは|答えは|もしかして|ひょっとして|たぶん|ずばり|ズバリ|すばり|ますたー|まずは|つぎに|次に)+/;
function negAfter(t, end) {   // 一致した語の すぐ後ろが 否定 か
  var rest = t.slice(end, end + 9);
  if (/^(.{0,2})(ないぞう|ないふ)/.test(rest)) return false;
  var m = rest.match(/^(.{0,4}?)(じゃない|じゃなく|ではない|ではなく|ない|なく|ません|ず[？?]?$|ぬ[？?]?$)/); if (!m) return false;
  var pre = t.slice(0, end) + m[1], after = rest.slice(m[0].length), w = m[2];
  // 「鳴く」「泣く」の なく（わんって なく？）は 否定ではない
  if (w === 'なく' && !/(く|で|じゃ|は|も|し|け|せ|れ|ら|め|べ|ま)$/.test(pre)) return false;
  // 「ない」のあとが ことばの続き（いろいろないろ／ないしょ）なら 否定ではない
  if (w === 'ない' && after && !/^(の|です|か|よ|ね|[？?!！]|けど|って|でしょ|んだ|もの|こと|じゃ|と|ん|わ|ぞ|さ|や|し|から|ほう|方)/.test(after)) return false;
  if (w === 'ない' && /(いろいろ|おおき|大き|ちいさ|小さ|きれい|へん|みん|すく|少|あぶ|危|おさ|せつ|あど|かい|うち|まん|ばん)$/.test(pre) && !/(く|で|じゃ|は)$/.test(pre)) return false;
  return true;
}
function sizeRule(t) {   // 大きさの言い回し → s1/s2/s3（span も返す）
  var big = /(大き|おおき|おっき|でか|でっか|長身|巨大|きょだい)/, small = /(小さ|ちいさ|ちっちゃ|ちっさ|ちびっ)/;
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
// 「ぞうより大きい？」：お題ずかんの別の語と 大きさを くらべる
function sizeCmp(db, t) {
  var m = t.match(/^(.+?)(より|よりも|とくらべて|と比べて)(も)?(大き|おおき|おっき|でか|でっか|小さ|ちいさ|ちっちゃ|ちっさ)(い|く|な)?(です|の|か|かな)*$/); if (!m) return null;
  if (/^(家|いえ|建物|たてもの|びる|ひと|人|人間|にんげん|大人|おとな|自分|じぶん|手|て|手のひら|てのひら|わたし|ぼく)$/.test(m[1])) return null;
  var id = db.byNorm[m[1]]; if (id == null) id = K.nearName(db, m[1]); if (id == null || id < 0) return null;
  return { t: 'cmp', w: id, big: /^(大き|おおき|おっき|でか|でっか)/.test(m[4]) ? 1 : 0 };
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
  '食べる たべる 食べます たべます 飲む のむ 飲みます のみます の中 相手 いない いません ありません なかった かける お ご 名前 なまえ たぐい 類 るい 製 せい らしい 時期 じき として 自分 じぶん 人気 にんき どこか 見る 見られる 見える 見かける みる みえる 来た きた 来る くる 生えてる はえてる 生えて 出る でる 出ます でます 出す だす 書いてある かいてある 書いて ついてる ついている 付いてる 浮かんでる 浮かぶ うかんでる 育つ そだつ 入る はいる 入ってる はいってる 入って 買える 治す なおす さす 人 ひと すむ すんでる すんでいる すんでいます くらす くらしてる 住む 住んでる 住んでいる 暮らす 暮らしてる 生まれ うまれ だったりする だったり したりする めっちゃ めちゃ めちゃくちゃ すっごく すっごい すごい すんごく ちょー とっても かなり ほんと ていう という っていう てる ている ています ちゃう じゃう もう まだ 色 いろ 形 かたち').split(' ').map(function (x) { return K.normL(x); }).filter(Boolean);
var FWSET = {}, FWMAX = 0; FW.forEach(function (x) { FWSET[x] = 1; if (x.length > FWMAX) FWMAX = x.length; });
var INFL = /^(させる|られる|れる|せる|かった|くない|くて|ければ|ません|ました|ます|まし|ない|なく|って|った|ている|てる|いて|いた|える|ける|げる|べる|める|れ|る|く|ぐ|ぶ|む|う|つ|す|い|き|ぎ|び|み|り|ち|し|け|げ|べ|め|え|せ|て|た|ん|っ|そう)+/;
// 活用語尾をつけてよい「語幹」（漢字で終わる・かなの動詞/形容詞の語幹）。「たいや＋き」のような名詞には つけない
var STEMEND = /([\u4e00-\u9fff]|およ|もぐ|あそ|なげ|ひか|うご|うごか|あま|から|すっぱ|にが|つめた|あたたか|あったか|やわらか|おも|おもた|かた|あぶな|こわ|かわい|まる|なが|ほそ|ひえ|もえ|ぬれ|たべ|たべられ|たべれ|のめ|のれ|もて|はこべ|よめ|よん|にぎ|あら|とべ|とん|とぶ|さむ|あつ|あか|あお|くろ|しろ|きいろ|ちゃいろ|もちはこ|はこ|うごけ|およい|とんで|しましま|うるさ|おおき|でか|でっか|ちいさ|ちっちゃ|ちっさ|いきて|うごけ|のれま|のめま|たべられ|ひかる|ひかり|さわ|かる)$/;
var VEND = /^(る|う|ぶ|つ|む|く|す|ぐ|える|べる|れる|ける|める|げる|せる|って|った|ってる|ます|ません|ない|ている|てる|れる|られる|えない|べない|らない|わない|たない|ばない|まない|かない)$/;
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
    else if (i > 0 && cov[i - 1] && j === t.length && VEND.test(seg)) { }   // 文の終わりの 活用語尾（「つか＋う」「はし＋る」）
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
var SIMKIND = { person: 1, ani: 1, bird: 1, fish: 1, bug: 1, pla: 1, veh: 1, food: 1, building: 1, tool: 1, liv: 1 };
// ふつうの名詞（この中から 特ちょうの語が はじまっていたら、その一致は使わない）
var NOUNS0 = 'さかな おとな にんげん おかね ひこうき かなづち あかちゃん おなか せなか まなか かながわ たまご たまねぎ なかま なかみ ながぐつ くちばし はなび はなし あしもと おもちゃ くだもの のりもの たべもの のみもの いきもの きもの ゆきだるま おまつり やさい しろくま あおむし くろねこ あかとんぼ しかく さんかく まるた あまぐ あまど からだ かかと あたま おしり しっぽ からす かがみ かみなり すいか きつね おにぎり'.split(' ');
var NOUNSET = null;
function insideNoun(t, pos, len) {
  if (pos === 0 || !/[\u3041-\u3093]/.test(t[pos - 1]) || !/^[\u3041-\u3093ー]+$/.test(t.slice(pos, pos + len))) return false;
  if (!NOUNSET) { NOUNSET = {}; NOUNS0.forEach(function (x) { NOUNSET[K.normL(x)] = 1; }); }
  for (var a = Math.max(0, pos - 5); a < pos; a++) for (var b = pos + 1; b <= Math.min(t.length, a + 7); b++) if (NOUNSET[t.slice(a, b)] && t.slice(a, b).indexOf(t.slice(pos, pos + len)) < 0) return true;
  return false;
}
K.addNouns = function (db) { if (!NOUNSET) { NOUNSET = {}; NOUNS0.forEach(function (x) { NOUNSET[K.normL(x)] = 1; }); } db.words.forEach(function (w) { w.n.forEach(function (x) { if (x.length >= 3 && /^[\u3041-\u3093ー]+$/.test(x)) NOUNSET[x] = 1; }); }); };
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
  var r0 = parse0(db, text);
  if (r0.t === 'fact') {   // 「ながーい」「おっきーい」：ひらがなの間の のばし棒を とって もう一度
    var t2 = K.okuri(String(text || '')).replace(/([\u3041-\u3093])[ー〜~]+(?=[\u3041-\u3093？?]|$)/g, '$1');
    if (t2 !== K.okuri(String(text || ''))) { var r2 = parse0(db, t2); if (r2.t === 'attr') return r2; }
  }
  return r0;
};
function parse0(db, text) {
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
  var cmp = sizeCmp(db, t); if (cmp) return cmp;
  var ko = t.match(/^(.+?)(のなかま|の仲間|のいっしゅ|の一種|のしゅるい|の種類|みたいなもの|みたいなやつ|ににてる|に似てる|のよう)(です|なの|か|かな|だよね|でしょ)*$/);   // 「でんしゃのなかま？」
  if (ko) { var kw = db.byNorm[ko[1]]; if (kw == null) kw = K.nearName(db, ko[1]); if (kw != null && kw >= 0) return { t: 'kindof', w: kw, text: t }; }
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
      if (!inBlock && SIMKIND[K.ATTRS[c.a].id] && /^(に|と)?(にて|似て|にた|似た|そっくり|みたい|っぽ|ぽい)|^(の)?(ような|よう)/.test(t.slice(idx + c.s.length))) inBlock = true;   // 「人間に似てる？」はその物ではない
      if (!inBlock && insideNoun(t, idx, c.s.length)) inBlock = true;   // 「さかながいる」の「ながい」
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
    if (/(もの|の|やつ|のも|ものも)もある|もあるの|(^|[^お])(なか|中身|なかみ)(は|が|の|って)|ものによる|しゅるいによる|種類による/.test(t)) var some = 1;
    return { t: 'attr', some: some ? 1 : 0, kana: K.ATTRS[h.a].id === 'fly' && !/[飛空]/.test(t) ? 1 : 0, a: h.a, neg: h.neg, loose: !!h.loose, size: h.size ? 1 : 0, also: main.slice(1).filter(function (x) { return !x.gen; }).map(function (x) { return { a: x.a, neg: x.neg }; }) };
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
    if (w.n.some(function (x) { return x.length >= 2 && K.factHits(db, secret, x).some(function (h) { return h.s === x; }); })) return /^(hob|spo)$/.test(w.cat) && db.words[secret].cat !== w.cat ? 'sp' : 'u';   // 「テレビゲーム？」→ マインクラフトなら「はい、もっと具体的に」
    var sw0 = db.words[secret]; if (sw0.n.some(function (x) { return x.length >= 2 && K.factHits(db, p.w, x).some(function (h) { return h.s === x; }); })) return 'u';   // 逆向き（「けっこんしき」に「ゆびわ」）
    return 'n';
  }
  if (p.t === 'attr') {
    // ただ「大きい？」「小さい？」は、人くらいの大きさなら どちらとも言えない
    if (p.loose && db.words[secret].size === 2) return 'u';
    // ひらがなの「とぶ」は 跳ぶ（ジャンプ）かもしれない
    if (p.kana && K.ATTRS[p.a].id === 'fly' && K.factHits(db, secret, '跳ぶじゃんぷ').length) return 'u';
    var pt = db.words[secret].part && db.words[secret].part[p.a];
    if (pt && !(p.also && p.also.length)) return p.neg ? (pt === 'py' ? 'pn' : 'py') : pt;   // 「りんごは生き物？」→ 部分的にそう
    var all = [{ a: p.a, neg: p.neg }].concat(p.also || []), got = {};
    for (var i = 0; i < all.length; i++) {
      var x = db.words[secret].v[all[i].a]; if (x === 2) { got.u = 1; continue; }
      var yes = x === 1; if (all[i].neg) yes = !yes; got[yes ? 'y' : 'n'] = 1;
    }
    if (got.y && got.n) return p.loose && !p.neg && p.also && p.also.length === 1 && !p.also[0].neg && K.ATTRS[p.also[0].a].g === 'kind' && !got.u ? 'pn' : 'u';   // 「大きい動物？」でうさぎ：一部だけ あたり → ちょっと ちがう
    if (got.n && p.some) return 'u';   // 「すっぱいのもある？」「中は黄色？」→ ずかんの「いいえ」では言い切れない
    return got.n ? 'n' : got.u ? 'u' : 'y';
  }
  if (p.t === 'kindof') {   // 別のお題「の仲間？」：関係ることばに その語があれば はい、なければ わからない
    if (p.w === secret) return 'y';
    var ws = db.words[p.w], me = db.words[secret];
    if (ws.n.some(function (x) { return x.length >= 2 && K.factHits(db, secret, x).length; }) || me.n.some(function (x) { return x.length >= 2 && K.factHits(db, p.w, x).length; })) return 'y';
    return 'u';
  }
  if (p.t === 'cmp') {   // 大きさ 1〜4（0=形がない）で くらべる。同じ大きさの段なら わからない
    var a1 = db.words[secret].size, b1 = db.words[p.w].size; if (!a1 || !b1 || a1 === b1 || p.w === secret) return 'u';
    return (a1 > b1) === !!p.big ? 'y' : 'n';
  }
  if (p.t === 'fact') {
    var tr = K.factTruth(db, secret, p);
    var sw = db.words[secret].v, SEAS = ['spring', 'summer', 'autumn', 'winter'];
    if (p.a != null && !p.neg && SEAS.indexOf(K.ATTRS[p.a].id) >= 0 && sw[p.a] === 0 && SEAS.some(function (x) { return sw[K.AI[x]] === 1; }) && !/(にも|でも|も|いつでも|一年中|いちねんじゅう)/.test(p.text)) return 'n';   // 季節もの（こたつ）に「夏に使う？」→ いいえ
    if (tr === 1 && /(ひるま|昼|ひるに|ひるは|朝|あさに|あさは)/.test(p.text) && sw[K.AI.night] === 1) return 'u';
    if (p.a != null && tr !== 2 && /^(spring|summer|autumn|winter|night|kick)$/.test(K.ATTRS[p.a].id)) {   // 文の中の特ちょうと 関係ることばの答えが割れる → わからない
      var xa = db.words[secret].v[p.a]; if (xa !== 2) { var ya = (xa === 1) !== !!p.neg; if (ya !== (tr === 1)) return 'u'; }
    }
    if (tr === 1 && isHyper(db, secret, p.text)) return 'sp';   // 「格闘技？」とだけ聞かれて、それが お題の“上のなかま”なら「はい、もっと具体的に」
    return tr === 1 ? 'y' : tr === 0 ? 'n' : 'u';
  }
  return 'u';
};
// 質問がことば1つだけ（「かくとうぎ？」）で、それが お題の なかま（facts の〜系・〜の一種）なら true
var HYPER = /^(かくとうぎ|格闘技|ぶどう|武道|きゅうぎ|球技|すぽーつ|ういんたーすぽーつ|まりんすぽーつ|げーむ|ぼーどげーむ|ゆうぐ|遊具|がっき|楽器|だがっき|打楽器|かでん|家電|ぶんぼうぐ|文房具|のりもの|乗り物|どうぶつ|動物|ほにゅうるい|哺乳類|はちゅうるい|爬虫類|こんちゅう|昆虫|くだもの|果物|やさい|野菜|おかし|お菓子|わしょく|和食|ようしょく|洋食|ちゅうかりょうり|中華料理|めんるい|麺類|ぎょうじ|行事|おまつり|祭り|しゅみ|趣味|あそび|遊び|うんどう|運動|だげきけい|打撃系|くみわざ|組み技)$/;
function isHyper(db, wid, text) {
  var core = K.normL(text).replace(/(ですか|なの|かな|だよね|でしょ|ですね|系|けい|のなかま|の仲間|のいっしゅ|の一種)+$/, '');
  return HYPER.test(core) && K.factHits(db, wid, core).length > 0;
}
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
// NPC が口にする質問文（同じ属性でも言い回しをいろいろ変える。手書き＋ひな形）
K.PHRASES = {
  liv: ['それって 生き物？', '生きてるもの？', '命があるもの？', 'いきもの だったりする？'], ani: ['動物？', '動物のなかま？', 'どうぶつ だったりする？', '動物系？'],
  bird: ['鳥？', '鳥のなかま？', 'とり だったりする？'], fish: ['魚？', 'お魚のなかま？', '魚っぽいもの？'], bug: ['虫？', '虫のなかま？', 'むし だったりする？'],
  pla: ['植物？', '植物のなかま？', '植物っぽいもの？'], person: ['人のこと？', '人間？', '人のこと？'], job: ['仕事？', '職業のこと？', 'お仕事の名前？'],
  food: ['食べ物？', 'それって 食べ物？', '食べるもの？', 'ごはん系？'], edible: ['食べられる？', 'それ、食べられる？', '口に入れて食べられる？'], drink: ['飲み物？', '飲めるもの？', 'のみもの だったりする？'],
  fruit: ['果物？', 'くだもの？', 'フルーツ？'], veg: ['野菜？', 'やさい？', 'お野菜のなかま？'], dish: ['料理？', 'りょうりの名前？', 'お店のメニューにありそう？'], sweets: ['お菓子？', 'デザート？', 'おやつに食べる？'],
  veh: ['乗り物？', '人が乗れるもの？', 'のりもの だったりする？'], made: ['人が作ったもの？', '人工のもの？', '自然のものじゃなくて 作られたもの？'],
  tool: ['道具？', '何かに使う道具？', 'つかう道具？'], elec: ['電気で動く？', '電気を使う？', 'コンセントや電池がいる？'], place: ['場所？', '行ける場所？', 'どこかの場所の名前？'], building: ['建物？', 'たてもの？'],
  sport: ['スポーツ？', '運動のなかま？', '体を動かして競うもの？'], event: ['行事？', 'イベント？', '年中行事とか？'], nature: ['自然のもの？', '自然にあるもの？'],
  s1: ['手のひらより大きい？', '片手で持てるより大きい？', 'ポケットに入らないくらい？'], s2: ['人より大きい？', '大人より大きい？', '人間よりでかい？'], s3: ['家より大きい？', '建物よりでかい？'],
  carry: ['手で持ち運べる？', '持って歩ける？'], heavy: ['重い？', 'ずっしり重い？'], round: ['丸い？', 'まるい形？'], square: ['四角い？', '四角っぽい？'], long: ['細長い？', 'ながっぽそい？'],
  soft: ['やわらかい？', 'ふにゃっとしてる？'], hard: ['かたい？', 'カチカチ？'],
  red: ['赤い？', '赤色？'], white: ['白い？', '白っぽい？'], black: ['黒い？', '黒っぽい？'], yellow: ['黄色い？', 'きいろっぽい？'], green: ['緑色？', 'みどりっぽい？'], blue: ['青い？', '青っぽい？'], brown: ['茶色い？', '茶色っぽい？'], pink: ['ピンク色？', 'ピンクっぽい？'],
  home: ['家にある？', 'ふつうの家にある？', 'うちにもある？'], store: ['お店で買える？', '売ってる？', 'お店で売ってそう？'], outside: ['外にある？', '外で見かける？'], kitchen: ['台所にある？', 'キッチンで使う？'],
  bath: ['お風呂や洗面所にある？', 'お風呂で使う？'], school: ['学校にある？', '学校で見る？'], sea: ['海にある？', '海にいる？', '海に関係ある？'], sky: ['空にある？', '空で見る？'], mount: ['山や森にある？', '山にいる？'],
  city: ['町にある？', '町なかで見る？'], farm: ['畑や牧場にある？', '農家さんに関係ある？'], zoo: ['動物園にいる？', '動物園や水族館で見られる？'],
  japan: ['日本っぽいもの？', '和風？'], foreign: ['外国から来たもの？', '外国っぽい？'], move: ['動く？', '自分で動く？'], legs: ['足がある？', 'あしある？'], fur: ['毛が生えてる？', 'ふさふさ？'],
  fly: ['空を飛ぶ？', '飛べる？'], swim: ['泳ぐ？', '水の中を泳げる？'], light: ['光る？', 'ピカッと光る？'], sound: ['音が出る？', '音がする？', '鳴る？'],
  hot: ['熱い？', 'あったかい？'], cold: ['冷たい？', 'ひんやりしてる？'], sweet: ['甘い？', 'あまーい？'], spicy: ['辛い？', 'ピリッとする？'], sour: ['すっぱい？'], bitter: ['苦い？'],
  water: ['水に関係ある？', '水を使う？'], fire: ['火に関係ある？', '火を使う？'], wood: ['木でできてる？', '木製？'], metal: ['金属でできてる？', '鉄とか金属？'], paper: ['紙でできてる？', '紙？'], cloth: ['布でできてる？', '布っぽい？'], glass: ['ガラスでできてる？'],
  wear: ['身につけるもの？', '着たりつけたりする？'], write: ['字を書くのに関係ある？', '書くときに使う？'], play: ['遊ぶもの？', '遊びに使う？'], kids: ['子どもが好き？', '子どもに人気？'],
  music: ['音楽に関係ある？', '音楽で使う？'], danger: ['危ない？', '気をつけないと危ない？'], wheels: ['タイヤがある？', '車輪がついてる？'], pet: ['ペットとして飼える？', 'ペットにできる？'],
  tail: ['しっぽがある？'], horn: ['角がある？'], stripe: ['しま模様？', 'しましま？'], carn: ['肉食？', 'ほかの動物を食べる？'], tall: ['背が高い？', '高さがある？'],
  ball: ['ボールを使う？', 'ボール使う？'], team: ['チームでやる？', '何人かでチームになる？'], racket: ['ラケットを使う？'], kick: ['足でける？'], hand: ['手を使う？', '手でやる？'], throw: ['投げる？'],
  fight: ['相手と戦う？', '対戦する？'], snow: ['雪に関係ある？'], head: ['頭や顔につける？', '頭につける？'], feet: ['足にはく？'], contain: ['中に物を入れる？', '何かを入れておくもの？'],
  read: ['読むもの？'], rice: ['お米からできてる？', 'お米を使う？'], noodle: ['めん類？', '麺？'], bread: ['パンや小麦粉を使う？'], spoon: ['スプーンで食べる？'], chop: ['おはしで食べる？'], handeat: ['手で持って食べる？'],
  root: ['土の中で育つ？'], cute: ['かわいい？'], money: ['お金に関係ある？'], cost: ['お金がかかる？'], solo: ['一人でできる？', 'ひとりでもできる？'], equip: ['道具を使う？'],
  sleep: ['寝るときに使う？'], clean: ['そうじや洗うのに使う？'], cut: ['物を切る？'], eatuse: ['食べるときに使う？'], hospital: ['病院にある？', '病院に関係ある？'],
  spring: ['春に関係ある？', '春っぽい？'], summer: ['夏に関係ある？', '夏っぽい？'], autumn: ['秋に関係ある？', '秋っぽい？'], winter: ['冬に関係ある？', '冬っぽい？'], night: ['夜に関係ある？', '夜に見る？']
};
var PRE_ANY = ['', '', '', 'ねえ、', 'ちなみに ', 'えっと、', 'もしかして '], PRE_Y = ['じゃあ ', 'ってことは… ', 'なるほど、じゃあ ', 'それなら '], PRE_N = ['じゃあ ', 'ふむ…なら ', 'そっか、じゃあ '];
// ai の言い回しを1つ（used＝もう言った文。prev＝直前の答え 'y'/'n'/…）
K.phrase = function (ai, r, used, prev) {
  var a = K.ATTRS[ai], ph = (K.PHRASES[a.id] || []).slice(); if (ph.indexOf(a.q) < 0) ph.push(a.q);
  if (!r) return ph[0];
  var fresh = used ? ph.filter(function (x) { return !used[x]; }) : ph; if (!fresh.length) fresh = ph;
  var q = fresh[Math.floor(r() * fresh.length)];
  if (used) used[q] = 1;
  var pre = prev === 'y' && r() < 0.45 ? PRE_Y : prev === 'n' && r() < 0.35 ? PRE_N : PRE_ANY;
  return (pre[Math.floor(r() * pre.length)] + q).replace(/^(\S+) それって/, '$1それって');
};
if (typeof module !== 'undefined' && module.exports) module.exports = K; else root.SKB = K;
})(this);
