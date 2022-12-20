import { Client, Pool } from "pg"
import { config } from "../../config";
import { sqlQuery } from "./sqlQuery";

const {host, user, password, port, database} = config.dbInfo;

(async () => {

  try {
    const client = new Client({host, user, password, port})
    await client.connect()
    await client.query(sqlQuery.deleteDatabaseIfExist(database))
    await client.query(sqlQuery.createDatabase(database))
    await client.end()

    const pool = new Pool(config.dbInfo)
    await pool.connect()
    await pool.query(sqlQuery.createUsersTable)
    await pool.query(sqlQuery.createSubscribersTable)
    await pool.query(sqlQuery.createBlockedUsersTable)
    await pool.query(sqlQuery.createChatsTable)
    await pool.query(sqlQuery.createMessagesTable)
    await pool.query(sqlQuery.createPostsTable)
    await pool.query(sqlQuery.createPostReactionsTable)
    await pool.query(sqlQuery.createPostCommentsTable)
    await pool.query(sqlQuery.createPostCommentsReactionsTable)
    await pool.query(sqlQuery.createCommentReplaysTable)

    console.log("Done")
    process.exit()
  } catch (err) {
    console.log(`Error: ${err}`)
  }
})()