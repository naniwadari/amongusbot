import { Client, Message, EmbedFieldData, MessageEmbed } from 'discord.js'
import { RuleRepository } from "./repository/RuleRepository"
import { RoleRepository } from "./repository/RoleRepository"
import dotenv from 'dotenv'
import { Game } from './games/GameInterface'
import { RandomGame } from './games/RandomGame'
import { RoleGame } from './games/RoleGame'
import { KyojinGame } from './games/KyojinGame'
import { Rule } from './entities/Rule'
import { Role } from './entities/Role'

//環境変数の読み込み
dotenv.config()
const client = new Client()
const token = process.env.BOT_TOKEN
const ruleRepo = new RuleRepository()
const roleRepo = new RoleRepository()
let game: Game | undefined = undefined
let active_msg: Message | undefined = undefined
const stamps = [
  {name: 'ランダム制約', emoji: '1️⃣'},
  {name: 'なりきりルール', emoji: '2️⃣'},
  {name: '狂人あり', emoji: '3️⃣'},
  {name: 'ゲームを終了して値を表示', emoji: '🚫'}
]
client.on('message', async (msg: Message) => {
  const rules = await ruleRepo.all()
  const roles = await roleRepo.all()
  const command = '.usfun'
  //ゲームを開始する
  if (msg.content === `${command} new`) {
    const fields = stamps.map(stamp => {
      const field: EmbedFieldData = {
        name: stamp.emoji,
        value: stamp.name,
        inline: true
      }
      return field
    })
    const embed = new MessageEmbed({
      color: 16757683,
      title: "amongus追加ルールBOT",
      description: "スタンプで開始したいゲームを選んでください",
      fields: fields
    })
    active_msg = await msg.channel.send(embed)
    stamps.forEach(stamp => {
      active_msg?.react(stamp.emoji)
    })
    client.on('messageReactionAdd', (reaction, user) => {
      const bot_id = '839341219783114793'
      if (user.id !== bot_id) {
        switch(reaction.emoji.name) {
          case stamps[0].emoji:
            startRandomGame(msg, rules)
            break
          case stamps[1].emoji:
            startRoleGame(msg, roles)
            break
          case stamps[2].emoji:
            startKyojinGame(msg)
            break
          case stamps[3].emoji:
            endGame(msg)
            break
        }
        reaction.users.remove(user.id)
        console.log(`${user.username}[userId:${user.id}]が${reaction.emoji.name}を開始しました`)
      }
    })
  }
  //ランダム制約一覧
  if (msg.content === `${command} random list`) {
    let list = ""
    rules.forEach((rule) => {
      list = list + `${rule.getId()} : ${rule.getContent()}\n`
    })
    msg.channel.send(list)
  }
  //ランダム制約追加
  if (msg.content.match(new RegExp(`${command} random add .+`))) {
    const splitValue = msg.content.split(/\s/)
    const content = splitValue[3]
    console.log(`ランダムルールに\"${content}\"を追加します`)
    ruleRepo.store(content)
    msg.channel.send(`ランダムルールに\"${content}\"を追加しました`)
  }
  //ランダム制約削除
  if (msg.content.match(new RegExp(`${command} random remove [0-9]+`))) {
    const splitValue = msg.content.split(/\s/)
    const id = Number(splitValue[3])
    if (id === NaN) {
      msg.channel.send("IDは数字で入力してください")
      return
    }
    console.log(`ランダムルールのid:${id}を削除します`)
    ruleRepo.remove(id)
    msg.channel.send(`ランダムルールのid:${id}を削除しました`)
  }
  //なりきり一覧
  if (msg.content === `${command} role list`) {
    let list = ""
    roles.forEach((role) => {
      list = list + `${role.getId()} : ${role.getContent()}\n`
    })
    msg.channel.send(list)
  }
  //ゲーム終了
  if (msg.content === `${command} end`) {
    endGame(msg)
  }
  //BOTの状態を初期化
  if (msg.content === `${command} kill`) {
    if (active_msg == null) {
      return
    }
    active_msg.delete()
    active_msg = undefined
    game = undefined
  }
})

client.login(token)

function sendDM(client: Client, userId: string, text:string) {
  client.users.fetch(userId)
    .then(e => {
      e.send(text)
        .then()
        .catch(console.error)
    })
    .catch(console.error)
}

//狂人追加開始
async function startKyojinGame(msg: Message) {
  const channel_id = msg.member?.voice.channelID
  if (channel_id == null) {
    msg.channel.send("ボイスチャンネルに誰も参加していません！")
    return
  }
  const members = msg?.guild?.channels?.cache.get(channel_id)?.members
  if (members !== undefined) {
    game = undefined
    game = new KyojinGame(members)
    game.getGameMembers().forEach(game_member => {
      const is_kyojin = KyojinGame.isKyojin(game_member)
      if (is_kyojin) {
        sendDM(client, game_member.member.id, "あなたは狂人です。勝利条件は\n①タスクを完了させること\n②インポースターが勝利条件を満たすこと\nです。\nあなたがインポスターの場合は無視してください")
      }
    })
    const fields = game.getEmbedFields()
    const embed = new MessageEmbed({
      color: 16757683,
      fields: fields
    })
    if (active_msg === undefined) {
      active_msg = await msg.channel.send(embed)
    } else {
      active_msg.edit(embed)
    }
  }
}

//ランダム制約ゲーム開始
async function startRandomGame(msg: Message, rules: Rule[]) {
  const channel_id = msg.member?.voice.channelID
  if (channel_id == null) {
    msg.channel.send("ボイスチャンネルに誰も参加していません！")
    return
  }
  const members = msg?.guild?.channels?.cache.get(channel_id)?.members
  if (members !== undefined) {
    game = undefined
    game = new RandomGame(members, rules)
    game.getGameMembers().forEach((game_member) => {
      sendDM(client, game_member.member.id, `あなたの追加制約は「${game_member.content.getContent()}」です。`)
    })
    const fields = game.getEmbedFields()
    const embed = new MessageEmbed({
      color: 16757683,
      fields: fields
    })
    if (active_msg === undefined) {
      active_msg = await msg.channel.send(embed)
    } else {
      active_msg.edit(embed)
    }
  }
}

//なりきりゲームルール開始
async function startRoleGame(msg: Message, roles: Role[]) {
  const channel_id = msg.member?.voice.channelID
  if (channel_id == null) {
    msg.channel.send("ボイスチャンネルに誰も参加していません！")
    return
  }
  const members = msg?.guild?.channels?.cache.get(channel_id)?.members
  if (members !== undefined) {
    game = undefined
    game = new RoleGame(members, roles)
    game.getGameMembers().forEach((game_member) => {
      sendDM(client, game_member.member.id, `あなたのなりきる役は「${game_member.content.getContent()}」です。`)
    })
    const fields = game.getEmbedFields()
    const embed = new MessageEmbed({
      color: 16757683,
      fields: fields
    })
    if (active_msg === undefined) {
      active_msg = await msg.channel.send(embed)
    } else {
      active_msg.edit(embed)
    }
  }
}

//ゲームを終了する
function endGame(msg: Message) {
  if (game === undefined || active_msg === undefined) {
    msg.channel.send("ゲームが開始されていません!")
    return
  }
  game.end()
  const fields = game.getEmbedFields()
  const embed = new MessageEmbed({
    color: 16757683,
    fields: fields
  })
  active_msg.edit(embed)
}