const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const auth = require("../../../middleware/auth");
const { ErrorHandler, statusCodes } = require("../../../helper");
const { BAD_GATEWAY } = statusCodes;

async function sendNotificationToUser(people, _id, post_id, noti) {
  let regTokens = [];
  const userName = await Query(
    "SELECT `name` from `user_details` WHERE `user_id` = ?",
    [_id]
  );
  const { name } = userName[0];
  const res = people.map(async (v, i) => {
    const result = await Query(
      "SELECT `token` from `device_token` WHERE `user_id` = ?",
      [v]
    );
    let token = result[0] === undefined ? "" : result[0].token;
    regTokens.push(token);
  });

  await Promise.all(res);
  const notification = {
    title: noti.title,
    body: `${name} ${noti.body}`,
  };
  // sendNotification(regTokens, notification, people, _id, post_id);
}

class Comment {
  constructor() {}
  async getComment(req, res) {
    try {
      const post_id = req.body.postId;
      if (!post_id) throw new ErrorHandler(BAD_GATEWAY, "post_id is required");
      const { _id } = req.user;
      let commentsArray = [];
      let commentIdArray = [];
      const comments = await Query(
        "SELECT c.com_id, c.parent_id, c.created_at, c.comment, c.user_id, u.user_name, u.dp FROM comments c INNER JOIN user_details u ON u.user_id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC",
        [post_id]
      );
      const responses = comments.map(async (values) => {
        const { parent_id, com_id } = values;

        const likesTotal = await Query(
          "SELECT user_id FROM `likes` WHERE com_id = ?",
          [com_id]
        );

        const like = likesTotal.find((e) => e.user_id === _id) ? true : false;
        const likesCount = likesTotal.length;
        values.like = like;
        values.likesCount = likesCount;

        if (!parent_id) {
          values.childrens = [];
          commentsArray.push(values);
          commentIdArray.push(com_id);
        } else {
          const index = commentIdArray.indexOf(parent_id);
          commentsArray[index].childrens.push(values);
        }
      });
      await Promise.all(responses);
      return commentsArray;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }
  async addComment(req, res) {
    try {
      const { post_id, comment, parent_id } = req.body;
      if (!post_id) throw new ErrorHandler(BAD_GATEWAY, "post_id is required");
      if (!comment) throw new ErrorHandler(BAD_GATEWAY, "comment is required");
      // if (!parent_id)
      //   throw new ErrorHandler(BAD_GATEWAY, "parent_id is required");
      const { _id } = req.user;
      const result = Query(
        "INSERT INTO `comments`(`post_id`, `user_id`, `comment`, `parent_id`) VALUES (?, ?, ?, ?)",
        [post_id, _id, comment, parent_id]
      );

      const pattern = /@(\w+)/g;
      let matches = comment.match(pattern);
      if (matches != null) {
        let user_ids = [];
        const ids = matches.map(async (v) => {
          v = v.replace("@", "");
          const response = await Query(
            "SELECT `user_id` FROM `user_details` WHERE `user_name` = ?",
            [v]
          );
          user_ids.push(response[0].user_id);
        });

        await Promise.all(ids);
        const index = user_ids.indexOf(_id);
        if (index != -1) user_ids.splice(index, 1);
        const noti = {
          title: "Mention",
          body: "mentioned you in a comment.",
        };
        sendNotificationToUser(user_ids, _id, post_id, noti);
      }

      const response = await Query(
        "SELECT `user_id` FROM `posts` WHERE `post_id` = ?",
        [post_id]
      );
      const { user_id } = response[0];
      const noti = {
        title: "Comment",
        body: "commented on your post.",
      };
      if (user_id != _id) sendNotificationToUser([user_id], _id, post_id, noti);
      return result;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }

  async likeComment(req, res) {
    try {
      const { _id } = req.user;
      const { com_id, user_id } = req.body;
      if (!com_id) throw new ErrorHandler(BAD_GATEWAY, "com_id is required");
      if (!user_id) throw new ErrorHandler(BAD_GATEWAY, "user_id is required");

      const likePost = await Query(
        "SELECT * FROM `likes` WHERE `com_id` = ?  AND `user_id` =  ?",
        [com_id, _id]
      );
      if (likePost.length == 0)
        Query("INSERT INTO `likes`(`com_id`, `user_id`) VALUES(?, ?)", [
          com_id,
          _id,
        ]);
      else
        Query("DELETE FROM `likes` WHERE `com_id` = ? AND `user_id` = ?", [
          com_id,
          _id,
        ]);

      const postDet = await Query(
        "SELECT `post_id` FROM `comments` WHERE `com_id` = ?",
        [com_id]
      );
      let { post_id } = postDet[0];
      if (likePost.length == 0 && user_id != _id) {
        const noti = {
          title: "Like",
          body: "liked your comment",
        };
        if (user_id != _id)
          sendNotificationToUser([user_id], _id, post_id, noti);
      }
      return likePost;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }
}

module.exports = Comment;
