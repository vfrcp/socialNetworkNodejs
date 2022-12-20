export enum usersControllerAnswers {
  deleted = "The user deleted",
  notFoundOneUser = "The user not found",
  notFoundUsers = "Users not found",
  notFoundSubscriptions = "Subscriptions not found",
  notFoundSubscribers = "Subscribers not found",
  notFoundBlockedUsers = "Blocked users not found",
  invalidPassword = "The password is wrong",
  invalidEmail = "The email is wrong",
}
export enum postsControllerAnswers {
  notFoundOnePost = "The post not found",
  notFoundPosts = "Posts not found",
  deleted = "The post deleted",
  edited = "The post edited",
  notYourPost = "The post is not your",
  liked = "The post disliked",
  alreadyLiked = "The post already liked",
  disliked = "The post liked",
  alreadyDisliked = "The post already disliked"
}
export enum commentsControllerAnswers {
  notFoundOneComment = "The comment not found",
  notYourComment = "The comment is not your",
  notHasReplays = "The comment has not replays"
}
export enum chatsControllerAnswers {
  notFoundChat = "The chat not found",
  notFoundChats = "Chats not found",
  notYourChat = "The chat is not your",
  userBlocked = "The user blocked you",
  chatEmpty = "The chat is empty",
  notFoundMessage = "The message not found",
  notYourMessage = "The message is not your"
} 

export enum forAllControllerAnswers {
  auth = "Auth first",
  nullEdit = "Enter what you want to change",
  nullPost = "Enter post data correct"
}
