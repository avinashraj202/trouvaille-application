const gcm = require("node-gcm");
const Query = require("../../../config/db");

function sendNotification(regTokens, notification, userIds, fromUser, post_id) {
  const sender = new gcm.Sender("AIzaSyDDpWAyLyJCntVv0ucXJ2Jdak9bPHEy198");

  let type = post_id == -1 ? 2 : 0;
  var message = new gcm.Message({
    priority: "high",
    notification,
    data: { payload: { fromUser, post_id }, type },
  });

  sender.send(
    message,
    { registrationTokens: regTokens },
    function (err, response) {
      console.log(response);
    }
  );

  const content = notification.body;
  userIds.map((v, i) => {
    Query(
      "INSERT INTO `notification`(`fromUser` ,`user_id`, `content`, `post_id`) VALUES(?, ?, ?, ?)",
      [fromUser, v, content, post_id]
    );
  });
}

module.exports = sendNotification;
