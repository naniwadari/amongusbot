import { RowDataPacket } from "mysql2"
import { connection } from "../connection"
import { Rule } from "../entities/Rule"

export class RuleRepository {
  protected rows: RowDataPacket[]

  constructor() {
    this.rows = []
  }

  public async all() {
    await this.execQuery("SELECT * FROM rules")
    const Rules = this.rows.map(row => {
      return new Rule(row.id, row.content)
    })
    return Rules
  }

  public store(content: string) {
    connection().then(connection => {
      connection.query(`INSERT INTO rules (content) VALUES ('${content}')`)
      connection.end()
    }).catch(e => {
      console.log(e)
    })
  }

  public remove(id: number) {
    connection().then(connection => {
      connection.query(`DELETE FROM rules where id=${id}`)
      connection.end()
    }).catch(e => {
      console.log(e)
    })
  }

  protected setRows(rows: RowDataPacket[]) {
    this.rows = rows
  }

  private async execQuery(query: string) {
    await connection().then(connection => {
      const result = connection.query(query)
      connection.end()
      return result
    }).then(rows => {
      this.setRows(rows)
    }).catch(e => {
      console.log(e)
    })
  }
}