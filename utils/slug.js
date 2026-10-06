function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Category pages are addressed by name, so /category/money/tax and /category/business/tax stay distinct.
function categoryHref(category, subCategory) {
  if (!category) return "";
  const base = `/category/${slugify(category)}`;
  return subCategory ? `${base}/${slugify(subCategory)}` : base;
}

function tagHref(tag) {
  return tag ? `/tag/${encodeURIComponent(String(tag).trim())}` : "";
}

module.exports = { slugify, categoryHref, tagHref };
