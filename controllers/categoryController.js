const { categoryTree, resolveCategory } = require("../utils/categories");
const { paginate } = require("./articleController");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exact = (value) => new RegExp(`^${escapeRegex(value)}$`, "i");

async function list(req, res) {
  try {
    const navOnly = req.query.nav === "1" || req.query.nav === "true";
    res.json({ categories: await categoryTree({ navOnly }) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
}

async function getCategory(req, res) {
  try {
    const category = await resolveCategory(req.params.slug, req.params.sub);
    if (!category) return res.status(404).json({ message: "Category not found." });

    const filter = { category: exact(category.name) };
    if (category.sub) filter.subCategory = exact(category.sub.name);

    res.json({ category, ...(await paginate(filter, req.query, 18)) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category", error: error.message });
  }
}

module.exports = { list, getCategory };
