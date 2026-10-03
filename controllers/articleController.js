const Article = require("../models/Article");
const { presentArticle, presentCard, presentRelated } = require("../utils/present");

function clampLimit(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(50, Math.floor(number));
}

async function list(req, res) {
  try {
    const limit = clampLimit(req.query.limit, 20);
    const filter = {};

    if (req.query.category) {
      filter.category = String(req.query.category).trim();
    }
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    const articles = await Article.findPublished(filter, {
      sort: { publishedAt: -1, updatedAt: -1 },
      limit,
    });

    res.json({ articles: articles.map(presentCard) });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
}

async function getBySlug(req, res) {
  try {
    const article = await Article.findOnePublished({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    const [relatedDocs, moreDocs] = await Promise.all([
      Article.findPublished(
        {
          _id: { $ne: article._id },
          category: article.category,
        },
        { sort: { publishedAt: -1, updatedAt: -1 }, limit: 4 }
      ),
      Article.findPublished(
        { _id: { $ne: article._id } },
        { sort: { publishedAt: -1, updatedAt: -1 }, limit: 4 }
      ),
    ]);

    const related = relatedDocs.map(presentCard);
    const more = moreDocs.map(presentCard);

    res.json({
      article: presentArticle(article),
      related: related.map(presentRelated),
      more: more.map(presentRelated),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch article",
      error: error.message,
    });
  }
}

module.exports = {
  list,
  getBySlug,
};
