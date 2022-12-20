import { Router } from "express"; 
import { ChatsController } from "../../controllers/chats";

const {
  create, getLastMessagesByChatIdAndPage, getMyChatsByPage,
  sendMessageByChatId, editMessageByMessageId, deleteMessageByMessageId} = ChatsController
const router = Router()
router.get("/getLastMessagesByChatIdAndPage/:chatId/:page", getLastMessagesByChatIdAndPage)//Work +
router.get("/getMyChatsByPage/:page", getMyChatsByPage)//Work +
router.post("/sendMessageByChatId/:chatId", sendMessageByChatId)// Body: {content: string} Work + 
router.patch("/editMessageByMessageId/:messageId", editMessageByMessageId)// Body: {content: string} Work +
router.delete("/deleteMessageByMessageId/:messageId", deleteMessageByMessageId)// Work +
router.post("/create/:interlocutorId", create)//Work +

export default router