const express = require("express");
const { listEpapers, getEpaper } = require("../controllers/epaperController");

const router = express.Router();

router.get("/", listEpapers);
router.get("/:id", getEpaper);

module.exports = router;
