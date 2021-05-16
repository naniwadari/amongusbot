import { connection } from "../connection"

connection().then(connection => {
  console.log(connection)
  connection.query('CREATE TABLE rules (id bigint(20) unsigned NOT NULL AUTO_INCREMENT, content varchar(200), PRIMARY KEY (`id`))')
  connection.query('CREATE TABLE roles (id bigint(20) unsigned NOT NULL AUTO_INCREMENT, content varchar(200), PRIMARY KEY (`id`))')
  connection.end()
}).catch(e => {
  console.log(e)
})