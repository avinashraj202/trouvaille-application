const { login } = require("./users/auth");
const { getComment, addComment, likeComment } = require("./users/comments");
const { mePosts, userPosts, homePosts, allPosts } = require("./users/getPosts");


module.exports = {
  // Auth
  login,

  // comments
  getComment,
  addComment,
  likeComment,

  // getPosts
  mePosts,
  userPosts,
  homePosts,
  allPosts,
};
