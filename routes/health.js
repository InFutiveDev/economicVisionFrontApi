const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

router.get("/", healthController.getRoot);
router.get("/health", healthController.getHealth);

module.exports = router;
