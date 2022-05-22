const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/auth");
const Query = require("../../../config/db");
const sendNotification = require("./notification");
const bcrypt = require("bcrypt");
const multer = require("multer");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const saltRounds = 10;

const DP_FOLDER = `/dp`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, `../dp/${req.user._id}/`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.${mime.extension(file.mimetype)}`);
  },
});
const upload = multer({ storage: storage });

router.post("/me", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const results = await Query(
      "SELECT * FROM `user_details` WHERE `user_id` = ?",
      [_id]
    );
    res.send(JSON.stringify(results[0]));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/chat", auth, async (req, res) => {
  try {
    const { chatArray } = req.body;
    chatArray.sort((a, b) => new Date(b.last_update) - new Date(a.last_update));
    let tempUser = [];
    chatArray.map((v) => tempUser.push(v.user_id));
    tempUser = `(${tempUser.toString()})`;
    const userResult = await Query(
      `SELECT user_id as id, name, user_name, dp FROM user_details WHERE user_id in ${tempUser}`
    );
    res.send(JSON.stringify(userResult));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/dp", auth, upload.single("fileData"), async (req, res) => {
  try {
    let { _id } = req.user;
    let { filename } = req.file;
    let imgPath = `${DP_FOLDER}/${_id}/${filename}`;
    await Query("UPDATE `user_details` SET `dp` = ? WHERE `user_id` = ?", [
      imgPath,
      _id,
    ]);
    res.send(JSON.stringify({ imgPath }));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.get("/radius", auth, async (req, res) => {
  try {
    let { _id } = req.user;
    const response = await Query(
      "SELECT `radius` from `user_details` WHERE `user_id` = ?",
      [_id]
    );
    const { radius } = response[0];
    res.send(JSON.stringify({ radius }));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/uradius", auth, async (req, res) => {
  try {
    let { _id } = req.user;
    let { radius } = req.body;
    const response = await Query(
      "UPDATE `user_details` SET `radius` = ? WHERE `user_id` = ?",
      [radius, _id]
    );
    res.send(JSON.stringify(response));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/pass", auth, async (req, res) => {
  try {
    let { newPass, currentPass } = req.body;
    const { _id } = req.user;

    const loginResults = await Query(
      "SELECT * FROM `login` WHERE `user_id` = ?",
      [_id]
    );
    const hash = loginResults[0].pwd;
    if (hash) {
      const isValid = await bcrypt.compare(currentPass, hash);
      if (!isValid)
        return res.status(400).send(
          JSON.stringify({
            response: "Invalid current Password",
            status: false,
          })
        );
    }

    const passHash = bcrypt.hashSync(newPass, saltRounds);
    await Query("Update `login` set `pwd` = ? WHERE `user_id` = ?", [
      passHash,
      _id,
    ]);
    res.send(JSON.stringify({ result: "Updated successfully.", status: true }));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/changePass", async (req, res) => {
  try {
    let { newPass, number } = req.body;
    const userId = await Query(
      "SELECT `user_id` FROM `user_details` WHERE `number` = ?",
      [number]
    );
    const { user_id } = userId[0];

    const passHash = bcrypt.hashSync(newPass, saltRounds);
    await Query("Update `login` set `pwd` = ? WHERE `user_id` = ?", [
      passHash,
      user_id,
    ]);
    res.send(JSON.stringify({ result: "Updated successfully.", status: true }));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.get("/interests", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const response = await Query(
      "SELECT interests FROM `user_details` WHERE `user_id` = ?",
      [_id]
    );
    const interestsIds = response[0].interests
      .replace(/\[/g, "(")
      .replace(/]/g, ")");
    const interests = await Query(
      "SELECT * FROM `interests` WHERE `sr_no` IN " + interestsIds
    );
    res.send(JSON.stringify(interests));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/saveInterests", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { interests } = req.body;
    const response = await Query(
      "UPDATE `user_details` SET `interests` = ? WHERE `user_id` = ?",
      [JSON.stringify(interests), _id]
    );
    res.send(JSON.stringify(response));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/allInterest", async (req, res) => {
  try {
    const results = await Query("SELECT * FROM `interests`");
    res.send(JSON.stringify(results));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    const {
      name,
      uname,
      email,
      number,
      dob,
      location,
      coordinates,
      bio,
      fb_id,
      insta_id,
      twitter_id,
    } = req.body;
    const { latitude, longitude } = coordinates;
    const { _id } = req.user;
    const response = await updateDataInTable([
      name,
      uname,
      email,
      number,
      dob,
      bio,
      location,
      latitude,
      longitude,
      fb_id,
      insta_id,
      twitter_id,
      _id,
    ]);
    res.send(JSON.stringify(response));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/user", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const { _id } = req.user;
    let isFollowing = await Query(
      "SELECT * FROM `followers` WHERE `follower`= ? AND `following` = ?",
      [_id, id]
    );
    isFollowing = isFollowing.length == 0 ? false : true;
    const results = await Query(
      "SELECT * FROM `user_details` WHERE `user_id` = ?",
      [id]
    );
    results[0].isFollowing = isFollowing;
    res.send(JSON.stringify(results[0]));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/getFollow", auth, async (req, res) => {
  try {
    const { type, user_id } = req.body;
    const typeText1 = type == "0" ? "follower" : "following";
    const typeText2 = type == "1" ? "follower" : "following";
    const followResult = await Query(
      `SELECT u.user_id as id, u.name, u.user_name, u.dp FROM user_details u INNER JOIN followers f ON f.${typeText1} = u.user_id WHERE f.${typeText2} = ?`,
      [user_id]
    );
    res.send(JSON.stringify(followResult));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/follow", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const { _id } = req.user;
    const isFollowing = await Query(
      "SELECT * FROM `followers` WHERE `follower`= ? AND `following` = ?",
      [_id, id]
    );
    if (isFollowing.length == 0) {
      Query("INSERT INTO `followers`(`follower`, `following`) VALUES (?, ?)", [
        _id,
        id,
      ]);
      Query(
        "UPDATE `user_details` SET following = following+1 WHERE user_id = ?",
        [_id]
      );
      Query(
        "UPDATE `user_details` SET followers = followers+1 WHERE user_id = ?",
        [id]
      );
    } else {
      Query(
        "DELETE FROM `followers` WHERE `follower` = ? AND `following` = ?",
        [_id, id]
      );
      Query(
        "UPDATE `user_details` SET following = following-1 WHERE user_id = ?",
        [_id]
      );
      Query(
        "UPDATE `user_details` SET followers = followers-1 WHERE user_id = ?",
        [id]
      );
    }
    res.send(JSON.stringify(isFollowing));

    if (isFollowing.length == 0) {
      sendNotificationToUser([id], _id);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/token", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { fcmToken } = req.body;
    const check = await Query(
      "SELECT * FROM `device_token` WHERE `user_id` = ?",
      [_id]
    );
    console.log(check);
    if (check.length != 0)
      Query("UPDATE `device_token` SET `token` = ? WHERE `user_id` = ?", [
        fcmToken,
        _id,
      ]);
    else
      Query("INSERT INTO `device_token`(`user_id`, `token`) VALUES (?, ?)", [
        _id,
        fcmToken,
      ]);
    res.send(JSON.stringify([]));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

async function sendNotificationToUser(tagPeople, _id) {
  let regTokens = [];
  const userName = await Query(
    "SELECT `name` from `user_details` WHERE `user_id` = ?",
    [_id]
  );
  const name = userName[0].name;
  const res = tagPeople.map(async (v, i) => {
    const result = await Query(
      "SELECT `token` from `device_token` WHERE `user_id` = ?",
      [v]
    );
    let token = result[0] === undefined ? "" : result[0].token;
    regTokens.push(token);
  });

  await Promise.all(res);
  const notification = {
    title: "Follow",
    body: `${name} started following you.`,
  };
  sendNotification(regTokens, notification, tagPeople, _id, "-1");
}

async function updateDataInTable(data) {
  const updateTable = await Query(
    "UPDATE `user_details` SET `name`= ?,`user_name`= ?,`email`= ?,`number`= ?,`dob`= ?,`bio`= ?,`location`= ?,`latitude`= ?, `longitude`= ?, `fb_id`= ?, `insta_id`= ?, `twitter_id`= ? WHERE `user_id` = ?",
    data
  );
  return updateTable;
}

module.exports = router;
