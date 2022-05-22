const { Auth } = require("../../../service/v2");

const login = async (req, res, next) => {
  try {
    const data = await new Auth().login(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
