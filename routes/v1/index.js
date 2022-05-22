var express = require("express");
var app = express();
const register = require("./users/register");
const uploads = require("./users/uploads");
const search = require("./users/search");
const getPosts = require("./users/getPosts");
const comments = require("./users/comments");
const user = require("./users/user");
const auth = require("./users/auth");
const posts = require("./users/posts");
const notification = require("./users/getNotification");

app.use("/api/register", register);
app.use("/api/uploads", uploads);
app.use("/api/search", search);
app.use("/api/posts", getPosts);
app.use("/api/comments", comments);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/post", posts);
app.use("/api/notification", notification);

module.exports = app;
