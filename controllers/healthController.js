const mongoose = require("mongoose");

function getRoot(req, res) {
  res.json({
    name: "Economic Vision API",
    status: "ok",
    version: "1.0.0",
  });
}

function getHealth(req, res) {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
}

module.exports = {
  getRoot,
  getHealth,
};
