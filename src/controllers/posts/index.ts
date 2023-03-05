import { Request, Response } from "express";
import { pool } from "../../db";
import { IResponse } from "../../generalTypes";
import { forAllControllerAnswers, postsControllerAnswers, usersControllerAnswers } from "../controllersMessages";
import { generateSuccessResponse, generateWrongResponse } from "../responseGenerators";

export class PostsController {
  static async create (req: Request<{}, {}, {title: string, content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {title, content} = req.body
      const {userId} = req
      if(!title || !content) throw forAllControllerAnswers.nullPost
      const post = await pool.query("INSERT INTO posts (title, content, user_id) values($1, $2, $3) RETURNING id",
      [title, content, userId])
      res.send(generateSuccessResponse(post.rows[0]))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async editById (req: Request<{postId: string}, {}, {title?: string, content?: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {postId} = req.params
      const {title, content} = req.body
      if(!title && !content) throw forAllControllerAnswers.nullEdit
      const post = await pool.query("SELECT * FROM posts WHERE id = $1",
      [postId])
      if(!post.rows[0]) throw postsControllerAnswers.notFoundOnePost
      if(post.rows[0].user_id !== userId) throw postsControllerAnswers.notYourPost
      let innerQuery = ""
      let queryVars = []
      if(title) {
        queryVars.push(title)
        innerQuery = innerQuery + ` title = $${queryVars.length},`
      } if (content) {
        queryVars.push(content)
        innerQuery = innerQuery + ` content = $${queryVars.length},`
      }
      innerQuery.slice(0, -1)
      queryVars.push(userId)
      innerQuery = innerQuery.slice(0, -1)
      await pool.query(`UPDATE posts SET${innerQuery} WHERE id = $${queryVars.length}`, queryVars)
      res.send(generateSuccessResponse(postId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async deleteById (req: Request<{postId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {postId} = req.params
      const {userId} = req
      const post = await pool.query("SELECT * FROM posts WHERE id = $1",
      [postId])
      if(!post.rows[0]) throw postsControllerAnswers.notFoundOnePost
      if(post.rows[0].user_id !== userId) throw postsControllerAnswers.notYourPost
      await pool.query("DELETE FROM post_reactions WHERE post_id = $1", 
      [postId])
      await pool.query("DELETE FROM post_comments WHERE post_id = $1", 
      [postId])
      await pool.query("DELETE FROM posts WHERE id = $1",
      [postId])
      res.send(generateSuccessResponse(postsControllerAnswers.deleted))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async toggleReaction(req: Request<{postId: number}, {}, {isPositive: boolean}>, res: Response) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {postId} = req.params
      const {isPositive} = req.body
      let reactionId
      const reaction = await pool.query("SELECT * FROM post_reactions WHERE user_id = $1 AND post_id = $2", 
      [userId, postId])
        if(reaction.rowCount) {
          await pool.query("DELETE FROM post_reactions WHERE user_id = $1 AND post_id = $2", [userId, postId])
          reactionId = reaction
        } else {
          reactionId = await pool.query("INSERT INTO post_reactions (user_id, post_id, is_positive) values($1, $2, $3) RETURNING id",
          [userId, postId, isPositive])
          isPositive? 
            await pool.query("UPDATE post_comments SET likes = likes + 1"):
            await pool.query("UPDATE post_comments SET dislikes = dislikes - 1")
        }
        res.send(generateSuccessResponse(reactionId?.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getById (req: Request<{postId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {postId} = req.params
      const post = await pool.query(`
      SELECT *, (SELECT COUNT(*) FROM post_reactions WHERE post_id = $1 AND isPositive = true) AS likes,
      (SELECT COUNT(*) FROM post_reactions WHERE post_id = $1 AND isPositive = false) AS dislikes
      FROM posts WHERE id = $1
      `,
      [postId])
      if(!post.rowCount) throw postsControllerAnswers.notFoundOnePost
      post.rows[0].views++
      post.rows[0].likes = +post.rows[0].likes
      post.rows[0].dislikes = +post.rows[0].dislikes
      await pool.query("UPDATE posts SET views = $1 WHERE id = $2",
      [post.rows[0].views, postId])
      res.send(generateSuccessResponse(post.rows[0]))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getAllByUserIdAndPage (req: Request<{userId: number, page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {userId, page} = req.params
      const indexes = {
        start: page === 1? 0: (page - 1) * 25,
        end: 25
      }
      const posts = await pool.query(`SELECT * FROM posts WHERE user_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`,
      [userId])
      if(!posts.rows[0]) throw postsControllerAnswers.notFoundPosts
      res.send(generateSuccessResponse(posts.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getBySearchAndPage (req: Request<{search: string, page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {search, page} = req.params
      const indexes = {
        start: page === 1 ? 0: (page - 1) * 25,
        end: 25
      }
      const posts = await pool.query(`SELECT * FROM posts WHERE LOWER(title) LIKE LOWER($1) OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [`%${search}%`])
      if(!posts.rowCount) throw postsControllerAnswers.notFoundPosts
      res.send(generateSuccessResponse(posts.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
}