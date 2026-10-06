const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, index: true },
    kicker: String,
    excerpt: String,
    category: String,
    subCategory: String,
    tags: [String],
    coverImage: String,
    featured: Boolean,
    author: String,
    status: { type: String, index: true },
    publishedAt: Date,
    views: Number,
    blocks: { type: Array, default: [] },
  },
  { timestamps: true, strict: false }
);

articleSchema.statics.publishedQuery = function publishedQuery(extra = {}) {
  return { status: "published", ...extra };
};

articleSchema.statics.findPublished = function findPublished(extra = {}, options = {}) {
  const query = this.find(this.publishedQuery(extra));

  if (options.sort) query.sort(options.sort);
  if (options.limit) query.limit(options.limit);

  return query;
};

articleSchema.statics.findOnePublished = function findOnePublished(extra = {}) {
  return this.findOne(this.publishedQuery(extra));
};

module.exports = mongoose.models.Article || mongoose.model("Article", articleSchema);
