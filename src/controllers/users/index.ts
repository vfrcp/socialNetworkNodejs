import { Request, Response } from "express";
import {hash as hashPassword, compare as comparePassword, compare} from "bcrypt";
import { pool } from "../../db/index"
import { IResponse } from "../../generalTypes";
import { forAllControllerAnswers, usersControllerAnswers } from "../controllersMessages";
import { generateSuccessResponse, generateWrongResponse } from "../responseGenerators";

export class UsersController {
  static async register (req: Request<{}, {}, {username: string, email: string, password: string}>, res: Response<IResponse>) {
    try {
      const {username, email, password} = req.body
      if(!username || !email || !password) throw forAllControllerAnswers.nullPost
      const hashedPassword = await hashPassword(password, 10)
      const newUser = await pool.query(
      "INSERT INTO users (username, email, password) values($1, $2, $3) RETURNING *",
      [username, email, hashedPassword])
      res.send(newUser.rows[0])
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async login (req: Request<{}, {}, {username: string, password: string}>, res: Response<IResponse>) {
    try {
      const {username, password} = req.body
      if(!username || !password) throw forAllControllerAnswers.nullPost  
      const user = await pool.query(`SELECT id, password FROM users WHERE username = $1`, [username])
      if(!user.rowCount) throw usersControllerAnswers.notFoundOneUser
      const isPasswordEqual = await comparePassword(password, user.rows[0].password) 
      if(!isPasswordEqual) throw usersControllerAnswers.invalidPassword
      res.send(generateSuccessResponse(user.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getByUserId (req: Request<{userId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {userId} = req.params
      const user = await pool.query("SELECT id, username, registration_date, about FROM users WHERE id = $1", [userId])
      if(!user.rowCount) throw usersControllerAnswers.notFoundOneUser
      res.send(generateSuccessResponse(user.rows[0]))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async editByAuth (req: Request<{}, {}, {oldEmail?: string, email?: string, oldPassword?: string, password?: string, about?: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {oldEmail, email, oldPassword, password, about} = req.body
      if((!oldEmail || !email) && (!oldPassword || !password) && !about) throw forAllControllerAnswers.nullEdit
      const user = await pool.query("SELECT * FROM users WHERE id = $1",
      [userId])
      if(!user.rowCount) throw usersControllerAnswers.notFoundOneUser
      let innerQuery = ""
      let queryVars = []
      if(about) {
        queryVars.push(about)
        innerQuery = innerQuery + ` about = $${queryVars.length},`
      } if(email && oldEmail) {
        if(user.rows[0].email !== oldEmail) throw usersControllerAnswers.invalidEmail
        queryVars.push(email)
        innerQuery = innerQuery + ` email = $${queryVars.length},`
      } if(password && oldPassword) {
        const comparePassword = await compare(oldPassword, user.rows[0].password)
        if(!comparePassword) throw usersControllerAnswers.invalidPassword
        const hashedNewPassword = await hashPassword(password, 10)
        queryVars.push(hashedNewPassword)
        innerQuery = innerQuery + ` password = $${queryVars.length},`
      }
      innerQuery = innerQuery.slice(0, -1)
      queryVars.push(userId)
      await pool.query(`UPDATE users SET${innerQuery} WHERE id = $${queryVars.length}`, queryVars)
      res.send(generateSuccessResponse(userId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async toggleSubscribe (req: Request<{toggleSubscribeUserId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {toggleSubscribeUserId} = req.params
      const users = await pool.query("SELECT id FROM users WHERE id = $1", 
      [toggleSubscribeUserId])
      if(!users.rowCount) throw usersControllerAnswers.notFoundOneUser
      const isSubscribeAlreadyExist = await pool.query("SELECT id FROM subscribers WHERE user_id = $1 AND subscriber_user_id = $2", 
      [userId, toggleSubscribeUserId])
      let subscribeId
      if(isSubscribeAlreadyExist.rowCount) {
        subscribeId = isSubscribeAlreadyExist.rows[0].id
        await pool.query("DELETE FROM subscribers WHERE id = $1", [subscribeId])
      } else {
        const subscribeRowId = await pool.query("INSERT INTO subscribers (user_id, subscriber_user_id) values ($1, $2) RETURNING id",
        [userId, toggleSubscribeUserId])
        subscribeId = subscribeRowId.rows[0].id
      } 
      res.send(generateSuccessResponse(subscribeId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getMySubscriptionsByPage (req: Request<{page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {page} = req.params
      const indexes = {
        start: page === 1? 0 : (page - 1) * 25,
        end: 25
      }
      const subscriptions = await pool.query(`SELECT * FROM subscribers WHERE user_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [userId])
      if(!subscriptions.rowCount) throw usersControllerAnswers.notFoundSubscriptions 
      res.send(generateSuccessResponse(subscriptions.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getMySubscribersByPage (req: Request<{page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {page} = req.params
      const indexes = {
        start: page === 1? 0 : (page - 1) * 25,
        end: 25
      }
      const subscribers = await pool.query(`SELECT * FROM subscribers WHERE subscriber_user_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`,
      [userId])
      if(!subscribers.rowCount) throw usersControllerAnswers.notFoundSubscribers
      res.send(generateSuccessResponse(subscribers.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async toggleBlockUser (req: Request<{toggleBlockUserId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {toggleBlockUserId} = req.params
      const users = await pool.query("SELECT id FROM users WHERE id = $1", 
      [toggleBlockUserId])
      if(!users.rowCount) throw usersControllerAnswers.notFoundOneUser
      let blockId;
      const block = await pool.query("SELECT id FROM blocked_users WHERE user_id = $1 AND blocked_user_id = $2", 
      [userId, toggleBlockUserId])
      if (block.rowCount) {
        blockId = block.rows[0].id
        await pool.query("DELETE FROM blocked_users WHERE id = $1",
        [block.rows[0].id]) 
      } else {
        const inserted = await pool.query("INSERT INTO blocked_users (user_id, blocked_user_id) values ($1, $2) RETURNING id", 
        [userId, toggleBlockUserId])
        blockId = inserted.rows[0].id
      }
      res.send(generateSuccessResponse(blockId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getMyBlockedUsersByPage (req: Request<{page: number}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {page} = req.params
      const indexes = {
        start: page === 1 ? 0 : (page - 1) * 25,
        end: 25
      }
      const blockedUsers = await pool.query(`SELECT * FROM blocked_users WHERE user_id= $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [userId])
      if(!blockedUsers.rowCount) throw usersControllerAnswers.notFoundBlockedUsers
      res.send(generateSuccessResponse(blockedUsers.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async deleteByAuth (req: Request, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      await pool.query("DELETE FROM users WHERE id = $1", [userId])
      res.send(generateSuccessResponse(null, usersControllerAnswers.deleted))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getByPage (req: Request<{page: number}>, res: Response<IResponse>) {
    try {
      const {page} = req.params
      const indexes = {
        start: page === 1? 0: (page -1) * 25,
        end: 25
      }
      const users = await pool.query(`SELECT id, username FROM users OFFSET ${indexes.start} LIMIT ${indexes.end}`)
      if(!users.rowCount) throw usersControllerAnswers.notFoundUsers
      res.send(generateSuccessResponse(users.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`)) 
    }
  }
  static async getBySearchAndPage (req: Request<{page: number, search: string}, {}, {}>, res: Response<IResponse>) {
    try {
      const {page, search} = req.params
      const indexes = {
        start: page === 1? 0: (page - 1) * 25,
        end: 25
      }
      const users = await pool.query(`SELECT username, id FROM users WHERE LOWER(username) LIKE LOWER($1) OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [`%${search}%`])
      if(!users.rowCount) throw usersControllerAnswers.notFoundUsers
      res.send(generateSuccessResponse(users.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
}