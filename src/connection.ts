import * as mysql from 'promise-mysql'
import dotenv from 'dotenv'

export async function connection() {
  dotenv.config()
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
  })

  return connection
}