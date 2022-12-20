import { IResponse } from "../generalTypes"

export const generateWrongResponse = (message: string): IResponse => {
  return {status: "wrong", body: null, message}
}
export const generateSuccessResponse = (body: any, message: string | null = null): IResponse => {
  return {status: "success", body, message}
}