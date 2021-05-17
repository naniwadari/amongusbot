import { Collection, EmbedFieldData, GuildMember } from "discord.js"
import { Game, GameMember, GameStatusList } from "./GameInterface"
import { Kyojin } from "../entities/Kyojin"

const KyojinRole = {
  kyojin: {id: 0, content: "狂人"},
  normal: {id: 1, content: "普通"}
}

export class KyojinGame implements Game {
  name: string = "狂人あり"
  status: GameStatusList = GameStatusList.play_now
  members: Collection<string, GuildMember>
  game_members: GameMember[] = []

  constructor(members: Collection<string, GuildMember>) {
    this.members = members
    this.start()
  }

  //メンバーが狂人か
  public static isKyojin(member: GameMember) {
    return member.content.getContent() === KyojinRole.kyojin.content
  }

  //ゲームに参加しているメンバーを取得
  public getGameMembers(): GameMember[] {
    return this.game_members
  }

  //embedFieldDataを返却する
  public getEmbedFields(): EmbedFieldData[] {
    let fields: EmbedFieldData[] = [
      {
        name: "遊んでいるルール",
        value: this.name
      },
      {
        name: "状態",
        value: this.status,
      },
      {
        name: "================================",
        value: "*参加者*"
      }
    ]
    this.game_members.forEach((game_member)=>{
      const value = this.isNeedContentHide() ? '\#\#\#' : game_member.content.getContent()
      const field_data: EmbedFieldData = {
        name: game_member.member.displayName,
        value: `=> ${value}`
      }
      fields.push(field_data)
    })
    return fields
  }
  
  //ゲームを開始状態にする
  public start():void {
    this.status = GameStatusList.play_now
    this.initGameMembers()
  }

  //ゲームを終了状態にする
  public end():void {
    this.status = GameStatusList.end
  }

  //ゲームが終了しているか？
  private isNeedContentHide(): boolean {
    return this.status === GameStatusList.play_now
  }

  //ゲームメンバーとルールの初期化
  private initGameMembers():void {
    const random_key = this.members.randomKey()
    const game_members = this.members.map((member, key) => {
      const game_member: GameMember = {
        member: member,
        content: key === random_key ? new Kyojin(KyojinRole.kyojin.id, KyojinRole.kyojin.content) : new Kyojin(KyojinRole.normal.id, KyojinRole.normal.content)
      }
      return game_member
    })
    this.game_members = game_members
  }
}