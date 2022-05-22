const Query = require("../../../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../../../utils/generateToken");
const { ErrorHandler, statusCodes } = require("../../../helper");
const { BAD_GATEWAY } = statusCodes;
class Auth {
  constructor() {}
  async login(req, res) {
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
      res.header("x-auth-token", generateToken(user_id));
      let data = { user_name, dp, status: "Success", user_id };
      return data;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }
}
module.exports = Auth;
