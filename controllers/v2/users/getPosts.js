const { GetPost } = require("../../../service/v2");

const mePosts = async (req, res, next) => {
  try {
    const data = await new GetPost().mePosts(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};
const userPosts = async (req, res, next) => {
  try {
    const data = await new GetPost().userPosts(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};
const homePosts = async (req, res, next) => {
  try {
    const data = await new GetPost().homePosts(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};
const allPosts = async (req, res, next) => {
  try {
    const data = await new GetPost().allPosts(req, res);
    return data;
  } catch (err) {
    next(err);
  }
};

module.exports = { mePosts, userPosts, homePosts, allPosts };
