import { Request, Response } from "express";
import { pool } from "../../db";
import { IResponse } from "../../generalTypes";
import { chatsControllerAnswers, forAllControllerAnswers, usersControllerAnswers } from "../controllersMessages";
import { generateSuccessResponse, generateWrongResponse } from "../responseGenerators";

export class ChatsController {
  static async create (req: Request<{interlocutorId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {interlocutorId} = req.params
      const usersInterlocutor = await pool.query("SELECT id FROM users WHERE id = $1", 
      [interlocutorId])
      if(!usersInterlocutor.rowCount) throw usersControllerAnswers.notFoundOneUser
      //Если человек который создает чат раньше добавил человека в блок, он автоматом удаляется.
      //Но если тот кто в блоке пытается создать в чат, у него не выходит
      const block = await pool.query("SELECT * FROM blocked_users WHERE blocked_user = $1 AND user_id = $2", 
      [userId, interlocutorId])
      await pool.query("DELETE FROM blocked_users WHERE blocked_user = $1 AND user_id = $2", 
      [interlocutorId, userId])
      if(block.rowCount) throw chatsControllerAnswers.userBlocked
      const chatId = await pool.query("INSERT INTO chats(user1_id, user2_id) values($1, $2) RETURNING id", 
      [userId, interlocutorId])
      res.send(generateSuccessResponse(chatId.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getLastMessagesByChatIdAndPage (req: Request<{chatId: number, page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {chatId, page} = req.params
      const indexes = {
        start: page === 1? 0 : (page - 1) * 25,
        end: 25
      }
      const chat = await pool.query("SELECT user1_id, user2_id FROM chats WHERE id = $1", [chatId])
      if(!chat.rowCount) throw chatsControllerAnswers.notFoundChat
      if(chat.rows[0].user1_id !== userId && chat.rows[0].user2_id !== userId) throw chatsControllerAnswers.notYourChat
      const messages = await pool.query(
        `SELECT * FROM messages WHERE chat_id = $1 ORDER BY send_date DESC OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [chatId])
      if(!messages.rowCount) throw chatsControllerAnswers.chatEmpty
      res.send(generateSuccessResponse(messages.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getMyChatsByPage (req: Request<{page: number}, {}, {}>, res: Response) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {page} = req.params
      const indexes = {
        start: page === 1? 0 : (page - 1) * 25,
        end: 25
      }
      const chats = await pool.query(
        `SELECT * FROM chats WHERE user1_id = $1 OR user2_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [userId])
      if(!chats.rowCount) throw chatsControllerAnswers.notFoundChats
      res.send(generateSuccessResponse(chats.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async sendMessageByChatId (req: Request<{chatId: number}, {}, {content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {chatId} = req.params
      const {content} = req.body
      const chat = await pool.query("SELECT * FROM chats WHERE id = $1", [chatId])
      if(!chat.rowCount) throw chatsControllerAnswers.notFoundChat 
      if(chat.rows[0].user1_id !== userId && chat.rows[0].user2_id !== userId) throw chatsControllerAnswers.notYourChat
      const {user1_id, user2_id} = chat.rows[0]
      const interlocutorId = user1_id === userId? user1_id : user2_id
      //Если человек который отправляет сообщение раньше добавил человека в блок, он автоматом удаляется.
      //Но если отправляет тот кто в блоке, у него не выходит
      const block = await pool.query("SELECT * FROM blocked_users WHERE user_id = $1 AND blocked_user = $2", 
      [interlocutorId, userId])
      if(block.rowCount) throw chatsControllerAnswers.userBlocked
      await pool.query("DELETE FROM blocked_users WHERE id = $1 AND blocked_user = $2", 
      [userId, interlocutorId])
      const messageId = await pool.query(
        "INSERT INTO messages (content, is_first_user_sender, chat_id) values ($1, $2, $3) RETURNING id", 
      [content, user1_id === userId, chat.rows[0].id])
      res.send(generateSuccessResponse(messageId.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async editMessageByMessageId (req: Request<{messageId: number}, {}, {content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {content} = req.body
      const {messageId} = req.params
      const message = await pool.query("SELECT * FROM messages WHERE id = $1", [messageId])
      if(!message.rowCount) throw chatsControllerAnswers.notFoundMessage
      const chat = await pool.query("SELECT * FROM chats WHERE id = $1", [message.rows[0].chat_id])
      if(!chat.rowCount) throw chatsControllerAnswers.notFoundChat
      if(
        (chat.rows[0].user1_id === userId && chat.rows[0].is_first_user_sender)
        || 
        (chat.rows[0].user2_id !== userId && !chat.rows[0].is_first_user_sender)
        ) throw chatsControllerAnswers.notYourMessage
      await pool.query("UPDATE messages SET content = $1, edited = true WHERE id = $2", 
      [content, userId])
      res.send(generateSuccessResponse(messageId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async deleteMessageByMessageId (req: Request<{messageId: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {messageId} = req.params
      const message = await pool.query("SELECT chat_id, id FROM messages WHERE id = $1",
      [messageId])
      if(!message.rowCount) throw chatsControllerAnswers.notFoundMessage
      const chat = await pool.query("SELECT user1_id, user2_id FROM chats WHERE id = $1", 
      [message.rows[0].chat_id])
      if(!chat.rowCount) throw chatsControllerAnswers.notFoundChat
      if(
        (chat.rows[0].user1_id === userId && chat.rows[0].is_first_user_sender)
        || 
        (chat.rows[0].user2_id !== userId && !chat.rows[0].is_first_user_sender)
        ) throw chatsControllerAnswers.notYourMessage
      await pool.query("DELETE FROM messages WHERE id = $1", 
      [messageId])
      res.send(generateSuccessResponse(messageId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
}