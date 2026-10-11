/* しってるっこ：お題データ③（スポーツ・場所・人・自然・行事） */
this.SK_TOPICS = this.SK_TOPICS || {};
(function (T) {
T.spo = { name: 'スポーツ', kind: 'abs', base: 'sport move -liv -made -edible',
items: `
サッカー 0 e outside kids school ball team kick net
やきゅう/野球 0 e outside japan ball team throw hand
バスケットボール/バスケ 0 n school ball team hand throw net
テニス 0 n outside ball racket net hand fight
すいえい/水泳 0 e water swim summer school
すもう/相撲 0 n japan fight -cloth heavy
マラソン 0 n outside long
スキー 0 n winter cold mount outside snow long
スケート/アイススケート 0 n winter cold feet
ゴルフ 0 h outside ball hand
バレーボール/バレー 0 n school ball team hand net
たっきゅう/卓球/ピンポン 0 n ball racket net hand fight
じゅうどう/柔道 0 h japan fight white cloth
けんどう/剣道 0 h japan wood fight hand head
ボウリング 0 h ball hand throw heavy
ドッジボール 0 n school kids outside ball team throw hand
つなひき/綱引き 0 h school event outside
サーフィン 0 h sea summer water outside
スノーボード/スノボ 0 h winter cold mount outside snow
ボクシング 0 h danger fight hand
バドミントン 0 h racket net hand fight fly
からて/空手 0 h japan fight kick hand white
ダンス 0 n music
つり/釣り 0 h water sea outside fish? hand
`};
T.place = { name: '場所', kind: 'place', base: 'place -move -liv -made? -edible',
items: `
がっこう/学校 4 e school building made city kids number
びょういん/病院 4 e building made city white hospital
こうえん/公園 4 e outside kids city
うみ/海 4 e sea water summer blue nature outside
やま/山 4 e mount outside green nature tall
えき/駅 4 n building made city number
どうぶつえん/動物園 4 e zoo outside kids
すいぞくかん/水族館 4 n zoo water building made kids
ゆうえんち/遊園地 4 e play kids outside made
としょかん/図書館 4 n building made paper school read
コンビニ/コンビニエンスストア 4 e building made city store night money
スーパー/スーパーマーケット 4 n building made city store money
おしろ/城/お城 4 n building made japan tall
じんじゃ/神社 4 n japan building made event money?
おてら/寺/お寺 4 h japan building made sound
かわ/川 4 n water outside nature long
うちゅう/宇宙 4 n sky black night nature
えいがかん/映画館 4 n building made city sound night
くうこう/空港 4 h building made fly city
ようちえん/幼稚園/保育園 4 h kids building made
おんせん/温泉 4 h japan water hot nature outside bath
しま/島 4 h sea water nature outside
ふじさん/富士山 4 n japan mount white blue nature outside
とうきょうタワー/東京タワー 4 h japan city red building made metal tall
かんらんしゃ/観覧車 4 n play metal round outside made
プール 4 n water swim summer school outside made
さばく/砂漠 4 h hot yellow foreign nature outside
なんきょく/南極 4 h cold white foreign nature outside
トンネル 4 h night long made
こうばん/交番 4 h city building made japan
ホテル 4 h building made city night sleep money
ぼくじょう/牧場 4 h farm outside
`};
T.job = { name: '人・仕事', kind: 'person', base: 'liv person job move legs -made -edible ?city',
items: `
いしゃ/医者/お医者さん 2 e white hospital
けいさつかん/警察官/おまわりさん/警察 2 e city work
しょうぼうし/消防士 2 e fire water danger work
せんせい/先生/教師 2 e school work
パンや/パン屋/パン屋さん 2 n store kitchen bread
コック/料理人/シェフ 2 n kitchen white
うんてんし/運転士/運転手 2 n veh
パイロット 2 n sky fly
かんごし/看護師 2 n white hospital pink
だいく/大工 2 n wood hand
うちゅうひこうし/宇宙飛行士 2 n sky white
アイドル 2 n music sound kids cute
まんがか/漫画家 2 h write paper home hand
はいしゃ/歯医者 2 h white hospital mouth
にんじゃ/忍者 2 n japan black danger night fight throw
サンタクロース/サンタ/サンタさん 2 n red white winter event night foreign kids
おうさま/王様 2 n foreign money
りきし/力士/おすもうさん 2 h japan sport heavy fight
のうか/農家 2 h farm outside rice
りょうし/漁師 2 h sea water fish net
かしゅ/歌手 2 h music sound
あかちゃん/赤ちゃん 2 n -job home soft kids sound cute sleep
おじいさん/おじいちゃん 2 n -job home
`};
T.nat = { name: '自然・天気', kind: 'abs', base: 'nature outside -made -liv -edible -move?',
items: `
あめ/雨 0 e water sky cold
ゆき/雪 0 e white cold winter water sky soft kids snow
かみなり/雷 0 e sky sound light danger summer
にじ/虹 4 e sky water
たいよう/太陽/お日さま 4 e sky hot light round fire tall?
つき/月/お月さま 4 e sky night yellow round light autumn
ほし/星 4 e sky night light yellow
くも/雲 4 n white sky soft
かぜ/風 0 n ?sky move
たいふう/台風 0 n danger summer autumn water sky move
かざん/火山 4 h fire hot danger mount
じしん/地震 0 n danger japan move
きり/霧 0 h white water
こおり/氷 1 n cold water white hard -outside store snow?
いし/石 1 n hard gray -carry?
すな/砂 0 h yellow sea
たき/滝 4 h water mount
もり/森 4 n green mount wood place
なみ/波 0 h sea water blue move
オーロラ 4 h sky night cold light green foreign
ゆうやけ/夕焼け 4 h sky red
ひ/火/ほのお/炎 0 n hot fire danger red light
つらら 1 h cold winter hard long water snow
ながれぼし/流れ星 4 h sky night light move
`};
T.evt = { name: '行事', kind: 'abs', base: 'event -liv -made -edible -move',
items: `
たんじょうび/誕生日 0 e kids
クリスマス 0 e winter foreign red green night kids snow?
おしょうがつ/お正月/正月 0 e winter japan money
ハロウィン/ハロウィーン 0 e autumn foreign orange black night kids
なつまつり/夏祭り/お祭り 0 e summer japan night outside
はなび/花火 0 e fire light sound summer night danger sky outside japan
うんどうかい/運動会 0 e school sport autumn kids outside team
ひなまつり/ひな祭り 0 n spring japan pink kids
こどものひ/こどもの日 0 n spring japan kids
せつぶん/節分 0 n winter japan throw
たなばた/七夕 0 n summer japan night sky
おつきみ/お月見 0 h autumn japan night sky
けっこんしき/結婚式 0 n white money?
バレンタインデー/バレンタイン 0 n winter sweet brown foreign
えんそく/遠足 0 n school kids outside spring
にゅうがくしき/入学式 0 h school spring pink
そつぎょうしき/卒業式 0 h school spring paper read
おはなみ/お花見 0 n spring japan outside pink
キャンプ 0 n outside summer mount fire
おおみそか/大みそか/大晦日 0 h winter japan night
オリンピック 0 h sport foreign fight
`};
})(this.SK_TOPICS);
