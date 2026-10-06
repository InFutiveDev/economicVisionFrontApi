const mongoose = require("mongoose");

const homeSectionSchema = new mongoose.Schema(
  {
    key: String,
    items: [
      {
        _id: false,
        article: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
        label: String,
        note: String,
      },
    ],
  },
  { timestamps: true, strict: false }
);

module.exports =
  mongoose.models.HomeSection || mongoose.model("HomeSection", homeSectionSchema);
