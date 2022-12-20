import express from "express";
import { config } from "./config";

import { authMiddleware } from "./middlewares/auth";
import routes from "./routes";

const App = express()

App.use(express.json())
App.use(authMiddleware)

App.use("/", routes)

const start = async () => {
  const {port} = config.serverInfo
  App.listen(port, () => {
    console.log(`The server has been started at ${port} port`)
  })
}
start()