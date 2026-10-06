const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    type: String,
    title: String,
    summary: String,
    image: String,
    url: String,
    duration: String,
    order: Number,
    published: Boolean,
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Media || mongoose.model("Media", mediaSchema);
