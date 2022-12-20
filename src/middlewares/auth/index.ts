import { Request, Response, NextFunction } from "express";
import { pool } from "../../db";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.headers.authorization) throw ""
    const userId = req.headers.authorization
    const user = await pool.query("SELECT id FROM users WHERE id = $1", 
    [userId])
    if(!user.rowCount) throw ""
    req.userId = +userId 
  } catch (err) {
  } finally {
    next()
  }
}