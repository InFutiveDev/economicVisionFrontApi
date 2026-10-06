const Article = require("../models/Article");
const { presentArticle, presentCard, presentRelated } = require("../utils/present");

function clampLimit(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(50, Math.floor(number));
}

function clampPage(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? Math.floor(number) : 1;
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exact = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, "i");

function buildFilter(query) {
  const filter = {};
  if (query.category) filter.category = exact(query.category);
  if (query.subCategory) filter.subCategory = exact(query.subCategory);
  if (query.tag) filter.tags = exact(query.tag);
  if (query.featured === "true") filter.featured = true;

  const search = String(query.q || "").trim().slice(0, 100);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { title: pattern },
      { excerpt: pattern },
      { kicker: pattern },
      { tags: pattern },
      { category: pattern },
      { subCategory: pattern },
      { author: pattern },
    ];
  }
  return filter;
}

async function paginate(filter, query, fallbackLimit = 20) {
  const limit = clampLimit(query.limit, fallbackLimit);
  const page = clampPage(query.page);
  const [total, docs] = await Promise.all([
    Article.countDocuments(Article.publishedQuery(filter)),
    Article.find(Article.publishedQuery(filter))
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  return {
    articles: docs.map((doc) => presentCard(doc)),
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  };
}

async function list(req, res) {
  try {
    res.json(await paginate(buildFilter(req.query), req.query));
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

    const sameSection = article.subCategory
      ? { category: article.category, subCategory: article.subCategory }
      : { category: article.category };

    const [relatedDocs, moreDocs] = await Promise.all([
      Article.findPublished(
        { _id: { $ne: article._id }, ...sameSection },
        { sort: { publishedAt: -1, updatedAt: -1 }, limit: 4 }
      ),
      Article.findPublished(
        { _id: { $ne: article._id }, category: article.category },
        { sort: { publishedAt: -1, updatedAt: -1 }, limit: 4 }
      ),
    ]);

    const related = relatedDocs.map((doc) => presentCard(doc));
    let more = moreDocs.map((doc) => presentCard(doc));
    if (more.length < 4) {
      const fill = await Article.findPublished(
        { _id: { $nin: [article._id, ...moreDocs.map((doc) => doc._id)] } },
        { sort: { publishedAt: -1, updatedAt: -1 }, limit: 4 - more.length }
      );
      more = more.concat(fill.map((doc) => presentCard(doc)));
    }

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
  buildFilter,
  paginate,
  list,
  getBySlug,
};
