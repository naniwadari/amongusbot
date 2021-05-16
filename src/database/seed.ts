import { connection } from "../connection"

connection().then(connection => {
  connection.query("INSERT INTO rules (content) VALUES ('ペア行動禁止'),('議論中人に話を振られるまで話せない'),('残り5人になるまで単独行動禁止'),('英語禁止'),('日本語禁止'),('アドミン使用禁止'),('監視カメラ使用禁止'),('サボタージュが起きたら最優先で直す'),('発言するときは歌う'),('語尾に必ず「知らんけど」をつける'),('お嬢様風に喋る'),('5・7・5のリズムで喋る'),('インポスターのベントを見ても言及禁止')")
  connection.query("INSERT INTO roles (content) VALUES ('お嬢様'),('ツンデレ'),('根倉'),('ヤンデレ'),('泣き虫'),('ヤンキー'),('スケバン'),('ロリ娘'),('酔っ払い'),('中二病'),('カタコト外国人'),('エセ関西人'),('ルー大柴')")
  connection.end()
}).catch(e => {
  console.log(e)
})