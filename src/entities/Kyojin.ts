import { Content } from "./ContentInterface"

export class Kyojin implements Content {

  protected id: number;
  protected content: string;

  constructor(id: number, content: string) {
    this.id = id
    this.content = content
  }

  public getId() {
    return this.id
  }

  public getContent() {
    return this.content
  }
}