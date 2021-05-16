import { Collection, EmbedFieldData, GuildMember } from "discord.js"
import { Role } from "../entities/Role"
import { Game, GameMember, GameStatusList } from "./GameInterface"

export class RoleGame implements Game {
  name: string = "なりきりゲーム"
  status: GameStatusList = GameStatusList.play_now
  roles: Role[]
  members: Collection<string, GuildMember>
  game_members: GameMember[] = []

  constructor(members: Collection<string, GuildMember>, roles: Role[]) {
    this.members = members
    this.roles = roles
    this.start()
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
    const game_members = this.members.map(member => {
      const game_member: GameMember = {
        member: member,
        content: this.roles[Math.floor(Math.random() * this.roles.length)]
      }
      return game_member
    })
    this.game_members = game_members
  }
}