import { Request, Response } from "express";
import { pool } from "../../db";
import { IResponse } from "../../generalTypes";
import { commentsControllerAnswers, forAllControllerAnswers } from "../controllersMessages";
import { generateSuccessResponse, generateWrongResponse } from "../responseGenerators";

export class CommentsController {
  static async create (req: Request<{postId: number}, {}, {content: string}>, res: Response) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {postId} = req.params
      const {content} = req.body
      const comment = await pool.query("INSERT INTO post_comments (user_id, post_id, content) values($1, $2, $3) RETURNING id", 
      [userId, postId, content])
      res.send(generateSuccessResponse(comment.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getByPostIdAndPage (req: Request<{postId: number, page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {postId, page} = req.params
      const indexes = {
        start: page === 1 ? 0 : (page - 1) * 25,
        end: 25
      }
      const comments = await pool.query(
        `SELECT * FROM post_comments
        WHERE post_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`,
        [postId]
      )
      if(!comments.rowCount) throw commentsControllerAnswers.notFoundOneComment
      res.send(generateSuccessResponse(comments.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async editByCommentId (req: Request<{commentId: number}, {}, {content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {commentId} = req.params
      const {content} = req.body
      const comment = await pool.query("SELECT user_id FROM post_comments WHERE id = $1", 
      [commentId, userId])
      if(!comment.rows[0]) throw commentsControllerAnswers.notFoundOneComment
      if(comment.rows[0].user_id !== userId) throw commentsControllerAnswers.notYourComment
      await pool.query("UPDATE post_comments SET edited = true, content = $1 WHERE id = $2",
      [content, commentId])
      res.send(generateSuccessResponse(commentId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    } 
  }
  static async deleteByCommentId (req: Request<{commentId: number}, {}, {}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {commentId} = req.params
      const comment = await pool.query("SELECT user_id FROM post_comments WHERE id = $1", 
      [commentId])
      if(!comment.rows[0]) throw commentsControllerAnswers.notFoundOneComment
      if(comment.rows[0].user_id !== userId) throw commentsControllerAnswers.notYourComment
      await pool.query("DELETE FROM post_comments WHERE replay_to_comment_id = $1", 
      [commentId])
      await pool.query("DELETE FROM post_comments WHERE id = $1", 
      [commentId])
      res.send(generateSuccessResponse(commentId))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async reactionByCommentId(req: Request<{commentId: number}, {}, {isPositive: boolean}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {commentId} = req.params
      const {isPositive} = req.body
      
      const reaction = await pool.query("SELECT is_positive FROM post_comments_reactions WHERE id = $1 AND user_id = $2", 
      [commentId, userId])
      if(reaction.rows[0]) {
        await pool.query("DELETE FROM post_comments_reactions WHERE id = $1",
        [commentId])
      } else {
        await pool.query("INSERT INTO post_comments_reactions (user_id, comment_id, is_positive) values($1, $2, $3)", 
        [userId, commentId, isPositive])
        isPositive?
          await pool.query("UPDATE post_comments SET likes = likes + 1 WHERE id = $1", [commentId]):
          await pool.query("UPDATE post_comments SET dislikes = dislikes - 1 WHERE id = $1", [commentId])
      }
      res.send(generateSuccessResponse(null))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async replyByCommentId (req: Request<{commentId: number}, {}, {content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {userId} = req
      const {commentId} = req.params
      const {content} = req.body
      const replay = await pool.query("INSERT INTO comment_replays (content, user_id, comment_id) values ($1, $2, $3) RETURNING id", 
      [content, userId, commentId])
      await pool.query("UPDATE post_comments SET is_has_replays = true WHERE id = $1", 
      [commentId])
      res.send(generateSuccessResponse(replay.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async replayToAnotherReplayByCommentId(req: Request<{commentId: number}, {}, {anotherUsername: string, content: string}>, res: Response<IResponse>) {
    try {
      if(!req.userId) throw forAllControllerAnswers.auth
      const {commentId} = req.params
      const {userId} = req
      const {anotherUsername, content} = req.body
      const comment = await pool.query("SELECT id FROM comments WHERE id = $1", 
      [commentId])
      if(!comment.rowCount) throw commentsControllerAnswers.notFoundOneComment
      const modifiedContent = `@${anotherUsername}: ${content}`
      const replayId = await pool.query("INSERT INTO comment_replays (content, user_id, comment_id) values ($1, $2, $3) RETURNING id", 
      [modifiedContent, userId, commentId])
      res.send(generateSuccessResponse(replayId.rows[0].id))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
  static async getReplaysByCommentIdAndPage (req: Request<{commentId: number, page: number}, {}, {}>, res: Response<IResponse>) {
    try {
      const {commentId, page} = req.params
      const isCommentHasReplays = await pool.query("SELECT is_has_replays FROM post_comments WHERE id = $1",
      [commentId])
      if(!isCommentHasReplays.rowCount) throw commentsControllerAnswers.notHasReplays
      const indexes = {
        start: page === 1? 0: (page -1) * 25,
        end: 25
      }
      const replays = await pool.query(
        `SELECT * FROM comment_replays WHERE comment_id = $1 OFFSET ${indexes.start} LIMIT ${indexes.end}`, 
      [commentId])
      if(!replays.rows[0]) throw commentsControllerAnswers.notHasReplays
      res.send(generateSuccessResponse(replays.rows))
    } catch (err) {
      res.send(generateWrongResponse(`${err}`))
    }
  }
}