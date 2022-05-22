const express = require("express");
const router = express.Router();
const { dispatcher } = require("../../../middleware");
const {
  mePosts,
  userPosts,
  homePosts,
  allPosts,
} = require("../../../controllers/v2");
const auth = require("../../../middleware/auth");

router.post("/me", auth, (req, res, next) =>
  dispatcher(req, res, next, mePosts)
);
router.post("/user", auth, (req, res, next) =>
  dispatcher(req, res, next, userPosts)
);
router.post("/home", auth, (req, res, next) =>
  dispatcher(req, res, next, homePosts)
);
router.post("/all", auth, (req, res, next) =>
  dispatcher(req, res, next, allPosts)
);

module.exports = router;
