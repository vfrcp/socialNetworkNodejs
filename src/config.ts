import { IConfig } from "./generalTypes";

export const config: IConfig = {
  serverInfo: {
    port: 5000 //default
  },
  dbInfo: {
    user: "",
    password: "",
    host: "localhost",
    port: 5432,//default port
    database: ""//name
  }
}