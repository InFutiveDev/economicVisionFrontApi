const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.list);
router.get("/:slug", categoryController.getCategory);
router.get("/:slug/:sub", categoryController.getCategory);

module.exports = router;
