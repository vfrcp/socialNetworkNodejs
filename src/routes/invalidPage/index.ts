import { Router, Request, Response } from "express";
import { IResponse } from "../../generalTypes";

const router = Router()

router.all("*", (req: Request, res: Response<IResponse>) => {
  res.send({status: "wrong", body: null, message: "404"})
})

export default router