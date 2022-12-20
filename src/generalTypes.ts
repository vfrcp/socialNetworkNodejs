declare global {
  namespace Express {
    interface Request {
      userId?: number 
    }
  }
}

export interface IConfig {
  serverInfo: {
    port: number
  }
  dbInfo: {
    user: string
    password: string
    host: string
    port: number
    database: string
  }
}
interface IResponseSuccess {
  status: "success"
  body: any
  message: null | string
}
interface IResponseWrong {
  status: "wrong"
  body: null,
  message: string
}

export type IResponse = IResponseSuccess | IResponseWrong