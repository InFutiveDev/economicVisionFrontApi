const express = require("express");
const articleController = require("../controllers/articleController");

const router = express.Router();

router.get("/", articleController.list);
router.get("/:slug", articleController.getBySlug);

module.exports = router;
