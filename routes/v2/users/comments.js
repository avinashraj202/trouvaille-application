const express = require("express");
const router = express.Router();
const { dispatcher } = require("../../../middleware");
const {
  getComment,
  addComment,
  likeComment,
} = require("../../../controllers/v2");
const auth = require("../../../middleware/auth");

router.post("/", auth, (req, res, next) =>
  dispatcher(req, res, next, getComment)
);
router.post("/add", auth, (req, res, next) =>
  dispatcher(req, res, next, addComment)
);
router.post("/like", auth, (req, res, next) =>
  dispatcher(req, res, next, likeComment)
);

module.exports = router;
