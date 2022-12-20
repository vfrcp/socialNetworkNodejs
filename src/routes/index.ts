import { Router } from "express";

import usersRouter from "./users";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import chatsRouter from "./chats";
import invalidRouter from "./invalidPage";

const router = Router()

router.use("/users", usersRouter)
router.use("/posts", postsRouter)
router.use("/comments", commentsRouter)
router.use("/chats", chatsRouter)
router.use("*", invalidRouter)

export default router