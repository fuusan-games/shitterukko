/* しってるっこ：お題データ③（スポーツ・場所・人・自然・行事） */
this.SK_TOPICS = this.SK_TOPICS || {};
(function (T) {
T.spo = { name: 'スポーツ', kind: 'abs', base: 'sport move -liv ?made -edible',
items: `
サッカー 0 e kids school ball team kick net fight outside
やきゅう/野球 0 e japan ball team throw hand fight equip outside summer ?foreign
バスケットボール/バスケ 0 n school ball team hand throw net fight
テニス 0 n outside ball racket net hand fight ?solo
すいえい/水泳 0 e water swim summer school solo ?equip
すもう/相撲 0 n japan fight -cloth heavy -equip -solo ?throw combat grapple
マラソン 0 n outside long solo -equip winlose event?
スキー 0 n winter cold mount outside snow long solo equip cost
スケート/アイススケート 0 n winter cold feet solo equip
ゴルフ 0 h outside ball hand solo equip cost -kids money
バレーボール/バレー 0 n school ball team hand net fight
たっきゅう/卓球/ピンポン 0 n ball racket net hand fight -solo
じゅうどう/柔道 0 h japan fight white cloth throw -equip -solo combat grapple
けんどう/剣道 0 h japan wood fight hand head equip -solo combat
ボウリング 0 h ball hand throw heavy ?solo equip cost money
ドッジボール 0 n ball team throw hand play fight school kids outside
つなひき/綱引き 0 h school event outside team equip
サーフィン 0 h sea summer water outside solo equip
スノーボード/スノボ 0 h winter cold mount outside snow solo equip cost
ボクシング 0 h danger fight hand equip -solo combat strike
バドミントン 0 h racket net hand fight fly -solo
からて/空手 0 h japan fight kick hand white -equip ?solo combat strike
ダンス 0 n music ?solo -equip ?team
つり/釣り 0 h water sea outside fish? hand solo equip
キックボクシング 0 h combat strike kick hand danger fight equip -solo foreign ?grapple
そうごうかくとうぎ/総合格闘技/MMA 0 h combat strike grapple kick hand danger fight -solo foreign money
プロレス/プロレスリング 0 h combat grapple strike danger fight -solo screen? money
レスリング 0 h combat grapple throw fight -solo -equip foreign
フェンシング 0 h combat fight equip white head -solo foreign long
ラグビー 0 h ball team throw kick hand fight outside danger
ハンドボール 0 h ball team throw hand net fight -school foreign
ソフトボール 0 h ball team throw hand fight outside equip school
ボルダリング/クライミング 0 h hand solo equip tall cost
ヨガ 0 h solo -equip -fight home soft
きんトレ/筋トレ/筋力トレーニング 0 n solo heavy hand home equip? -fight
ジョギング/ランニング 0 n solo outside city -equip -fight -winlose long
`};
T.place = { name: '場所', kind: 'place', base: 'place -move -liv -made? -edible',
items: `
がっこう/学校 4 e school building made city kids number
びょういん/病院 4 e building made city white hospital
こうえん/公園 4 e outside kids city -cost ?play
うみ/海 4 e sea water summer blue nature outside swim
やま/山 4 e mount outside green nature tall
えき/駅 4 n building made city number
どうぶつえん/動物園 4 e zoo outside kids cost
すいぞくかん/水族館 4 n zoo water building made kids cost
ゆうえんち/遊園地 4 e play kids outside made cost
としょかん/図書館 4 n building made paper school read -cost
コンビニ/コンビニエンスストア 4 e building made city store night money cost
スーパー/スーパーマーケット 4 n building made city store money cost
おしろ/城/お城 4 n building made japan tall
じんじゃ/神社 4 n japan building made event money?
おてら/寺/お寺 4 h japan building made sound
かわ/川 4 n water outside nature long ?swim
うちゅう/宇宙 4 n sky black night nature ?cold -touch science
えいがかん/映画館 4 n building made city sound night cost money screen
くうこう/空港 4 h building made fly city
ようちえん/幼稚園/保育園 4 h kids building made ?play
おんせん/温泉 4 h japan water hot nature outside bath cost
しま/島 4 h sea water nature outside
ふじさん/富士山 4 n japan mount white blue nature outside
とうきょうタワー/東京タワー 4 h japan city red building made metal tall white ?light
かんらんしゃ/観覧車 4 n play metal round outside made
プール 4 n water summer school outside made swim
さばく/砂漠 4 h hot yellow foreign nature outside
なんきょく/南極 4 h cold white foreign nature outside
トンネル 4 h night long made mount ?light
こうばん/交番 4 h city building made japan
ホテル 4 h building made city night sleep money cost ?home
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
うちゅうひこうし/宇宙飛行士 2 n sky white science
アイドル 2 n music sound kids cute
まんがか/漫画家 2 h write paper home hand
はいしゃ/歯医者 2 h white hospital mouth ?danger
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
かみなり/雷 0 e sky sound light danger summer -touch visible
にじ/虹 4 e sky water ?light -touch visible
たいよう/太陽/お日さま 4 e sky hot light round fire tall? summer -touch visible
つき/月/お月さま 4 e sky night yellow round light autumn ?white -touch visible
ほし/星 4 e sky night light yellow -touch visible
くも/雲 4 n white sky soft gray -touch visible
かぜ/風 0 n ?sky move ?cold -visible ?touch
たいふう/台風 0 n danger summer autumn water sky move
かざん/火山 4 h fire hot danger mount
じしん/地震 0 n danger japan move -visible
きり/霧 0 h white water visible
こおり/氷 1 n cold water white hard -outside store snow? ?square winter
いし/石 1 n hard gray -carry? ?heavy ?throw
すな/砂 0 h yellow sea brown
たき/滝 4 h water mount sound
もり/森 4 n green mount wood place
なみ/波 0 h sea water blue move ?white
オーロラ 4 h sky night cold light green foreign -touch visible
ゆうやけ/夕焼け 4 h sky red -touch visible
ひ/火/ほのお/炎 0 n hot fire danger red light
つらら 1 h cold winter hard long water snow
ながれぼし/流れ星 4 h sky night light move -touch visible
`};
T.hob = { name: 'しゅみ・あそび', kind: 'abs', base: 'hobby abstract -liv made -edible -sport',
items: `
カラオケ 0 e music sound mouth store cost money night ?team -body
りょこう/旅行 0 n outside cost money ?team -winlose
どくしょ/読書 0 n read paper home solo -body -winlose
テレビゲーム/ゲーム 0 e videogame screen elec play kids home winlose ?solo -body ?online
しょうぎ/将棋 0 n japan wood square play winlose fight -solo -body hand
いご/囲碁 0 h japan black white round play winlose fight -solo -body
チェス 0 h foreign black white play winlose fight -solo -body
オセロ 0 n black white round play winlose fight -solo -body kids
じゃんけん 0 e hand play winlose fight -solo -equip kids -body
しりとり 0 e mouth play -equip kids -body -solo ?winlose
かくれんぼ 0 e play kids outside body -equip -solo ?winlose
おにごっこ 0 e play kids outside body -equip -solo ?winlose school
てじな/手品/マジック 0 h hand equip -winlose ?solo
おえかき/お絵かき 0 e write paper hand kids solo home -winlose -body
ピクニック 0 n outside spring food? -winlose -solo ?body
さんぽ/散歩 0 e outside body solo -equip -winlose
ひるね/昼寝 0 e sleep home solo -equip -winlose -body
かいもの/買い物 0 e store money cost city -winlose ?solo
とざん/登山 0 h mount outside body tall equip -winlose ?solo
`};
T.title = { name: '作品・アプリ・キャラ', kind: 'abs', base: 'proper made -liv -edible -move -sport',
items: `
マインクラフト/マイクラ/Minecraft 0 n videogame screen elec online play kids hobby square ?solo ?winlose foreign
ポケモン/ポケットモンスター 0 e videogame chara screen kids play yellow? japan winlose cute hobby
スーパーマリオ/マリオ 0 e videogame chara screen kids play red japan solo 
テトリス 0 h videogame screen square play solo winlose foreign number
どうぶつのもり/どうぶつの森/あつまれどうぶつの森/あつ森 0 n videogame screen play kids japan cute -winlose solo green
フォートナイト 0 h videogame screen online play fight winlose foreign team
ユーチューブ/YouTube 0 e app online screen elec red -play proper kids
ライン/LINE 0 n app online screen elec green -play
ティックトック/TikTok 0 h app online screen elec black music kids
アンパンマン 0 e chara kids japan red round cute
ドラえもん 0 e chara kids japan blue round cute
ハローキティ/キティちゃん/キティ 0 h chara kids japan white pink cute -screen
ピカチュウ 0 e chara kids japan yellow cute videogame screen? sound
`};
T.idea = { name: 'ことがら・ふしぎ', kind: 'abs', base: 'abstract -liv -edible -move -touch -carry -sport',
items: `
じかん/時間 0 n time ?made -visible number
みらい/未来 0 n time -visible ?made
かこ/過去 0 h time -visible -made
ゆめ/夢 0 n sleep night ?visible ?made -time
じげん/次元 0 h science ?visible -made number
よじげん/四次元/4次元 0 h science time ?visible ?sky -made number
じくう/時空 0 h science time ?sky ?visible -made
じゅうりょく/重力 0 h science heavy -visible natural -made
こうそく/光速 0 h science light ?visible -made number
でんき/電気 0 n elec light science danger ?visible ?made home
`};
T.evt = { name: '行事', kind: 'abs', base: 'event -liv -made -edible -move',
items: `
たんじょうび/誕生日 0 e kids ?music
クリスマス 0 e winter foreign red green night kids snow?
おしょうがつ/お正月/正月 0 e winter japan money
ハロウィン/ハロウィーン 0 e autumn foreign orange black night kids
なつまつり/夏祭り/お祭り 0 e summer japan night outside
はなび/花火 0 e fire light sound summer night danger sky outside japan
うんどうかい/運動会 0 e school sport autumn kids outside team
ひなまつり/ひな祭り 0 n spring japan pink kids
こどものひ/こどもの日 0 n spring japan kids ?fight
せつぶん/節分 0 n winter japan throw
たなばた/七夕 0 n summer japan night sky
おつきみ/お月見 0 h autumn japan night sky
けっこんしき/結婚式 0 n white money?
バレンタインデー/バレンタイン 0 n winter sweet brown foreign pink
えんそく/遠足 0 n school kids outside spring ?team autumn
にゅうがくしき/入学式 0 h school spring pink
そつぎょうしき/卒業式 0 h school spring paper read ?music
おはなみ/お花見 0 n spring japan outside pink
キャンプ 0 n outside summer mount fire
おおみそか/大みそか/大晦日 0 h winter japan night
オリンピック 0 h sport foreign fight summer winter
`};
})(this.SK_TOPICS);
