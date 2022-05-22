const { Comment } = require("../../../service/v2");

const getComment = async (req, res, next) => {
  try {
    const data = await new Comment().getComment(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};
const addComment = async (req, res, next) => {
  try {
    const data = await new Comment().addComment(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};
const likeComment = async (req, res, next) => {
  try {
    const data = await new Comment().likeComment(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};

module.exports = { getComment, addComment, likeComment };
