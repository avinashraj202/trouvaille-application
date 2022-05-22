const express = require("express");
const multer = require("multer");
const router = express.Router();
const mime = require("mime-types");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const auth = require("../../../middleware/auth");
const Query = require("../../../config/db");
const sendNotification = require("./notification");

var storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.${mime.extension(file.mimetype)}`);
  },
});

//ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe');
//ffmpeg.setFfprobePath('C:/ffmpeg/bin/ffprobe.exe');
const dest = path.join(__dirname, "../thumbnail");

const upload = multer({ storage: storage });
router.post("/", auth, upload.single("fileData"), async (req, res, next) => {
  console.log(req.file);
  let { filename } = req.file;
  let { tags, tagPeople, caption, type } = JSON.parse(req.body.additional);
  const { _id } = req.user;

  //generate thumbnail
  if (type === "Videos") {
    const source = path.join(__dirname, `../uploads/${filename}`);
    ffmpeg(source).screenshots({
      timestamps: ["10%"],
      filename: `${filename}.png`,
      folder: dest,
      size: "320x400",
    });
  }

  type = type === "Photos" ? 0 : 1;
  const post = await Query(
    "INSERT INTO `posts`(`user_id`, `caption`, `url`, `type`, `time`) VALUES (?, ?, ?, ?, ?)",
    [_id, caption, filename, type, new Date()]
  );
  const postId = post.insertId;

  tags.map(async (value) => {
    await Query("INSERT INTO `tags`(`tag_id`, `post_id`) VALUES (?, ?)", [
      value.id,
      postId,
    ]);
  });

  tagPeople.map(async (value) => {
    await Query(
      "INSERT INTO `tag_people`(`user_id`, `post_id`) VALUES (?, ?)",
      [value.id, postId]
    );
  });

  res.send(JSON.stringify(req.file));

  Query("UPDATE `user_details` SET `reviews`=reviews+1 WHERE `user_id`=?", [
    _id,
  ]);
  sendNotificationToUser(tagPeople, _id, postId);
});

async function sendNotificationToUser(tagPeople, _id, postId) {
  let regTokens = [];
  let userId = [];
  const userName = await Query(
    "SELECT `name` from `user_details` WHERE `user_id` = ?",
    [_id]
  );
  const name = userName[0].name;
  const res = tagPeople.map(async (v, i) => {
    const result = await Query(
      "SELECT `token` from `device_token` WHERE `user_id` = ?",
      [v.id]
    );
    regTokens.push(result[0].token);
    userId.push(v.id);
  });

  await Promise.all(res);
  const notification = {
    title: "Tag",
    body: `${name} has tagged you in a post.`,
  };
  sendNotification(regTokens, notification, userId, _id, postId);
}

module.exports = router;
