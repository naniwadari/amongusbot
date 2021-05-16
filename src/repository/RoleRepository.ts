import { RowDataPacket } from "mysql2"
import { connection } from "../connection"
import { Role } from "../entities/Role"

export class RoleRepository {
  protected rows: RowDataPacket[]

  constructor() {
    this.rows = []
  }

  public async all() {
    await this.execQuery("SELECT * FROM roles")
    const Rules = this.rows.map(row => {
      return new Role(row.id, row.content)
    })
    return Rules
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