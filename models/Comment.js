const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    articleSlug: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    status: { type: String, default: "approved", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
