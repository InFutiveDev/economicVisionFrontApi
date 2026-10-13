const mongoose = require("mongoose");

const epaperPageSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    pageNumber: { type: Number, required: true },
    title: { type: String, default: "", trim: true },
    image: { type: String, required: true },
    description: { type: String, default: "", trim: true },
    paragraph: { type: String, default: "", trim: true },
    customDesign: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const epaperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "संवाद फर्स्ट",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    dateShort: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paragraph: {
      type: String,
      default: "",
      trim: true,
    },
    excerpt: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    paragraphs: {
      type: [String],
      default: [],
    },
    cover: {
      type: String,
      default: "",
      trim: true,
    },
    pages: {
      type: [epaperPageSchema],
      default: [],
    },
    today: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

epaperSchema.index({ city: 1, date: -1 });


epaperSchema.statics.publishedQuery = function publishedQuery(extra = {}) {
  return { status: "published", ...extra };
};

module.exports = mongoose.models.Epaper || mongoose.model("Epaper", epaperSchema);
