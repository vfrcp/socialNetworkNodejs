import { Router } from "express"; 
import { CommentsController } from "../../controllers/comments";

const {
  create, getByPostIdAndPage, reactionByCommentId, editByCommentId,
  deleteByCommentId, replyByCommentId, replayToAnotherReplayByCommentId, getReplaysByCommentIdAndPage,
} = CommentsController
const router = Router()

router.get("/getByPostIdAndPage/:postId/:page", getByPostIdAndPage)//Work +
router.get("/getReplaysByIdAndPage/:commentId/:page", getReplaysByCommentIdAndPage)//Work +
router.post("/reactionByCommentId/:commentId", reactionByCommentId)//Body: {isPositive: true} | Work +
router.post("/createByPostId/:postId", create)// Body: {content: string} Work +
router.post("/replayByCommentId/:commentId", replyByCommentId)// Body: {isPositive: boolean} | Work +
router.post("/replayToAnotherReplayByCommentId/:commentId", replayToAnotherReplayByCommentId)//Body: {anotherUsername: string, content: string} | Work +
router.patch("/editByCommentId/:commentId", editByCommentId)//Body: {content: string} | Work +
router.delete("/deleteByCommentId/:commentId", deleteByCommentId)//Work +

export default router