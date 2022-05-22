var express = require("express");
var app = express();

const Comment = require("./users/comments");
const GetPost = require("./users/getPosts");

app.use("/comments", Comment);
app.use("/posts", GetPost);


module.exports = app;
