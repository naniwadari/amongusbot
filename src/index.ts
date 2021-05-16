import { Client, Message, Collection, GuildMember, MessageEmbedOptions, EmbedFieldData, MessageEmbed } from 'discord.js'
import { RuleRepository } from "./repository/RuleRepository"
import { RoleRepository } from "./repository/RoleRepository"
import { Content } from "./entities/ContentInterface"
import dotenv from 'dotenv'
import { Game } from './games/GameInterface'
import { RandomGame } from './games/RandomGame'
import { RoleGame } from './games/RoleGame'
import { KyojinGame } from './games/KyojinGame'

//環境変数の読み込み
dotenv.config()
const client = new Client()
const token = process.env.BOT_TOKEN
const ruleRepo = new RuleRepository()
const roleRepo = new RoleRepository()
let game: Game | undefined = undefined
let active_msg: Message | undefined = undefined

client.on('message', async (msg: Message) => {
  const rules = await ruleRepo.all()
  const roles = await roleRepo.all()
  const command = '.usfun'
  //狂人を一人だけ入れる
  if (msg.content === `${command} kyojin`) {
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
          sendDM(client, game_member.member.id, "あなたは狂人です(インポスターの場合は無視してください)")
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
  //ランダム制約スタート
  if (msg.content === `${command} random`) {
    const channel_id = msg.member?.voice.channelID
    if (channel_id) {
      const members = msg?.guild?.channels?.cache.get(channel_id)?.members
      if (members !== undefined) {
        game = undefined
        game = new RandomGame(members, rules)
        game.getGameMembers().forEach((game_member) => {
          sendDM(client, game_member.member.id, game_member.content.getContent())
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
  //なりきりルールゲーム開始
  if (msg.content === `${command} role`) {
    const channel_id = msg.member?.voice.channelID
    if (channel_id) {
      const members = msg?.guild?.channels?.cache.get(channel_id)?.members
      if (members !== undefined) {
        game = undefined
        game = new RoleGame(members, roles)
        game.getGameMembers().forEach((game_member) => {
          sendDM(client, game_member.member.id, game_member.content.getContent())
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

function getRandomMemberId(members: Collection<string, GuildMember> | undefined) {
  if (members === undefined) {
    return "nothing"
  }
  const membersArray = members.map(member => {return member.id})
  const randomMemberId = membersArray[Math.floor(Math.random() * membersArray.length)]
  return randomMemberId
}