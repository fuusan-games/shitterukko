/* しってるっこ：お題データ①（生き物・食べ物）。書式：名前/別名 大きさ 難易度(e/n/h) タグ…
 * 大きさ 1=手のひら以下 2=人くらいまで 3=家くらいまで 4=家より大きい 0=形がない ／ タグ 'x'=はい '-x'=いいえ '?x'=わからない（属性は kb.js）
 */
this.SK_TOPICS = this.SK_TOPICS || {};
(function (T) {
T.ani = { name: '動物', kind: 'ani', base: 'liv ani move legs outside zoo ?sound ?kids -made -edible',
items: `
いぬ/犬/イヌ/わんちゃん 2 e fur home kids sound -zoo city ?outside pet tail cute
ねこ/猫/ネコ/にゃんこ 2 e fur home kids sound -zoo city ?outside soft pet tail cute
うさぎ/ウサギ/兎 2 e fur white soft home kids -zoo ?outside pet cute
ぞう/ゾウ/象 3 e gray heavy kids long foreign sound tail
きりん/キリン 3 e yellow brown long foreign kids tall tail horn
ライオン 3 e yellow brown fur danger foreign sound tail carn
とら/トラ/虎 3 n yellow black fur danger foreign sound tail carn stripe
くま/クマ/熊 3 e brown black fur danger mount -zoo? sound carn
パンダ 3 e white black fur kids foreign soft cute
さる/サル/猿 2 e brown fur mount japan sound tail
ぶた/ブタ/豚 2 e pink farm -zoo meat sound tail
うし/ウシ/牛 3 e white black farm -zoo meat sound heavy tail horn
うま/ウマ/馬 3 e brown fur farm -zoo sound tail work
ひつじ/ヒツジ/羊 2 n white fur soft farm -zoo horn cute
しか/シカ/鹿 3 n brown fur mount japan horn tail
かば/カバ/河馬 3 n gray water swim heavy foreign tail
カンガルー 2 n brown foreign tail
コアラ 2 n gray fur foreign kids soft cute
へび/ヘビ/蛇 2 n long -legs danger mount -sound carn
かめ/カメ/亀 2 n green hard water swim -sound pet tail
わに/ワニ/鰐 3 n green danger water swim long foreign tail carn
きつね/キツネ/狐 2 n orange fur mount japan tail
たぬき/タヌキ/狸 2 n brown fur mount japan tail
ねずみ/ネズミ/鼠 1 n gray fur home city -zoo tail
りす/リス/栗鼠 1 n brown fur mount tail cute
ハムスター 1 e brown fur home kids -zoo -outside soft pet cute
ゴリラ 3 n black fur foreign heavy
らくだ/ラクダ/駱駝 3 h brown foreign hot tail tall
かえる/カエル/蛙 1 e green water swim farm spring summer sound -zoo pet
しまうま/シマウマ/縞馬 3 n white black foreign tail stripe
おおかみ/オオカミ/狼 2 h gray fur danger night mount sound tail carn
こうもり/コウモリ/蝙蝠 1 h black fly night sky -zoo
もぐら/モグラ 1 h black fur farm -zoo root
なまけもの/ナマケモノ 2 h brown fur foreign
アルパカ 2 h white fur soft foreign cute
きょうりゅう/恐竜 4 n ?liv danger -zoo -move -sound tail tall carn
`};
T.bird = { name: '鳥', kind: 'ani', base: 'liv ani bird move legs fly sky outside -made -fur ?sound -edible',
items: `
にわとり/ニワトリ/鶏 2 e white red farm -fly sound -sky tail
からす/カラス/烏 2 e black city sound tail
すずめ/スズメ/雀 1 e brown city sound tail cute
はと/ハト/鳩 1 e gray city
ふくろう/フクロウ/梟 2 n brown night mount sound carn
わし/ワシ/鷲 2 n brown danger mount carn
つる/ツル/鶴 2 h white japan zoo tall
あひる/アヒル 2 n white water swim farm sound
インコ 1 n green home kids sound -sky pet cute
だちょう/ダチョウ 3 h black -fly -sky foreign zoo tall
くじゃく/クジャク/孔雀 2 h blue green zoo tail
ペンギン 2 e black white -fly -sky swim sea water cold zoo kids cute
フラミンゴ 2 h pink water zoo foreign tall
きつつき/キツツキ 1 h mount sound wood
`};
T.sea = { name: '海の生き物', kind: 'ani', base: 'liv ani move swim sea water -legs -made -fur -sound',
items: `
まぐろ/マグロ/鮪 3 n fish blue edible store japan tail
さめ/サメ/鮫 3 e fish gray danger zoo tail carn
くじら/クジラ/鯨 4 e blue -fish heavy zoo? sound tail
いるか/イルカ 3 e gray -fish zoo kids sound tail cute
たこ/タコ/蛸 2 e red soft edible legs store -fish
いか/イカ/烏賊 2 n white soft edible store -fish long
かに/カニ/蟹 1 e red hard edible legs store -swim
えび/エビ/海老 1 e red edible legs store long tail
くらげ/クラゲ/海月 1 n white soft danger zoo -fish
ひとで/ヒトデ 1 h orange -fish -swim
らっこ/ラッコ 2 h brown fur zoo kids -fish cute tail
あざらし/アザラシ 2 h gray fur zoo cold -fish cute
きんぎょ/金魚 1 e fish red home -sea kids store summer pet tail
めだか/メダカ 1 h fish gray -sea school pet tail
さけ/サケ/鮭/しゃけ 2 n fish orange edible store japan autumn tail
たい/タイ/鯛 2 h fish red edible japan store event tail
うに/ウニ 1 h black edible -swim danger store japan
かい/貝/貝がら 1 n hard edible -swim store
`};
T.bug = { name: '虫', kind: 'ani', base: 'liv ani bug move legs outside -zoo -made -fur -edible',
items: `
ちょう/チョウ/蝶/ちょうちょ/ちょうちょう 1 e fly spring cute
あり/アリ/蟻 1 e black root
はち/ハチ/蜂 1 e yellow black fly danger sound
カブトムシ/かぶとむし 1 e black brown hard summer kids mount night fly pet horn
クワガタ/くわがた 1 n black hard summer kids mount fly pet horn
せみ/セミ/蝉 1 e brown sound summer fly
とんぼ/トンボ/蜻蛉 1 e fly autumn long tail
てんとう虫/てんとうむし/テントウムシ 1 n red black round fly cute
か/蚊 1 n black fly summer night danger sound home
ほたる/ホタル/蛍 1 h light night summer fly water japan
ばった/バッタ 1 n green summer farm
かたつむり/カタツムリ 1 n -legs hard spring water horn
ごきぶり/ゴキブリ 1 n black home fly
こおろぎ/コオロギ 1 h black sound autumn night pet
みみず/ミミズ 1 h -legs long pink farm root
すずむし/スズムシ/鈴虫 1 h black sound autumn night japan pet
`};
T.pla = { name: '植物', kind: 'pla', base: 'liv pla outside -move -made -legs -sound',
items: `
さくら/サクラ/桜 3 e pink spring japan wood tall
ひまわり/ヒマワリ/向日葵 3 e yellow summer round tall
チューリップ 2 e red spring school
ばら/バラ/薔薇 2 n red danger store
たんぽぽ/タンポポ 1 e yellow spring
あさがお/アサガオ/朝顔 2 n blue summer school japan
もみじ/紅葉 3 n red autumn japan mount wood leaf
まつ/マツ/松 3 h green japan wood mount winter tall leaf
たけ/タケ/竹 3 n green japan long hard mount wood tall
サボテン 2 n green danger home store hot pet
きのこ/キノコ 1 n brown mount autumn ?edible store
コスモス 2 h pink autumn
あじさい/アジサイ/紫陽花 2 h purple summer water
クローバー/四つ葉のクローバー 1 h green spring leaf
いちょう/イチョウ/銀杏 3 h yellow autumn wood city tall leaf
ゆり/ユリ/百合 2 h white store
いね/イネ/稲 2 h yellow farm autumn japan rice
`};
T.fru = { name: '果物', kind: 'food', base: 'fruit sweet ?pla -made -move kitchen?',
items: `
りんご/リンゴ/林檎 1 e red round autumn hard handeat
バナナ 2 e yellow long soft foreign handeat
みかん/ミカン/蜜柑 1 e orange round winter japan sour handeat
いちご/イチゴ/苺 1 e red spring kids handeat cute
ぶどう/ブドウ/葡萄 1 e purple round autumn handeat
もも/モモ/桃 1 n pink round summer soft handeat
すいか/スイカ/西瓜 2 e green round summer heavy water stripe handeat
メロン 2 n green round heavy stripe
レモン 1 n yellow sour -sweet
さくらんぼ/サクランボ 1 n red round summer handeat cute
パイナップル/パイン 2 n yellow hard sour foreign
キウイ/キウイフルーツ 1 n brown sour spoon
かき/柿 1 h orange autumn japan round
なし/梨 1 h yellow round autumn
マンゴー 1 h yellow foreign summer
くり/栗 1 h brown autumn hard mount japan
ブルーベリー 1 h purple round sour
ゆず/柚子 1 h yellow sour winter japan round -sweet
`};
T.veg = { name: '野菜', kind: 'food', base: 'veg kitchen farm ?pla -made -move -sweet',
items: `
にんじん/ニンジン/人参 2 e orange long root
トマト 1 e red round summer sour
キャベツ 2 e green round leaf
たまねぎ/玉ねぎ/タマネギ 1 e brown round root spicy
じゃがいも/ジャガイモ/ポテト 1 e brown round root
きゅうり/キュウリ/胡瓜 2 e green long summer water
なす/ナス/茄子 1 n purple long summer
だいこん/大根/ダイコン 2 e white long winter japan heavy root
ピーマン 1 n green bitter
かぼちゃ/カボチャ/南瓜 2 n green hard round heavy autumn
ねぎ/ネギ/長ねぎ 2 n green long japan winter leaf spicy
とうもろこし/トウモロコシ/コーン 2 n yellow long summer sweet handeat
ほうれんそう/ほうれん草 2 h green leaf
ブロッコリー 1 n green
レタス 2 h green round water leaf
さつまいも/サツマイモ/焼き芋 2 n purple autumn sweet long root
ごぼう/牛蒡 2 h brown long japan hard root
しいたけ/シイタケ/椎茸 1 h brown japan mount -farm
もやし 1 h white long
たけのこ/タケノコ/筍 2 h brown spring japan mount -farm hard root
えだまめ/枝豆 1 h green summer japan handeat
はくさい/白菜 2 h white winter japan leaf
しょうが/生姜 1 h yellow spicy japan root
`};
T.dish = { name: '料理', kind: 'food', base: 'dish ?kitchen ?store -move -liv',
items: `
カレー/カレーライス 2 e yellow hot spicy kids meat spoon rice
ラーメン 2 e hot long japan store water noodle chop
すし/寿司/おすし/お寿司 1 e japan fish? store event rice chop handeat
ハンバーグ 1 e brown hot meat kids
ピザ 2 e round hot foreign store bread handeat
おにぎり/おむすび 1 e white japan store school rice handeat
うどん 2 n white long hot japan store water noodle chop bread
そば/蕎麦/お蕎麦 2 h brown long japan store winter noodle chop
てんぷら/天ぷら 1 n yellow japan hot fire chop
ぎょうざ/餃子 1 n hot meat fire chop bread
たこやき/たこ焼き 1 n round hot japan brown store event bread
おこのみやき/お好み焼き 2 h round hot japan brown fire bread
オムライス 2 n yellow hot kids spoon rice
スパゲッティ/パスタ/スパゲティ 2 n long foreign hot noodle bread
サンドイッチ 1 n square foreign store bread handeat
ハンバーガー 1 e round foreign meat store kids bread handeat
からあげ/唐揚げ/から揚げ 1 n brown hot meat kids store chop
やきとり/焼き鳥 1 h meat long japan brown store fire handeat
みそしる/味噌汁/おみそしる 1 n hot japan water brown chop
ステーキ 2 h meat brown hot foreign fire
おでん 2 h hot winter japan store water chop
すきやき/すき焼き 2 h hot meat japan winter chop
なっとう/納豆 1 h brown japan store chop
めだまやき/目玉焼き 1 h white yellow round hot fire
おもち/もち/餅 1 n white soft japan winter store event rice
ごはん/ご飯/白ごはん/白米 1 e white japan hot rice chop
パン/食パン 1 e brown soft store bread handeat
たまご/卵/玉子 1 e white round store -dish
`};
T.swt = { name: 'お菓子', kind: 'food', base: 'sweets sweet store kids -move -liv',
items: `
ケーキ/ショートケーキ 1 e white soft event bread
アイスクリーム/アイス/ソフトクリーム 1 e cold summer white spoon
チョコレート/チョコ 1 e brown handeat
ドーナツ 1 e round brown bread handeat
プリン 1 e yellow soft spoon cute
クッキー 1 n brown round hard bread handeat
せんべい/煎餅/おせんべい 1 n brown round hard japan -sweet rice handeat
わたあめ/綿あめ/綿菓子 2 h white soft event summer handeat cute
ポップコーン 1 n yellow handeat
キャンディ/キャンディー/飴/あめ玉 1 n round hard mouth
ガム/チューインガム 1 h soft mouth
だんご/団子/お団子 1 n round japan soft rice handeat
だいふく/大福 1 h white soft round japan rice handeat
ようかん/羊羹 1 h black square japan
かきごおり/かき氷 1 n cold summer water event spoon snow
ポテトチップス/ポテチ 1 n yellow -sweet handeat
マシュマロ 1 h white soft cute
ホットケーキ/パンケーキ 1 n round hot brown bread
シュークリーム 1 h yellow soft round handeat
`};
T.drk = { name: '飲み物', kind: 'drink', base: '-move -liv',
items: `
みず/水/お水 1 e cold -made
おちゃ/お茶/緑茶 1 e green japan hot bitter leaf
ぎゅうにゅう/牛乳/ミルク 1 e white kids school
ジュース/オレンジジュース 1 e orange sweet cold kids
コーヒー/珈琲 1 e black hot bitter
こうちゃ/紅茶 1 n brown hot foreign leaf
コーラ 1 n black sweet cold foreign
ココア 1 h brown sweet hot winter
ラムネ 1 h sweet cold summer japan glass
ビール 1 n yellow cold bitter
むぎちゃ/麦茶 1 h brown cold summer japan
`};
})(this.SK_TOPICS);
