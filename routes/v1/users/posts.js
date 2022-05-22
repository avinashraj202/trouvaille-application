const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const auth = require("../../../middleware/auth");
const sendNotification = require("./notification");

router.post("/", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { post_id } = req.body;
    const posts = await Query(
      "SELECT p.*, u.user_name, u.dp FROM `posts` p INNER JOIN `user_details` u ON p.user_id = u.user_id WHERE p.post_id = ? AND p.status = '1'  ORDER BY time DESC",
      [post_id]
    );
    const response = await getPosts(posts, _id);
    return res.send(response);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/getLikes", auth, async (req, res) => {
  try {
    const { post_id } = req.body;
    const likeResult = await Query(
      "SELECT u.user_id as id, u.name, u.user_name, u.dp FROM user_details u INNER JOIN post_like p ON p.user_id = u.user_id WHERE p.post_id = ?",
      [post_id]
    );
    res.send(JSON.stringify(likeResult));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/like", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { post_id, user_id } = req.body;

    const likePost = await Query(
      "SELECT * FROM `post_like` WHERE `post_id` = ?  AND `user_id` =  ?",
      [post_id, _id]
    );
    if (likePost.length == 0)
      Query("INSERT INTO `post_like`(`post_id`, `user_id`) VALUES(?, ?)", [
        post_id,
        _id,
      ]);
    else
      Query("DELETE FROM `post_like` WHERE `post_id` = ? AND `user_id` = ?", [
        post_id,
        _id,
      ]);
    res.send(JSON.stringify(likePost));

    if (likePost.length == 0 && user_id != _id) {
      sendNotificationToUser([user_id], _id, post_id);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

async function getPosts(posts, u_id) {
  var responseArray = [];

  const responses = posts.map(async (value) => {
    const { post_id, user_id, caption, url, type, time, user_name, dp } = value;
    const tags = await Query(
      "SELECT  p.tag_name from `pre_tags` p INNER JOIN tags t WHERE t.tag_id = p.tag_id AND t.post_id = ?",
      [post_id]
    );
    const tagPeople = await Query(
      "SELECT u.user_name, u.user_id FROM `user_details` u INNER JOIN `tag_people` t WHERE t.user_id = u.user_id AND t.post_id = ?",
      [post_id]
    );
    let commentCount = await Query(
      "SELECT count(*) as total FROM `comments` WHERE `post_id` = ?",
      [post_id]
    );
    let likeCount = await Query(
      "SELECT * FROM `post_like` WHERE `post_id` = ?",
      [post_id]
    );
    commentCount = commentCount[0].total;
    let isLiked =
      likeCount.find((v, i) => v.user_id === u_id) == null ? false : true;
    likeCount = likeCount.length;
    const response = {
      post_id,
      user_id,
      user_name,
      dp,
      caption,
      url,
      type,
      time,
      tags,
      tagPeople,
      isLiked,
      commentCount,
      likeCount,
    };
    responseArray.push(response);
  });
  await Promise.all(responses);
  return JSON.stringify(responseArray);
}

async function sendNotificationToUser(people, _id, post_id) {
  let regTokens = [];
  const userName = await Query(
    "SELECT `name` from `user_details` WHERE `user_id` = ?",
    [_id]
  );
  const name = userName[0].name;
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
    title: "Like",
    body: `${name} liked your post.`,
  };
  sendNotification(regTokens, notification, people, _id, post_id);
}

module.exports = router;
