const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const auth = require("../../../middleware/auth");

router.post("/tags", auth, async (req, res) => {
  const tagSearch = req.body.tag;
  try {
    const tagsResult = await Query(
      "SELECT tag_id as id, tag_name as name FROM pre_tags WHERE tag_name LIKE ?",
      [tagSearch]
    );
    res.send(JSON.stringify(tagsResult));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/users", auth, async (req, res) => {
  const { _id } = req.user;
  const userSearch = req.body.user;
  try {
    const userResult = await Query(
      "SELECT user_id as id, name, user_name, dp FROM user_details WHERE (name LIKE ? OR user_name LIKE ?) AND user_id != ? LIMIT 50",
      [userSearch, userSearch, _id]
    );
    res.send(JSON.stringify(userResult));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/email", async (req, res) => {
  const userEmail = req.body.data;
  console.log(userEmail);
  try {
    const userResult = await Query(
      "SELECT * FROM user_details WHERE email LIKE ?",
      [userEmail]
    );
    const exist = {
      isExisting: userResult.length == 0 ? false : true,
    };
    res.send(JSON.stringify(exist));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/uname", async (req, res) => {
  const uName = req.body.data;
  try {
    const userResult = await Query(
      "SELECT * FROM user_details WHERE user_name LIKE ?",
      [uName]
    );
    const exist = {
      isExisting: userResult.length == 0 ? false : true,
    };
    res.send(JSON.stringify(exist));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/number", async (req, res) => {
  const uNumber = req.body.data;
  try {
    const userResult = await Query(
      "SELECT * FROM user_details WHERE number LIKE ?",
      [uNumber]
    );
    const exist = {
      isExisting: userResult.length == 0 ? false : true,
    };
    res.send(JSON.stringify(exist));
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
