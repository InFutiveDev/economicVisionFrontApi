const express = require("express");
const { findMedia } = require("../utils/media");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50));
    res.json({ items: await findMedia({ type: req.query.type, limit }) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch media", error: error.message });
  }
});

module.exports = router;
