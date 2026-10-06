const Article = require("../models/Article");
const Category = require("../models/Category");
const { slugify, categoryHref } = require("./slug");

const byOrder = (a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(b.name);

function presentNode(doc, parentName) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: slugify(doc.name),
    description: doc.description || "",
    href: parentName ? categoryHref(parentName, doc.name) : categoryHref(doc.name),
  };
}

async function categoryTree({ navOnly = false } = {}) {
  const docs = await Category.find(navOnly ? { showInNav: { $ne: false } } : {}).lean();
  const mains = docs.filter((doc) => !doc.parent).sort(byOrder);
  return mains.map((main) => ({
    ...presentNode(main),
    children: docs
      .filter((doc) => doc.parent && String(doc.parent) === String(main._id))
      .sort(byOrder)
      .map((child) => presentNode(child, main.name)),
  }));
}

async function articleSubCategories(category) {
  const values = await Article.distinct("subCategory", { status: "published", category });
  return values.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

// Admin categories win; categories only used on articles still resolve so links never 404.
async function resolveCategory(slug, subSlug) {
  const docs = await Category.find().lean();
  const main = docs.find((doc) => !doc.parent && slugify(doc.name) === slug);

  let name = main?.name;
  if (!name) {
    const names = await Article.distinct("category", { status: "published" });
    name = names.find((value) => slugify(value) === slug);
  }
  if (!name) return null;

  const adminChildren = main
    ? docs
        .filter((doc) => doc.parent && String(doc.parent) === String(main._id))
        .sort(byOrder)
        .map((doc) => doc.name)
    : [];
  const extra = (await articleSubCategories(name)).filter(
    (value) => !adminChildren.some((child) => child.toLowerCase() === value.toLowerCase())
  );
  const children = [...adminChildren, ...extra].map((child) => ({
    name: child,
    slug: slugify(child),
    href: categoryHref(name, child),
  }));

  const sub = subSlug ? children.find((child) => child.slug === subSlug) || null : null;
  if (subSlug && !sub) return null;

  return {
    name,
    slug: slugify(name),
    description: main?.description || "",
    href: categoryHref(name),
    children,
    sub,
  };
}

module.exports = { categoryTree, resolveCategory };
