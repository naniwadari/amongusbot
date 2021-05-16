import { EmbedFieldData, GuildMember } from "discord.js";
import { Content } from "../entities/ContentInterface";

export interface Game {
  name: string
  status: GameStatusList 
  game_members: GameMember[]
  getGameMembers(): GameMember[]
  start(): void
  end(): void
  getEmbedFields(): EmbedFieldData[]
}

export interface GameMember {
  member: GuildMember,
  content: Content,
}

export enum GameStatusList {
  play_now = "ゲーム中(ゲーム中は配られたルールが非表示になります)",
  end = "ゲーム終了"
}

