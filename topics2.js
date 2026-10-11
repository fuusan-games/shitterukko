/* しってるっこ：お題データ②（もの・乗り物） */
this.SK_TOPICS = this.SK_TOPICS || {};
(function (T) {
T.veh = { name: '乗り物', kind: 'obj', base: 'veh move outside metal wheels heavy -liv -edible kids?',
items: `
くるま/車/自動車/じどうしゃ 3 e city sound
でんしゃ/電車 4 e elec long city sound number
しんかんせん/新幹線 4 e elec white long japan sound
バス 3 e city long sound number work
ひこうき/飛行機 4 e fly sky white sound -city tall
じてんしゃ/自転車 2 e city -heavy kids hand
ふね/船 4 e sea water -wheels swim work
タクシー 3 n city work money
しょうぼうしゃ/消防車 3 e red sound fire water city kids work
きゅうきゅうしゃ/救急車 3 e white sound city work hospital
パトカー 3 e white black sound city kids work
ヘリコプター 3 n fly sky sound -wheels
ロケット 4 n fly sky white fire -wheels sound tall
バイク/オートバイ 2 n sound city
トラック 3 n city sound work contain
ショベルカー 3 h yellow sound work root
せんすいかん/潜水艦 4 h sea water swim -wheels gray
いちりんしゃ/一輪車 2 h kids play school -heavy
ききゅう/気球 3 h fly sky -wheels -metal fire
さんりんしゃ/三輪車 2 h kids play -heavy
ベビーカー 2 h city -heavy hand
ヨット 3 h sea water white -wheels -metal swim
`};
T.home = { name: '家のもの', kind: 'obj', base: 'home ?wood ?metal -move -liv -edible',
items: `
ベッド 3 e soft night sleep
いす/椅子/イス 2 e school
つくえ/机 2 e wood school square
テーブル 2 n wood kitchen eatuse
ソファ/ソファー 3 n soft sleep?
まくら/枕 2 n soft white night cloth sleep head
ふとん/布団 3 n soft japan night cloth sleep
カーテン 3 h cloth
とけい/時計 2 e round school number
かがみ/鏡 2 n glass bath
はぶらし/歯ブラシ 1 e bath tool long mouth clean hand
タオル 2 e cloth soft bath clean
せっけん/石けん/石鹸 1 n bath white store clean
かさ/傘 2 e long tool store outside water hand
かぎ/鍵/カギ 1 n metal tool
ゴミばこ/ゴミ箱 2 h square school contain clean
ほうき/箒 2 h long tool wood school clean hand
カレンダー 2 h paper square number read
ふうりん/風鈴 1 h sound summer japan glass
こたつ 2 n elec hot winter japan square sleep?
うちわ 2 n summer japan paper tool hand
ろうそく/ロウソク 1 h fire light white long
くし/クシ 1 h tool bath hair hand
ハンガー 2 h tool
しゃしん/写真 1 h paper square
`};
T.elec = { name: '電気のもの', kind: 'obj', base: 'home elec tool store -liv -edible -wood',
items: `
テレビ 2 e square black light sound
れいぞうこ/冷蔵庫 3 e cold kitchen square white contain
せんたくき/洗濯機 2 e white water square heavy bath sound clean contain
そうじき/掃除機 2 n sound long clean
でんしレンジ/電子レンジ/レンジ 2 n kitchen hot square contain
スマホ/スマートフォン/携帯電話/けいたい 1 e square light sound black kids number hand money
パソコン/コンピューター 2 n square black number
ドライヤー 2 n hot sound bath hair hand
でんきゅう/電球 1 h light glass round
カメラ 1 n black hand
ゲームき/ゲーム機 1 e play kids light sound hand
すいはんき/炊飯器 2 h kitchen hot white rice contain
エアコン/クーラー 2 n cold hot white -carry
せんぷうき/扇風機 2 e summer sound
リモコン 1 n black long number hand
ロボット 2 n move metal kids sound
ヘッドホン/イヤホン 1 h sound music wear black head
かいちゅうでんとう/懐中電灯 1 h light night long hand
`};
T.kit = { name: '台所のもの', kind: 'obj', base: 'home kitchen tool store -liv -edible',
items: `
なべ/鍋/おなべ 2 e metal hot heavy round fire contain
フライパン 2 n metal hot black round fire
ほうちょう/包丁 2 e metal danger long cut hand
はし/箸/おはし 1 e long wood japan eatuse hand
スプーン 1 e metal eatuse hand
フォーク 1 n metal foreign danger eatuse hand
コップ/グラス 1 e glass water eatuse contain
さら/皿/お皿 1 e round white eatuse
やかん 2 h metal hot water fire contain
まないた/まな板 2 n wood square cut
ちゃわん/茶碗/お茶碗/おわん 1 n round japan eatuse contain rice
エプロン 2 h cloth wear
ストロー 1 h long eatuse mouth
すいとう/水筒 2 h school water contain
べんとうばこ/弁当箱/お弁当箱 1 n school square contain eatuse
`};
T.sta = { name: '学校・文房具', kind: 'obj', base: 'tool school store -liv -edible -home?',
items: `
えんぴつ/鉛筆 1 e long wood write hand
けしゴム/消しゴム 1 e white soft square write
はさみ/ハサミ 1 e metal danger cut hand
ノート 2 e paper write square
じょうぎ/定規/ものさし 2 n long number
ボールペン/ペン 1 n long write hand
クレヨン 1 n write kids hand
ランドセル 2 e wear kids red black japan contain
こくばん/黒板 3 n green write square -store -carry
ホッチキス/ステープラー 1 h metal hand
セロハンテープ/セロテープ 1 h cut
きょうかしょ/教科書 2 n paper write square read
ちきゅうぎ/地球儀 2 h round blue
えのぐ/絵の具 1 h kids
ふで/筆 1 h long write japan wood hand hair
はんこ/印鑑 1 h red japan hand
ほん/本 2 e paper square write home read
しんぶん/新聞 2 n paper write home read store
てがみ/手紙 2 h paper write home read -store
`};
T.wear = { name: '身につけるもの', kind: 'obj', base: 'wear store cloth -liv -edible ?home',
items: `
ぼうし/帽子 2 e head
くつ/靴 2 e -cloth outside feet
くつした/靴下 1 n soft feet
めがね/メガネ/眼鏡 1 e glass -cloth head
マフラー 2 n winter soft long hot head
てぶくろ/手袋 1 n winter soft hot hand
ティーシャツ/Tシャツ 2 n summer
ゆかた/浴衣 2 n summer japan event
きもの/着物 2 h japan event money?
ネクタイ 2 h long head work
ズボン/パンツ 2 n long
スカート 2 n cute
コート 2 n winter hot
うでどけい/腕時計 1 n metal round -cloth number hand
ゆびわ/指輪 1 h metal round -cloth hand money?
ながぐつ/長靴 2 h water -cloth feet
マスク 1 n white head mouth hospital
リュック/リュックサック 2 n contain
パジャマ 2 h night soft home sleep
みずぎ/水着 2 h summer sea water swim
サンダル 2 h summer -cloth feet
ハンカチ 1 h square clean hand
`};
T.toy = { name: 'おもちゃ・遊び', kind: 'obj', base: 'play kids -liv -edible',
items: `
ボール 2 e round outside store ?sport ball throw kick
つみき/積み木 1 h wood square home store hand
けんだま/けん玉 1 n wood japan store hand ball
こま/コマ/独楽 1 n round japan winter wood store hand
ぬいぐるみ 2 e soft fur home store cloth cute sleep?
トランプ 1 n paper square home store number hand
シャボンだま/シャボン玉 1 n round water fly light outside summer mouth
ふうせん/風船 2 n round fly soft store mouth
ブランコ 3 n outside metal -carry move
すべりだい/すべり台/滑り台 3 n outside metal -carry long tall
なわとび/縄跳び 2 n long sport school store hand
にんぎょう/人形 2 n home store cute
パズル 1 h paper home store
おりがみ/折り紙 1 n paper square japan store school hand
ビーだま/ビー玉 1 h round glass
ヨーヨー 1 h round store event hand ball
シーソー 3 h outside -carry move
かるた 1 h paper japan winter read
はねつき/羽子板 2 h wood japan winter hand
`};
T.inst = { name: '楽器', kind: 'obj', base: 'music sound store -liv -edible',
items: `
ピアノ 3 e black white heavy home school -carry -store hand
ギター 2 e wood long hand
たいこ/太鼓/ドラム 2 e round japan event hand
リコーダー/たて笛 2 n school long kids mouth hand
トランペット 2 h metal yellow mouth
バイオリン 2 n wood brown hand
カスタネット 1 h red blue school round kids hand
すず/鈴 1 h metal round japan
ハーモニカ 1 h metal mouth
もっきん/木琴 2 h wood school hand
マイク 1 n elec black hand
`};
})(this.SK_TOPICS);
