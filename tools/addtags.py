import re,sys
ADD = {
# animals
'いぬ':'pet tail cute','ねこ':'pet tail cute','うさぎ':'pet cute','ぞう':'tail','きりん':'tall tail horn','ライオン':'tail carn','とら':'tail carn stripe','くま':'carn','パンダ':'cute',
'さる':'tail','ぶた':'tail','うし':'tail horn','うま':'tail work','ひつじ':'horn cute','しか':'horn tail','かば':'tail','カンガルー':'tail','コアラ':'cute','へび':'carn',
'かめ':'pet tail','わに':'tail carn','きつね':'tail','たぬき':'tail','ねずみ':'tail','りす':'tail cute','ハムスター':'pet cute','ゴリラ':'','らくだ':'tail tall','かえる':'pet',
'しまうま':'tail stripe','おおかみ':'tail carn','こうもり':'','もぐら':'root','なまけもの':'','アルパカ':'cute','きょうりゅう':'tail tall carn',
'にわとり':'tail','からす':'tail','すずめ':'tail cute','はと':'','ふくろう':'carn','わし':'carn','つる':'tall','あひる':'','インコ':'pet cute','だちょう':'tall','くじゃく':'tail','ペンギン':'cute','フラミンゴ':'tall','きつつき':'wood',
'まぐろ':'tail','さめ':'tail carn','くじら':'tail','いるか':'tail cute','たこ':'','いか':'','かに':'','えび':'tail','くらげ':'','ひとで':'','らっこ':'cute tail','あざらし':'cute','きんぎょ':'pet tail','めだか':'pet tail','さけ':'tail','たい':'tail','うに':'','かい':'',
'ちょう':'cute','あり':'root','はち':'','カブトムシ':'pet horn','クワガタ':'pet horn','せみ':'','とんぼ':'tail','てんとう虫':'cute','か':'','ほたる':'','ばった':'','かたつむり':'horn','ごきぶり':'','こおろぎ':'pet','みみず':'root','すずむし':'pet',
'さくら':'tall','ひまわり':'tall','たけ':'tall','まつ':'tall leaf','もみじ':'leaf','クローバー':'leaf','いちょう':'tall leaf','いね':'rice','サボテン':'pet',
# fruit/veg
'りんご':'handeat','バナナ':'handeat','みかん':'handeat','いちご':'handeat cute','ぶどう':'handeat','もも':'handeat','すいか':'stripe handeat','メロン':'stripe','レモン':'','さくらんぼ':'handeat cute','パイナップル':'','キウイ':'spoon','かき':'','なし':'','マンゴー':'','くり':'','ブルーベリー':'','ゆず':'',
'にんじん':'root','トマト':'','キャベツ':'leaf','たまねぎ':'root spicy','じゃがいも':'root','きゅうり':'','なす':'','だいこん':'root','ピーマン':'bitter','かぼちゃ':'','ねぎ':'leaf spicy','とうもろこし':'handeat','ほうれんそう':'leaf','ブロッコリー':'','レタス':'leaf','さつまいも':'root','ごぼう':'root','しいたけ':'','もやし':'','たけのこ':'root','えだまめ':'handeat','はくさい':'leaf','しょうが':'root',
# dish
'カレー':'spoon rice','ラーメン':'noodle chop','すし':'rice chop handeat','ハンバーグ':'','ピザ':'bread handeat','おにぎり':'rice handeat','うどん':'noodle chop bread','そば':'noodle chop','てんぷら':'chop','ぎょうざ':'chop bread','たこやき':'bread','おこのみやき':'bread','オムライス':'spoon rice','スパゲッティ':'noodle bread','サンドイッチ':'bread handeat','ハンバーガー':'bread handeat','からあげ':'chop','やきとり':'handeat','みそしる':'chop','ステーキ':'','おでん':'chop','すきやき':'chop','なっとう':'chop','めだまやき':'','おもち':'rice','ごはん':'rice chop','パン':'bread handeat','たまご':'',
'ケーキ':'bread','アイスクリーム':'spoon','チョコレート':'handeat','ドーナツ':'bread handeat','プリン':'spoon cute','クッキー':'bread handeat','せんべい':'rice handeat','わたあめ':'handeat cute','ポップコーン':'handeat','キャンディ':'mouth','ガム':'mouth','だんご':'rice handeat','だいふく':'rice handeat','ようかん':'','かきごおり':'spoon snow','ポテトチップス':'handeat','マシュマロ':'cute','ホットケーキ':'bread','シュークリーム':'handeat',
'おちゃ':'bitter leaf','コーヒー':'bitter','ビール':'bitter','こうちゃ':'leaf',
# vehicles
'くるま':'','でんしゃ':'number','しんかんせん':'','バス':'number work','ひこうき':'tall','じてんしゃ':'hand','ふね':'work','タクシー':'work money','しょうぼうしゃ':'work','きゅうきゅうしゃ':'work hospital','パトカー':'work','ヘリコプター':'','ロケット':'tall','バイク':'','トラック':'work contain','ショベルカー':'work root','せんすいかん':'','いちりんしゃ':'','ききゅう':'','さんりんしゃ':'','ベビーカー':'hand','ヨット':'',
# home
'ベッド':'sleep','いす':'','つくえ':'','テーブル':'eatuse','ソファ':'sleep?','まくら':'sleep head','ふとん':'sleep','カーテン':'','とけい':'number','かがみ':'','はぶらし':'mouth clean hand','タオル':'clean','せっけん':'clean','かさ':'hand','かぎ':'','ゴミばこ':'contain clean','ほうき':'clean hand','カレンダー':'number read','ふうりん':'','こたつ':'sleep?','うちわ':'hand','ろうそく':'','くし':'hair hand','ハンガー':'','しゃしん':'',
'テレビ':'','れいぞうこ':'contain','せんたくき':'clean contain','そうじき':'clean','でんしレンジ':'contain','スマホ':'number hand money','パソコン':'number','ドライヤー':'hair hand','でんきゅう':'','カメラ':'hand','ゲームき':'hand','すいはんき':'rice contain','エアコン':'','せんぷうき':'','リモコン':'number hand','ロボット':'','ヘッドホン':'head','かいちゅうでんとう':'hand',
'なべ':'contain','フライパン':'','ほうちょう':'cut hand','はし':'eatuse hand','スプーン':'eatuse hand','フォーク':'eatuse hand','コップ':'eatuse contain','さら':'eatuse','やかん':'contain','まないた':'cut','ちゃわん':'eatuse contain rice','エプロン':'','ストロー':'eatuse mouth','すいとう':'contain','べんとうばこ':'contain eatuse',
'えんぴつ':'hand','けしゴム':'','はさみ':'cut hand','ノート':'','じょうぎ':'number','ボールペン':'hand','クレヨン':'hand','ランドセル':'contain','こくばん':'','ホッチキス':'hand','セロハンテープ':'cut','きょうかしょ':'read','ちきゅうぎ':'','えのぐ':'','ふで':'hand hair','はんこ':'hand','ほん':'read','しんぶん':'read store','てがみ':'read -store',
'ぼうし':'head','くつ':'feet','くつした':'feet','めがね':'head','マフラー':'head','てぶくろ':'hand','ティーシャツ':'','ゆかた':'','きもの':'money?','ネクタイ':'head work','ズボン':'long','スカート':'cute','コート':'','うでどけい':'number hand','ゆびわ':'hand money?','ながぐつ':'feet','マスク':'head mouth hospital','リュック':'contain','パジャマ':'sleep','みずぎ':'','サンダル':'feet','ハンカチ':'clean hand',
'ボール':'ball throw kick','つみき':'hand','けんだま':'hand ball','こま':'hand','ぬいぐるみ':'cute sleep?','トランプ':'number hand','シャボンだま':'mouth','ふうせん':'mouth','ブランコ':'move','すべりだい':'long tall','なわとび':'hand','にんぎょう':'cute','パズル':'','おりがみ':'hand','ビーだま':'','ヨーヨー':'hand ball','シーソー':'move','かるた':'read','はねつき':'hand',
'ピアノ':'hand','ギター':'hand','たいこ':'hand','リコーダー':'mouth hand','トランペット':'mouth','バイオリン':'hand','カスタネット':'hand','すず':'','ハーモニカ':'mouth','もっきん':'hand','マイク':'hand',
'サッカー':'ball team kick net','やきゅう':'ball team throw hand','バスケットボール':'ball team hand throw net','テニス':'ball racket net hand fight','すいえい':'','すもう':'fight -cloth heavy','マラソン':'','スキー':'snow long','スケート':'feet','ゴルフ':'ball hand','バレーボール':'ball team hand net','たっきゅう':'ball racket net hand fight','じゅうどう':'fight white cloth','けんどう':'fight hand head','ボウリング':'ball hand throw heavy','ドッジボール':'ball team throw hand','つなひき':'team hand long','サーフィン':'','スノーボード':'snow','ボクシング':'fight hand','バドミントン':'racket net hand fight fly','からて':'fight kick hand white','ダンス':'','つり':'hand',
'がっこう':'number','びょういん':'hospital','うみ':'','やま':'tall','えき':'number','としょかん':'read','コンビニ':'money','スーパー':'money','おしろ':'tall','じんじゃ':'money?','おてら':'sound','かわ':'long','うちゅう':'','えいがかん':'night','くうこう':'','とうきょうタワー':'tall','ホテル':'sleep money','トンネル':'','ぼくじょう':'',
'いしゃ':'hospital','けいさつかん':'work','しょうぼうし':'work','せんせい':'work','パンや':'bread','コック':'','うんてんし':'','パイロット':'','かんごし':'hospital pink','だいく':'hand','うちゅうひこうし':'','アイドル':'cute','まんがか':'hand','はいしゃ':'hospital mouth','にんじゃ':'fight throw','サンタクロース':'','おうさま':'money','りきし':'fight','のうか':'rice','りょうし':'net','かしゅ':'','あかちゃん':'cute sleep','おじいさん':'',
'ゆき':'snow','こおり':'snow?','つらら':'snow','たいよう':'tall?','にじ':'','かみなり':'','つき':'','ほし':'',
'たんじょうび':'','クリスマス':'snow?','おしょうがつ':'money','せつぶん':'throw','けっこんしき':'money?','そつぎょうしき':'paper read','にゅうがくしき':'pink','オリンピック':'fight','うんどうかい':'team','つなひき':'',
}
for f in ['topics1.js','topics2.js','topics3.js']:
  out=[]
  for line in open(f,encoding='utf-8').read().split('\n'):
    m=re.match(r'^(\S+) (\d) ([enh])( .*)?$',line)
    if m:
      first=m.group(1).split('/')[0]
      if first in ADD and ADD[first]:
        line=line+' '+ADD[first]
    out.append(line)
  open(f,'w',encoding='utf-8').write('\n'.join(out))
print('done')
