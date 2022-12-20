import { Router } from "express";
import { UsersController } from "../../controllers/users";

const {
  register, login, deleteByAuth, getByPage, getBySearchAndPage, editByAuth, getByUserId,
  getMyBlockedUsersByPage, getMySubscribersByPage, getMySubscriptionsByPage, toggleBlockUser, toggleSubscribe, 
} = UsersController
const router = Router()

router.get("/getByBlockedUsersByPage/:page", getMyBlockedUsersByPage)// Work +
router.get("/getMySubscribersByPage/:page", getMySubscribersByPage)// Work +
router.get("/getMySubscribersByPage/:page", getMySubscribersByPage)// Work +
router.get("/getMySubscriptionsByPage/:page", getMySubscriptionsByPage)// Work +
router.get("/getByUserId/:userId", getByUserId)// Work +
router.get("/getByPage/:page", getByPage)// Work +
router.get("/getBySearchAndPage/:search/:page", getBySearchAndPage)//Work +
router.get("/toggleBlockUser/:toggleBlockUserId", toggleBlockUser)// Work +
router.get("/toggleSubscribe/:toggleSubscribeUserId", toggleSubscribe)// Work  
router.post("/register", register)// Body: {username: string, email: string, password: string} | Work: +
router.post("/login", login)// Body: {username: string, password: string} | Work +
router.patch("/editByAuth", editByAuth)// Body: {oldEmail?: string, email?: string, oldPassword?: string, password?: string, about?: string} | Work +
router.delete("/deleteByAuth", deleteByAuth)// Work +

export default router