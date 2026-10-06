const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    order: Number,
    showInNav: Boolean,
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
