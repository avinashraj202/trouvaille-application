const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const generateToken = require("../../../utils/generateToken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/", async (req, res) => {
  const {
    name,
    uname,
    email,
    number,
    dob,
    location,
    coordinates,
    type,
    password,
    radius,
  } = req.body;
  try {
    const { latitude, longitude } = coordinates;
    let passHash;
    if (type == "0") {
      passHash = bcrypt.hashSync(password, saltRounds);
    }
    let user_id = await insertDataToTable(
      [name, uname, email, number, dob, location, latitude, longitude, radius],
      type,
      passHash
    );
    res
      .header("x-auth-token", generateToken(user_id))
      .send(JSON.stringify({ user_id }));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/check", async (req, res) => {
  const { email } = req.body;
  let result = await checkIfExists(email);
  const { user_id } = result;
  res
    .header("x-auth-token", generateToken(user_id))
    .send(JSON.stringify(result));
});

async function checkIfExists(email) {
  const response = await Query(
    "SELECT `user_id`, `user_name`, `dp` FROM `user_details` WHERE `email` = ?",
    [email]
  );
  let result = response.length == 0 ? false : true;
  let obj = {};
  if (response.length == 0) obj.result = result;
  else {
    obj = response[0];
    obj.result = result;
  }
  console.log(obj);
  return obj;
}

async function insertDataToTable(data, type, passHash) {
  const insertToUserTable = await Query(
    "INSERT INTO `user_details`(`name`, `user_name`, `email`, `number`, `dob`, `location`, `latitude`, `longitude`, `radius`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    data
  );
  const user_id = insertToUserTable.insertId;
  await Query(
    "INSERT INTO `login`(`user_id`, `email`,`type`, `pwd`) VALUES (?, ?, ?, ?)",
    [user_id, data[2], type, passHash]
  );
  return user_id;
}

module.exports = router;
