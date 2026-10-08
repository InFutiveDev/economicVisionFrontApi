const express = require("express");
const articleController = require("../controllers/articleController");
const commentController = require("../controllers/commentController");

const router = express.Router();

router.get("/", articleController.list);
router.get("/:slug", articleController.getBySlug);
router.get("/:slug/comments", commentController.getCommentsBySlug);
router.post("/:slug/comments", commentController.createComment);

module.exports = router;
