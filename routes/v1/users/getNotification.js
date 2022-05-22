const express = require("express");
const router = express.Router();
const Query = require("../../../config/db");
const auth = require("../../../middleware/auth");
const gcm = require("node-gcm");

router.get("/", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const response = await Query(
      "SELECT n.*, u.name, u.dp, u.user_id FROM `notification` n INNER JOIN `user_details` u ON n.fromUser = u.user_id WHERE n.user_id = ? ORDER BY n.time DESC",
      [_id]
    );
    res.send(JSON.stringify(response));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/chatNotification", auth, async (req, res) => {
  try {
    const sender = new gcm.Sender("AIzaSyDDpWAyLyJCntVv0ucXJ2Jdak9bPHEy198");

    let { user_id, notification, data, messages, key } = req.body;
    const result = await Query(
      "SELECT `token` from `device_token` WHERE `user_id` = ?",
      [user_id]
    );
    let token = result[0] === undefined ? "" : result[0].token;
    let regTokens = [];
    regTokens.push(token);
    var message = new gcm.Message({
      priority: "high",
      notification,
      data,
    });
    sender.send(
      message,
      { registrationTokens: regTokens },
      function (err, response) {
        console.log(response);
      }
    );
    /*const chatId = `${Math.min(parseInt(data.payload.user_id), parseInt(user_id))}trouvaille${Math.max(parseInt(data.payload.user_id), parseInt(user_id))}`
    const bgData = {chatId, message:messages, key}
    var message1 = new gcm.Message({   
      priority: 'high',  
      data: bgData
    }); 
    sender.send(message1, { registrationTokens: regTokens }, function (err, response) {
     console.log(response);
    });*/
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
