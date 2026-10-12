/* しってるっこ：お題データ④（追加のお題。既存カテゴリに足す）
 * 1行：なまえ/べつの書き方 大きさ むずかしさ 特ちょう | 関係ることば */
this.SK_TOPICS = this.SK_TOPICS || {};
this.SK_FACTS = this.SK_FACTS || [];
(function (T, F) {
function add(k, s) {
  var it = [], fa = [];
  s.trim().split('\n').forEach(function (l) { var p = l.split('|'); it.push(p[0].trim()); if (p[1] && p[1].trim()) fa.push(p[0].trim().split(' ')[0] + ': ' + p[1].trim()); });
  T[k].items += '\n' + it.join('\n') + '\n'; F.push('\n' + fa.join('\n') + '\n');
}
add('ani', `
いのしし/イノシシ/猪 2 n fur brown mount japan danger | 牙/きば 山/やま 突進/とっしん ぼたん鍋/ぼたんなべ 干支/えと
チーター 2 n fur yellow foreign carn tail | 速い/はやい 走る/はしる サバンナ 模様/もよう
サイ 3 n gray heavy foreign horn | 角/つの 重い/おもい サバンナ アフリカ
チンパンジー 2 n fur black foreign | 猿/さる バナナ 賢い/かしこい
やぎ/ヤギ/山羊 2 e fur white farm horn | 牧場/ぼくじょう 紙/かみ 乳/ちち ひげ
アライグマ 1 n fur gray foreign tail | しま模様のしっぽ 洗う/あらう
ハリネズミ 1 n pet cute brown | 針/はり とげ 丸まる/まるまる
アルマジロ 1 h foreign hard | 甲羅/こうら 丸まる/まるまる
フェレット 1 h fur pet home | 細長い/ほそながい ペット
ゾウガメ 2 h foreign hard legs | 甲羅/こうら 長生き/ながいき ガラパゴス
カピバラ 2 n fur brown foreign zoo cute | 温泉/おんせん ねずみ 大きい/おおきい
レッサーパンダ 1 n fur red brown zoo cute tail | 立つ/たつ しっぽ
ホッキョクグマ/シロクマ 3 n fur white carn danger cold snow | 北極/ほっきょく 氷/こおり 雪/ゆき
トナカイ 3 n fur brown horn cold snow winter | サンタ そり クリスマス
ヒョウモントカゲモドキ 1 h pet home | トカゲ 爬虫類/はちゅうるい
トカゲ 1 n -fur tail outside | 爬虫類/はちゅうるい しっぽ 切れる/きれる
ヤモリ 1 n -fur home night | 壁/かべ 家/いえ
カメレオン 1 n green -fur foreign | 色が変わる/いろがかわる 舌/した
ビーバー 2 n fur brown water swim foreign | ダム 木/き 歯/は
モモンガ 1 h fur mount cute fly | 飛ぶ/とぶ 夜/よる
`);
add('bird', `
ペリカン 2 h white foreign zoo swim | くちばし 魚/さかな
オオハシ 1 h foreign zoo | くちばし 南米/なんべい
ハチドリ 1 h foreign | 小さい/ちいさい 蜜/みつ
ウグイス 1 n green spring sound japan | ホーホケキョ 梅/うめ 春/はる
キジ 2 h japan mount | 桃太郎/ももたろう 国鳥/こくちょう
ハクチョウ/白鳥 2 n white swim water winter | 湖/みずうみ バレエ
カワセミ 1 h blue water | 川/かわ 魚/さかな
シマエナガ 1 h white cute snow | 北海道/ほっかいどう 雪/ゆき
`);
add('sea', `
タツノオトシゴ 1 h zoo | 馬/うま オス 卵/たまご
チンアナゴ 1 h zoo long | 砂/すな 水族館/すいぞくかん
マンボウ 3 h zoo round | 大きい/おおきい 平たい/ひらたい
ウツボ 2 h long danger | 岩/いわ 歯/は
エイ 2 n zoo | 平たい/ひらたい しっぽ
シャチ 3 n black white zoo carn | イルカ ショー
ジンベエザメ 3 n zoo heavy | 大きい/おおきい 水族館/すいぞくかん
アンコウ 2 h edible winter | 鍋/なべ 深海/しんかい ちょうちん
フグ 1 n edible danger round | 毒/どく ふくらむ
サンマ 1 n edible autumn long | 秋/あき 焼く/やく
イワシ 1 n edible | 群れ/むれ 缶詰/かんづめ
カツオ 2 n edible | 鰹節/かつおぶし たたき
ナマコ 1 h edible soft | 海底/かいてい
ホタテ 1 n edible hard | 貝/かい
`);
add('bug', `
ミノムシ 1 h | 葉/は 枝/えだ ぶら下がる/ぶらさがる
アメンボ 1 h water | 水の上/みずのうえ 池/いけ
ダンゴムシ 1 e gray round kids | 丸まる/まるまる 石の下/いしのした
ムカデ 1 n danger long | 足が多い/あしがおおい 毒/どく
クモの巣 0 h | 糸/いと クモ
イモムシ 1 n green soft | 葉っぱ/はっぱ ちょう
ハエ 1 e black fly home | うるさい ゴミ/ごみ
カメムシ 1 h green fly | くさい におい
`);
add('pla', `
うめ/梅 3 n white pink spring japan wood | 梅干し/うめぼし 梅雨/つゆ
ふじ/藤 3 h japan spring | 紫/むらさき 棚/たな
ラベンダー 1 n pink | 香り/かおり 北海道/ほっかいどう
カーネーション 1 n red pink | 母の日/ははのひ
ポインセチア 1 h red winter | クリスマス
すすき/ススキ 2 h autumn | お月見/おつきみ
シロツメクサ 1 h white green | 四つ葉/よつば
やしのき/ヤシの木/ヤシ 3 n green tall foreign summer wood | ココナッツ 南国/なんこく
もみのき/モミの木 3 h green tall winter wood | クリスマスツリー
ハス/蓮 2 h pink water | 池/いけ れんこん
`);
add('fru', `
グレープフルーツ 1 n yellow sour bitter? | すっぱい
アボカド 1 n green | 種/たね 森のバター
ライチ 1 h white foreign | 皮/かわ
パパイヤ 1 h yellow foreign | 南国/なんこく
ざくろ/ザクロ 1 h red | 種/たね
いちじく/イチジク 1 h | 秋/あき
ドラゴンフルーツ 1 h pink red foreign | サボテン
びわ/ビワ 1 h yellow | 種/たね
`);
add('veg', `
れんこん/蓮根 1 n white root | 穴/あな 煮物/にもの
アスパラガス/アスパラ 1 n green long | 春/はる
オクラ 1 n green long | ねばねば
セロリ 1 n green long bitter | すじ
にんにく/ニンニク 1 n white root | におい 臭い/におい
ゴーヤ 1 n green long bitter summer | 沖縄/おきなわ チャンプルー
かぶ/カブ 1 n white root round | 大きなかぶ
パプリカ 1 n red yellow | ピーマン
`);
add('dish', `
ぎゅうどん/牛丼 0 n rice meat chop hot | 丼/どんぶり 牛肉/ぎゅうにく
かつどん/カツ丼 0 n rice meat chop hot | とんかつ 卵/たまご
とんかつ 0 n meat hot | 豚肉/ぶたにく ソース キャベツ
コロッケ 1 n hot | じゃがいも 揚げ/あげ
グラタン 0 n hot spoon foreign | チーズ オーブン
シチュー 0 n hot spoon white | 牛乳/ぎゅうにゅう 冬/ふゆ
ちゃーはん/チャーハン 0 n rice hot | 卵/たまご 炒め/いため
しゃぶしゃぶ 0 h meat hot japan chop | 鍋/なべ 牛肉/ぎゅうにく
ホットドッグ 1 n bread handeat meat | ソーセージ
タコス 1 h handeat foreign spicy? | メキシコ
ラザニア 0 h foreign hot | チーズ パスタ
ちらしずし/ちらし寿司 0 n rice japan | ひなまつり 酢/す
いなりずし/いなり寿司 1 n rice japan handeat brown | 油揚げ/あぶらあげ きつね
やきそば/焼きそば 0 n noodle hot | ソース お祭り/おまつり
ナポリタン 0 n noodle red | ケチャップ
`);
add('swt', `
クレープ 1 n handeat | 生クリーム/なまくりーむ 原宿/はらじゅく
マカロン 1 h round foreign | フランス
パフェ 1 n cold spoon | アイス 生クリーム/なまくりーむ
カステラ 1 n yellow | 長崎/ながさき
たいやき/たい焼き 1 n hot japan | あんこ 魚の形/さかなのかたち
どらやき/どら焼き 1 n round japan | あんこ ドラえもん
まんじゅう/饅頭 1 n round japan | あんこ
チーズケーキ 1 n | チーズ
ワッフル 1 n square | 格子/こうし
タピオカ 0 n drink | ミルクティー ストロー
`);
add('drk', `
スポーツドリンク 0 n | 汗/あせ 運動/うんどう
サイダー 0 n sweet | 炭酸/たんさん 泡/あわ
みそ汁のだし/だし 0 h japan | かつお 昆布/こんぶ
やさいジュース/野菜ジュース 0 n | 野菜/やさい
カルピス 0 n white sweet | 乳酸菌/にゅうさんきん
ミルクティー 0 n sweet | 紅茶/こうちゃ 牛乳/ぎゅうにゅう
`);
add('veh', `
モノレール 3 n elec | レール
ロープウェイ 3 h elec mount | ゴンドラ ロープ 山/やま
スケートボード/スケボー 1 n wheels play | 板/いた
キックボード 1 n wheels play kids | 足でける
ブルドーザー 3 n | 工事/こうじ 押す/おす
クレーン車 3 n | 吊る/つる 工事/こうじ
ごみしゅうしゅうしゃ/ゴミ収集車 3 n city | ゴミ/ごみ
カヌー 2 h -wheels water | パドル 川/かわ
UFO/ユーフォー 3 h -made? sky fly -wheels | 宇宙人/うちゅうじん 円盤/えんばん
そり 2 n snow winter -wheels -metal? | 雪/ゆき サンタ
じんりきしゃ/人力車 2 h japan -metal? | 浅草/あさくさ 引く/ひく
`);
add('home', `
せんめんき/洗面器 1 n bath round | 水/みず お風呂/おふろ
シャンプー 1 e bath soft | 髪/かみ 泡/あわ
はみがきこ/歯磨き粉 1 n bath sweet? | 歯/は ミント
トイレットペーパー 1 e paper bath? | トイレ 紙/かみ
ティッシュ 1 e paper white | 鼻/はな 紙/かみ
ふでばこ/筆箱 1 n school contain | 鉛筆/えんぴつ
まどがらす/窓ガラス 2 n glass | 窓/まど
ドア/とびら/扉 2 e | 開ける/あける 取っ手/とって
かいだん/階段 3 n | 登る/のぼる 段/だん
カーペット/じゅうたん 2 n cloth soft | 床/ゆか
ざぶとん/座布団 1 n cloth soft japan square | 座る/すわる
しょうじ/障子 2 h paper japan wood | 和室/わしつ
たたみ/畳 2 n japan square | 和室/わしつ い草/いぐさ
ふろしき/風呂敷 1 h cloth japan | 包む/つつむ
かびん/花瓶 1 n glass? contain | 花/はな
うえきばち/植木鉢 1 n contain | 植物/しょくぶつ 土/つち
ハンガーラック 2 h | 服/ふく
つめきり/爪切り 1 n metal cut | 爪/つめ
みみかき/耳かき 1 h long | 耳/みみ
ばんそうこう/絆創膏 1 n | 傷/きず けが
たいおんけい/体温計 1 n hospital | 熱/ねつ 体温/たいおん
ぬいばり/針 1 n metal danger | 糸/いと 縫う/ぬう
いと/糸 1 n long cloth | 縫う/ぬう 針/はり
マッチ 1 n fire danger wood | 火/ひ すって
ライター 1 n fire danger | 火/ひ タバコ
`);
add('elec', `
アイロン 1 n hot cloth | 服/ふく しわ
でんきポット/電気ポット 1 n hot water kitchen | お湯/おゆ
トースター 1 n hot kitchen | パン 焼く/やく
ミキサー 1 h kitchen | ジュース 混ぜる/まぜる
タブレット 1 n screen online | 画面/がめん アプリ
スマートウォッチ 1 h wear screen | 腕/うで 時計/とけい
スピーカー 1 n sound music | 音/おと
プリンター 2 n paper | 印刷/いんさつ 紙/かみ
マウス 1 n | パソコン クリック
キーボード 1 n | パソコン 文字/もじ
ゲームコントローラー/コントローラー 1 h play | ゲーム ボタン
でんたく/電卓 1 n number | 計算/けいさん 数字/すうじ
でんしピアノ 2 h music | 鍵盤/けんばん
かしつき/加湿器 1 h water | 乾燥/かんそう 湿度/しつど
でんわ/電話 1 n sound | 話す/はなす 番号/ばんごう
`);
add('kit', `
おたま/お玉 1 n metal round | スープ すくう
フライがえし/フライ返し 1 h  hot | ひっくり返す/ひっくりかえす
しゃもじ 1 n  rice | ご飯/ごはん よそう
ざる 1 n contain | 水切り/みずきり 麺/めん
ボウル 1 n contain round | 混ぜる/まぜる
あわだてき/泡立て器 1 h metal sweets? | 泡/あわ 卵/たまご
ラップ 1 n  soft | 包む/つつむ 透明/とうめい
アルミホイル 1 n metal paper? | 包む/つつむ 銀色/ぎんいろ
きゅうす/急須 1 h japan | お茶/おちゃ
マグカップ 1 n contain | コーヒー 取っ手/とって
ワイングラス 1 h glass | ワイン
せんぬき/栓抜き 1 h metal drink | 瓶/びん
かんきり/缶切り 1 h metal cut | 缶/かん
すいはんがま/土鍋 1 h  rice hot | ご飯/ごはん 鍋/なべ
`);
add('sta', `
シャープペンシル/シャーペン 1 e long write | 芯/しん
マーカー/蛍光ペン 1 n write | 線/せん 色/いろ
のり/糊 1 n  paper | 貼る/はる くっつく
クリップ 1 n metal | 紙/かみ はさむ
コンパス 1 n metal | 円/えん 描く/かく
ぶんどき/分度器 1 h  round | 角度/かくど
ふせん/付箋 1 n paper | メモ 貼る/はる
えんぴつけずり/鉛筆削り 1 n  cut | 削る/けずる 鉛筆/えんぴつ
じしょ/辞書 1 n paper read | 言葉/ことば 調べる/しらべる
ずかん/図鑑 1 n paper read kids | 写真/しゃしん 調べる/しらべる
まんが/漫画 1 e paper read kids chara | 絵/え 吹き出し/ふきだし
えほん/絵本 1 e paper read kids ?chara | 絵/え 読み聞かせ/よみきかせ
ちず/地図 1 n paper | 道/みち 場所/ばしょ
カッター 1 n cut danger | 刃/は 切る/きる
がようし/画用紙 1 h paper white | 絵/え
`);
add('wear', `
ベルト 1 n long | ズボン 腰/こし
ネックレス 1 n | 首/くび
ピアス/イヤリング 1 n metal | 耳/みみ
ヘルメット 1 n hard head | 頭/あたま 工事/こうじ
レインコート/かっぱ 2 n  water | 雨/あめ
セーター 2 n winter | 毛糸/けいと
パーカー 2 n  head | フード
ジャージ 2 n sport | 体育/たいいく
スーツ 2 n  black | 会社/かいしゃ
ドレス 2 n  cute | パーティー
はかま/袴 2 h japan | 卒業式/そつぎょうしき
げた/下駄 1 h japan wood feet | 鼻緒/はなお
スリッパ 1 n home feet | 部屋/へや
ハイヒール 1 n feet | かかと
サングラス 1 n head summer | 太陽/たいよう
`);
add('toy', `
ルービックキューブ 1 n square | 回す/まわす 色/いろ
プラモデル 1 n  hobby | 組み立て/くみたて
ラジコン 1 n elec wheels | リモコン
レゴ/ブロック 1 n  square | 組み立て/くみたて
たこあげ/凧 2 n sky winter | 糸/いと 風/かぜ お正月/おしょうがつ
ふくわらい/福笑い 1 h japan | お正月/おしょうがつ 顔/かお
すごろく 1 n  paper | サイコロ
サイコロ 1 n square | 数字/すうじ 振る/ふる
ボードゲーム 1 n  ?paper | サイコロ コマ
みずでっぽう/水鉄砲 1 n water summer | 水/みず
ガチャガチャ/ガチャポン 1 n money | カプセル
たまごっち 1 h elec | 育てる/そだてる
フリスビー 1 n round throw | 投げる/なげる 犬/いぬ
スライム 1 n soft | ぷにぷに
`);
add('inst', `
フルート 1 n metal long | 吹く/ふく
サックス/サクソフォン 1 n metal | 吹く/ふく ジャズ
しゃみせん/三味線 1 h japan | 弦/げん
こと/琴 2 h japan wood | 弦/げん お正月/おしょうがつ
ウクレレ 1 n wood | ハワイ
オルガン 2 n | 鍵盤/けんばん
トライアングル 1 n metal | 叩く/たたく 三角/さんかく
タンバリン 1 n round | 振る/ふる
`);
add('spo', `
ソフトテニス 0 h ball racket | 軟式/なんしき ラケット ボール
ビーチバレー 0 h ball team summer sea | 砂浜/すなはま
スキージャンプ 0 h snow winter | ジャンプ
カーリング 0 h winter team | 氷/こおり ストーン
アイスホッケー 0 h winter team | 氷/こおり パック
アーチェリー/弓道/きゅうどう 0 h  equip | 弓/ゆみ 矢/や 的/まと
たいそう/体操 0 n  school | 鉄棒/てつぼう マット 跳び箱/とびばこ
しんたいそう/新体操 0 h  music | リボン フープ
フィギュアスケート 0 n winter | 氷/こおり 回転/かいてん
ボート/ボート競技 0 h water | オール
サイクリング 0 n wheels | 自転車/じてんしゃ
トライアスロン 0 h swim | 水泳/すいえい 自転車/じてんしゃ 走る/はしる
ゲートボール 0 h ball | おじいさん スティック
eスポーツ 0 h screen videogame | ゲーム 大会/たいかい
`);
add('place', `
だいがく/大学 3 n city school | 学生/がくせい
ゆうびんきょく/郵便局 3 n city paper | 手紙/てがみ 切手/きって
ぎんこう/銀行 3 n city money | お金/おかね ATM
デパート 3 n city store | 買い物/かいもの
しょうてんがい/商店街 3 h city store outside japan | お店/おみせ
ショッピングモール 3 n city store tall | 買い物/かいもの
レストラン 3 n city edible | 料理/りょうり 食事/しょくじ
カフェ 3 n city drink? sweet? | コーヒー ケーキ
びよういん/美容院 3 n city cut | 髪/かみ 切る/きる
はくぶつかん/博物館 3 n city tall | 展示/てんじ 恐竜/きょうりゅう
びじゅつかん/美術館 3 n city ?write | 絵/え 展示/てんじ
たいいくかん/体育館 3 n school sport | 運動/うんどう
グラウンド/校庭 3 n school outside | 運動/うんどう
きょうしつ/教室 3 n school | 机/つくえ 黒板/こくばん
トイレ 2 e home water | 便器/べんき
おふろ/お風呂 2 e home water hot bath | 湯船/ゆぶね
だいどころ/台所/キッチン 2 n home kitchen | 料理/りょうり
げんかん/玄関 2 n home | 靴/くつ ドア
にわ/庭 3 n home outside | 花/はな 草/くさ
ベランダ 2 n home outside | 洗濯物/せんたくもの
しんごう/信号 2 n city light elec | 赤/あか 青/あお 黄色/きいろ
ふみきり/踏切 2 n city sound | 電車/でんしゃ
みずうみ/湖 3 n water outside | 水/みず ボート
いけ/池 3 n water outside | 鯉/こい
どうくつ/洞窟 3 h mount | 暗い/くらい 岩/いわ
ジャングル 3 n foreign mount | 木/き 動物/どうぶつ
ピラミッド 3 n foreign | エジプト 三角/さんかく
エッフェル塔 3 n foreign tall metal | パリ フランス
きんかくじ/金閣寺 3 h japan yellow | 京都/きょうと 金色/きんいろ
スカイツリー 3 n japan tall city | 東京/とうきょう 展望台/てんぼうだい
ディズニーランド 3 n kids | ミッキー 遊園地/ゆうえんち
きょうと/京都 3 n japan | 寺/てら 着物/きもの
おきなわ/沖縄 3 n japan sea summer | 海/うみ シーサー
ほっかいどう/北海道 3 n japan snow cold | 雪/ゆき 牧場/ぼくじょう
アメリカ 3 n foreign | 英語/えいご
ちきゅう/地球 3 n -made nature round blue | 宇宙/うちゅう 海/うみ
`);
add('job', `
べんごし/弁護士 2 n  money | 裁判/さいばん 法律/ほうりつ
はいゆう/俳優/役者 2 n screen | ドラマ 映画/えいが
ユーチューバー 2 n screen online | 動画/どうが
プログラマー 2 h screen elec online | パソコン コード
びようし/美容師 2 n  cut | 髪/かみ はさみ
けんちくか/建築家 2 h  building | 建物/たてもの 設計/せっけい
じゅうい/獣医 2 n ani? | 動物/どうぶつ 病院/びょういん
やくざいし/薬剤師 2 h hospital | 薬/くすり
えきいん/駅員 2 n city | 駅/えき 電車/でんしゃ
ゆうびんやさん/郵便屋さん 2 n city | 手紙/てがみ バイク
はなや/花屋 2 n store | 花/はな
ほいくし/保育士 2 n kids | 子ども/こども 保育園/ほいくえん
カメラマン 2 n  light | 写真/しゃしん カメラ
サッカー選手 2 n sport ball | サッカー ボール
やきゅう選手/野球選手 2 n sport ball | 野球/やきゅう バット
まじょ/魔女 2 h  fly night | ほうき 魔法/まほう
おばけ/幽霊/ゆうれい 2 n night -made? | 夜/よる 怖い/こわい
`);
add('nat', `
そら/空 3 e sky blue | 雲/くも 青い/あおい
ひょう/雹 1 h sky cold | 氷/こおり 雨/あめ
しも/霜 1 h cold winter white | 冬/ふゆ 朝/あさ
つゆ/梅雨 0 n water sky | 雨/あめ 6月/ろくがつ
たつまき/竜巻 3 n sky danger | 風/かぜ 回転/かいてん
こうずい/洪水 3 h water danger | 雨/あめ 川/かわ
つなみ/津波 3 n water sea danger | 地震/じしん 波/なみ
いわ/岩 2 n hard heavy mount | 石/いし 山/やま
どろ/泥 1 n soft water | 土/つち
つち/土 1 n brown farm | 畑/はたけ
はっぱ/葉っぱ 1 e green | 木/き 落ち葉/おちば
おちば/落ち葉 1 n brown autumn | 秋/あき
しお/塩 0 n white edible kitchen | しょっぱい 海/うみ
けむり/煙 2 n fire gray sky | 火/ひ
`);
add('hob', `
ガーデニング 0 n outside | 花/はな 植物/しょくぶつ
りょうりづくり/料理づくり 0 n kitchen | 料理/りょうり
しゃしん撮影/写真撮影 0 n | カメラ
えいがかんしょう/映画鑑賞 0 n screen | 映画/えいが
アニメ 0 e screen kids | 漫画/まんが 声優/せいゆう
ドラマ 0 n screen | 俳優/はいゆう テレビ
ぬりえ/塗り絵 0 n kids | 色/いろ クレヨン
あみもの/編み物 0 h cloth | 毛糸/けいと 編む/あむ
キャンプファイヤー 0 h fire night outside | 火/ひ キャンプ
カードゲーム 0 n | カード トランプ
パズルゲーム 0 h | パズル
ドライブ 0 n veh | 車/くるま 道/みち
ショッピング 0 n money store | 買い物/かいもの
バーベキュー 0 n fire outside meat summer | 肉/にく 焼く/やく
`);
add('title', `
ゼルダの伝説/ゼルダ 0 h videogame ?danger | リンク 任天堂/にんてんどう
スプラトゥーン 0 n videogame online | インク イカ
ドラゴンクエスト/ドラクエ 0 n videogame japan | スライム 勇者/ゆうしゃ
ファイナルファンタジー/FF 0 h videogame foreign? | 召喚獣/しょうかんじゅう チョコボ
モンスターハンター/モンハン 0 n videogame danger | 狩り/かり モンスター
ぷよぷよ 0 h videogame round cute | 落ちもの/おちもの 連鎖/れんさ
マリオカート 0 n videogame veh wheels | カート レース マリオ
となりのトトロ/トトロ 0 n chara mount fur | ジブリ ネコバス
ちびまる子ちゃん 0 n chara school person | まる子
サザエさん 0 n chara home person | 日曜日/にちようび カツオ
クレヨンしんちゃん/しんちゃん 0 n chara kids person | 春日部/かすかべ
ミッキーマウス/ミッキー 0 n chara foreign | ディズニー ねずみ
スヌーピー 0 n chara white | 犬/いぬ
ワンピース 0 n chara sea | ルフィ 海賊/かいぞく
ドラゴンボール 0 n chara fight | 悟空/ごくう
鬼滅の刃/きめつのやいば 0 n chara cut danger | 炭治郎/たんじろう 鬼/おに
名探偵コナン/コナン 0 n chara kids person | 探偵/たんてい 事件/じけん
ゴジラ 0 n chara danger heavy | 怪獣/かいじゅう
ウルトラマン 0 n chara fight sky | ヒーロー 怪獣/かいじゅう
グーグル 0 n app online read | 検索/けんさく
インスタグラム/インスタ 0 n app online light? | 写真/しゃしん
エックス/ツイッター 0 n app online write | 投稿/とうこう
ネットフリックス 0 h app online screen | 映画/えいが ドラマ
アマゾン 0 n app online money | 通販/つうはん
`);
add('idea', `
くうかん/空間 0 h science ?visible | 次元/じげん 宇宙/うちゅう
すうじ/数字 0 n number ?visible | 計算/けいさん 1/いち
ことば/言葉 0 n ?visible sound write | 話す/はなす 文字/もじ
おと/音 0 n sound | 耳/みみ 聞く/きく
ひかり/光 0 n light ?visible science | 太陽/たいよう 明るい/あかるい
かげ/影 0 n black | 光/ひかり 暗い/くらい
いろ/色 0 n  red | 赤/あか 青/あお 絵の具/えのぐ
こころ/心 0 n  cute? | 気持ち/きもち 感情/かんじょう
あい/愛 0 n  pink | 好き/すき 恋/こい
しあわせ/幸せ 0 n  kids? | 笑顔/えがお
ゆうき/勇気 0 h  fight | 勇者/ゆうしゃ
ともだち/友達 0 e person? | 仲良し/なかよし 遊ぶ/あそぶ
かぞく/家族 0 e home person? | 親/おや 兄弟/きょうだい
うそ/嘘 0 n  danger? | 本当/ほんとう
ひみつ/秘密 0 n  ?night | 内緒/ないしょ
まほう/魔法 0 n  fly? | 魔女/まじょ 杖/つえ
うちゅうじん/宇宙人 0 h  sky | 宇宙/うちゅう UFO
ブラックホール 0 h science black | 宇宙/うちゅう 吸い込む/すいこむ
でんぱ/電波 0 h science elec online | スマホ ラジオ
じしゃく/磁石 1 n science metal touch carry | くっつく 鉄/てつ
ねつ/熱 0 n hot science | 温度/おんど 熱い/あつい
おんど/温度 0 h number science | 熱い/あつい 寒い/さむい
ちから/力 0 n  heavy | 強い/つよい
はやさ/速さ 0 n science number | 速い/はやい
あんごう/暗号 0 h  write number | 秘密/ひみつ
ルール 0 n  school | 決まり/きまり
えがお/笑顔 0 n  cute | 笑う/わらう
なみだ/涙 1 n water | 泣く/なく
`);
add('evt', `
ははのひ/母の日 0 n spring | カーネーション お母さん/おかあさん
ちちのひ/父の日 0 n summer | お父さん/おとうさん
けいろうのひ/敬老の日 0 h autumn | おじいさん
おぼん/お盆 0 n summer japan | 先祖/せんぞ 帰省/きせい
しゅうがくりょこう/修学旅行 0 n school veh | 京都/きょうと 旅行/りょこう
がくげいかい/学芸会 0 h school sound | 劇/げき 発表/はっぴょう
ぶんかさい/文化祭 0 n school store? | 出し物/だしもの
じゅぎょうさんかん/授業参観 0 h school kids | 親/おや
なつやすみ/夏休み 0 e summer school | 宿題/しゅくだい 海/うみ
ふゆやすみ/冬休み 0 n winter school | お正月/おしょうがつ
はつもうで/初詣 0 n winter japan | 神社/じんじゃ お正月/おしょうがつ
おとしだま/お年玉 1 n money winter japan | お正月/おしょうがつ
もちつき/餅つき 0 n winter japan | お餅/おもち 臼/うす
コンサート/ライブ 0 n music sound | 歌/うた
`);
add('home', `
ゴミぶくろ/ゴミ袋 1 n | ゴミ/ごみ 袋/ふくろ
はこ/箱/ダンボール 1 n contain square paper | 入れる/いれる 引っ越し/ひっこし
ふくろ/袋/レジ袋 1 n contain | 入れる/いれる
びん/瓶 1 n glass contain | ふた
かんづめ/缶詰 1 n metal edible store | 缶/かん
でんち/電池 1 n elec store | 電気/でんき
まど/窓 2 n glass | 窓ガラス/まどがらす カーテン
ほんだな/本棚 2 n wood | 本/ほん
たんす 2 n wood | 服/ふく 引き出し/ひきだし
おしいれ/押し入れ 2 h japan | 布団/ふとん
ゆかだんぼう/ストーブ 2 n hot winter fire? | 暖かい/あたたかい
せんぷうきのはね/扇子/せんす 1 h japan | 扇ぐ/あおぐ 夏/なつ
ふうとう/封筒 1 n paper | 手紙/てがみ
きって/切手 1 n paper | 手紙/てがみ 郵便/ゆうびん
おさいふ/財布 1 n money | お金/おかね
かばん/バッグ 1 n contain | 持つ/もつ 入れる/いれる
ほうせき/宝石/ダイヤモンド 1 n hard | 指輪/ゆびわ キラキラ
おかね/お金/硬貨 1 e money metal | 買う/かう 財布/さいふ
`);
add('place', `
こうじょう/工場 3 n city made metal heavy | 機械/きかい
ちゅうしゃじょう/駐車場 3 n city veh wheels outside | 車/くるま
がそりんすたんど/ガソリンスタンド 3 n city veh fire danger | ガソリン 車/くるま
けいさつしょ/警察署 3 h city danger? | 警察/けいさつ
しょうぼうしょ/消防署 3 n city fire red | 消防車/しょうぼうしゃ
やおや/八百屋 3 h city store farm | 野菜/やさい
さかなや/魚屋 3 h city store sea | 魚/さかな
はたけ/畑 3 n farm outside | 野菜/やさい 土/つち
たんぼ/田んぼ 3 n farm outside water japan | 稲/いね 米/こめ
のはら/野原 3 h outside | 草/くさ 花/はな
すなはま/砂浜/ビーチ 3 n sea summer outside | 砂/すな 海/うみ
みなと/港 3 n sea | 船/ふね
とうだい/灯台 3 n sea light tall | 船/ふね 光/ひかり
ダム 3 h water | 水/みず 川/かわ
スタジアム/競技場 3 n sport | 試合/しあい
げきじょう/劇場 3 h | 劇/げき 舞台/ぶたい
`);
add('job', `
てんいん/店員 2 n store | お店/おみせ レジ
かいしゃいん/会社員/サラリーマン 2 n  money | 会社/かいしゃ スーツ
はかせ/博士 2 h science | 研究/けんきゅう
けいびいん/警備員 2 h  night | 守る/まもる
しかいしゃ/司会者 2 h  screen sound | 番組/ばんぐみ
おわらいげいにん/芸人 2 n screen sound | お笑い/おわらい ネタ
せいゆう/声優 2 n  sound screen | 声/こえ アニメ
パティシエ 2 n kitchen | ケーキ お菓子/おかし
たんてい/探偵 2 n  ?danger | 事件/じけん 推理/すいり
`);
add('nat', `
ゆきだるま/雪だるま 2 e snow winter white round made | 雪/ゆき にんじん
かまくら 3 h snow winter made japan | 雪/ゆき
しんかい/深海 0 h sea water | 暗い/くらい 深い/ふかい
ひので/日の出 0 n sky light | 朝/あさ 太陽/たいよう
`);
add('evt', `
ひっこし/引っ越し 0 n home | 段ボール/だんぼーる 新しい家/あたらしいいえ
にゅういん/入院 0 h hospital | 病院/びょういん
しけん/テスト 0 n school paper | 点数/てんすう 勉強/べんきょう
しゅくだい/宿題 0 e school paper | 勉強/べんきょう
きゅうしょく/給食 0 e school edible | 献立/こんだて 牛乳/ぎゅうにゅう
`);
add('title', `
ジブリ 0 n screen | 宮崎駿/みやざきはやお トトロ
ディズニー 0 n | ミッキー 映画/えいが
ハリーポッター 0 n | 魔法/まほう ホグワーツ
スターウォーズ 0 h screen | ライトセーバー 宇宙/うちゅう
すみっコぐらし 0 h chara cute | すみっこ
シナモロール 0 h chara cute white | サンリオ
リラックマ 0 n chara cute brown | クマ
きかんしゃトーマス/トーマス 0 n chara kids | 機関車/きかんしゃ
カービィ 0 n chara videogame pink round | 吸い込む/すいこむ
`);
add('swt', `
チュロス 1 h long | 遊園地/ゆうえんち
バウムクーヘン 1 h round | 年輪/ねんりん
`);
add('drk', `
しょうゆ/醤油 0 n black japan kitchen -sweet | 大豆/だいず 調味料/ちょうみりょう
`);

add('ani', `
ポニー 2 n fur farm cute tail | 馬/うま 小さい/ちいさい
ロバ 2 n fur gray farm tail | 耳/みみ 荷物/にもつ
ヘラジカ 3 h fur brown horn foreign | 角/つの
バク 2 h foreign zoo | 夢/ゆめ 鼻/はな
オランウータン 2 n fur brown foreign zoo | 森/もり
ヌー 2 h fur foreign | サバンナ 群れ/むれ
プレーリードッグ 1 h fur brown foreign zoo cute | 穴/あな
`);
add('fru', `
マスカット 1 n green round | ぶどう シャイン
ラフランス/洋なし 1 h | なし
`);
add('veg', `
しそ/大葉 1 h green japan | 薬味/やくみ
みょうが 1 h japan | 薬味/やくみ
さといも/里芋 1 n root brown | 煮物/にもの
やまいも/山芋/長芋 1 h root long | とろろ ねばねば
カリフラワー 1 n white round | ブロッコリー
`);
add('dish', `
おかゆ/お粥 0 n rice hot spoon | 風邪/かぜ
ちゃわんむし/茶碗蒸し 0 h japan hot spoon | 卵/たまご
カレーうどん 0 h noodle spicy hot | カレー うどん
つけめん/つけ麺 0 h noodle | スープ
ハヤシライス 0 h rice spoon brown | デミグラス
ビビンバ 0 h rice foreign spicy | 韓国/かんこく
キムチ 1 n red spicy foreign | 韓国/かんこく 白菜/はくさい
サラダ 0 n veg green | 野菜/やさい ドレッシング
`);
add('elec', `
でんきスタンド/電気スタンド 1 h light | 机/つくえ 明かり/あかり
ラジオ 1 n sound | 放送/ほうそう
エレベーター 3 n | 階/かい ボタン
エスカレーター 3 n | 階段/かいだん
じどうはんばいき/自動販売機/自販機 2 n city money store | ジュース 小銭/こぜに
ATM 2 h money city | お金/おかね 銀行/ぎんこう
`);

add('title', `
メイドインアビス 0 h screen chara ?touch ?elec ?danger -kids | アニメ 漫画/まんが ファンタジー 冒険/ぼうけん 穴/あな 深い/ふかい 怪物/かいぶつ 呪い/のろい 探窟家/たんくつか リコ レグ ダーク
葬送のフリーレン/フリーレン 0 n screen chara ?touch ?elec -kids | アニメ 漫画/まんが ファンタジー 魔法/まほう 冒険/ぼうけん エルフ 勇者/ゆうしゃ
ダンジョン飯/ダンジョンめし 0 h screen chara ?touch ?elec -kids | アニメ 漫画/まんが ファンタジー ダンジョン 料理/りょうり 魔物/まもの 冒険/ぼうけん
進撃の巨人/しんげきのきょじん 0 n screen chara ?touch ?elec danger -kids fight | アニメ 漫画/まんが 巨人/きょじん 壁/かべ 怪物/かいぶつ
呪術廻戦/じゅじゅつかいせん 0 n screen chara ?touch ?elec danger -kids fight school | アニメ 漫画/まんが 呪い/のろい 呪術/じゅじゅつ 少年漫画/しょうねんまんが
チェンソーマン 0 n screen chara ?touch ?elec danger -kids fight | アニメ 漫画/まんが 悪魔/あくま 少年漫画/しょうねんまんが
鋼の錬金術師/ハガレン/はがねのれんきんじゅつし 0 n screen chara ?touch ?elec -kids fight | アニメ 漫画/まんが ファンタジー 錬金術/れんきんじゅつ 兄弟/きょうだい
転生したらスライムだった件/転スラ 0 h screen chara ?touch ?elec | アニメ 転生/てんせい ファンタジー スライム
SPY×FAMILY/スパイファミリー 0 n screen chara ?touch ?elec home | アニメ 漫画/まんが スパイ 家族/かぞく
チャットGPT/ChatGPT/チャットジーピーティー 0 n app online elec screen ?touch -chara | AI/えーあい 人工知能/じんこうちのう チャット 会話/かいわ 文章/ぶんしょう 質問/しつもん ソフト アプリ 仕事/しごと 勉強/べんきょう パソコン スマホ
エクセル/Excel 0 h app elec screen ?touch -chara | 表/ひょう 計算/けいさん ソフト 仕事/しごと パソコン
ワード/Word 0 h app elec screen ?touch -chara | 文書/ぶんしょ 文字/もじ ソフト 仕事/しごと パソコン
グーグルマップ 0 h app online elec screen -chara | 地図/ちず 道/みち スマホ
`);
})(this.SK_TOPICS, this.SK_FACTS);
