const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../../../utils/generateToken");

router.post("/", async (req, res) => {
  try {
    const { email, pass } = req.body;
    const loginResults = await Query(
      "SELECT * FROM `login` WHERE `email` = ?",
      [email]
    );
    const hash = loginResults[0].pwd;
    const isValid = await bcrypt.compare(pass, hash);
    if (!isValid)
      return res.status(400).send(JSON.stringify({ status: "Failure" }));

    const userDetails = await Query(
      "SELECT `user_id`, `user_name`, `dp` FROM `user_details` WHERE `email` = ?",
      [email]
    );
    const { user_id, user_name, dp } = userDetails[0];
    res
      .header("x-auth-token", generateToken(user_id))
      .send(JSON.stringify({ user_name, dp, status: "Success", user_id }));
  } catch (err) {
    res.status(400).send(JSON.stringify({ status: "Failure" }));
  }
});

module.exports = router;
