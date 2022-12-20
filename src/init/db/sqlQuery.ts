export const sqlQuery = {
  createDatabase: (dbName: string) => {return `CREATE DATABASE ${dbName}`},
  deleteDatabaseIfExist: (dbName: string) => {return `DROP DATABASE IF EXISTS ${dbName}`},
  createUsersTable: `CREATE TABLE users(
    id SERIAL PRIMARY KEY, username VARCHAR UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    registration_date DATE DEFAULT CURRENT_TIMESTAMP,
    about VARCHAR)`,
  createSubscribersTable: `CREATE TABLE subscribers(
    id SERIAL PRIMARY KEY,
    subscriber_user_id INT NOT NULL, 
    FOREIGN KEY (subscriber_user_id) REFERENCES users (id),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`,
  createBlockedUsersTable: `CREATE TABLE blocked_users(
    id SERIAL PRIMARY KEY,
    blocked_user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`,
  createChatsTable: `CREATE TABLE chats(
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users (id),
    user2_id INT NOT NULL,
    FOREIGN KEY (user2_id) REFERENCES users (id)
  )`,
  createMessagesTable: `CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    content VARCHAR NOT NULL,
    edited BOOLEAN DEFAULT false NOT NULL,
    send_date DATE DEFAULT CURRENT_TIMESTAMP,
    is_first_user_sender BOOLEAN NOT NULL,
    chat_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
  )`,
  createPostsTable: `CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title VARCHAR UNIQUE NOT NULL,
    content VARCHAR NOT NULL,
    views INT DEFAULT 0 NOT NULL,
    creation_date DATE DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`,
  createPostReactionsTable: `CREATE TABLE post_reactions(
    id SERIAL PRIMARY KEY,
    is_positive BOOLEAN NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    post_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id)
  )`,
  createPostCommentsTable: `CREATE TABLE post_comments(
    id SERIAL PRIMARY KEY,
    content VARCHAR NOT NULL,
    edited BOOLEAN DEFAULT false NOT NULL,
    is_has_replays BOOLEAN DEFAULT FALSE NOT NULL,
    likes INT DEFAULT 0 NOT NULL,
    dislikes INT DEFAULT 0 NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    post_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id)
  )`,
  createCommentReplaysTable: `CREATE TABLE comment_replays(
    id SERIAL PRIMARY KEY,
    content VARCHAR NOT NULL,
    edited BOOLEAN DEFAULT FALSE NOT NULL,
    likes INT DEFAULT 0 NOT NULL,
    dislikes INT DEFAULT 0 NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    comment_id INT NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES post_comments (id) 
  )`,
  createPostCommentsReactionsTable: `CREATE TABLE post_comments_reactions(
    id SERIAL PRIMARY KEY,
    is_positive BOOLEAN NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    comment_id INT NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES posts (id)
  )`,
}