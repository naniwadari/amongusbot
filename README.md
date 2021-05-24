# amongusfunbot

## 概要

amongus の追加ルールを遊べる bot です
Discord サーバーでボイスチャットに入っている人をメンバーとして、追加ルールを遊ぶことができます。

## 機能

### なりきり

なりきる役割（お嬢様、など）を参加者に送信します。
ゲーム中に送られた役割になりきって発言しなければなりません。

### 追加制約

ゲーム中追加で守るべき制約を参加者に送信します
ゲーム中は送られた制約を守る必要があります。
インポスターはこの制約に従う必要はありません。

### 狂人あり

参加者からひとり狂人を選びます。
狂人は以下の条件をを全て満たすと勝利することができます。

- ゲーム終了時までに自分のタスクが完了していること
- インポスターが勝利条件を満たすこと
  インポスターが狂人に選ばれた場合は無視することになります。
