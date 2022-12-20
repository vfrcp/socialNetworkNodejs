import { Router } from "express";
import { PostsController } from "../../controllers/posts";

const {create, getById, deleteById, editById, toggleReaction, getBySearchAndPage, getAllByUserIdAndPage} = PostsController
const router = Router()

router.get("/getByPostId/:postId", getById)//Work +
router.get("/getBySearchAndPage/:search/:page", getBySearchAndPage)// Work +
router.get("/getAllByUserIdAndPage/:userId/:page", getAllByUserIdAndPage)// Work +
router.post("/create", create)// Body: {title: string, content: string} | Work +
router.post("/toggleReaction/:postId", toggleReaction)// Body: {isPositive: boolean} | Work +
router.patch("/editByPostId/:postId", editById)// Body: {title?: string, content?: string} Work +
router.delete("/deleteByPostId/:postId", deleteById)//Work +

export default router