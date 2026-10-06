const { categoryHref } = require("./slug");

function blocksOf(article) {
  return Array.isArray(article.blocks) ? article.blocks : [];
}

function textFromBlocks(blocks) {
  return blocks
    .map((block) => {
      const data = block?.data || {};
      if (["paragraph", "heading", "quote", "callout"].includes(block?.type)) {
        return [data.title, data.text, data.citation].filter(Boolean).join(" ");
      }
      if (block?.type === "list") {
        return Array.isArray(data.items) ? data.items.join(" ") : "";
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function readTime(article) {
  const source = `${article.excerpt || ""} ${textFromBlocks(blocksOf(article))}`.trim();
  const words = source ? source.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function kindOf(article) {
  const hint = `${article.kicker || ""} ${article.category || ""}`.toLowerCase();
  if (hint.includes("opinion")) return "Opinion";
  if (hint.includes("analysis") || hint.includes("guide")) return "Analysis";
  return "News";
}

function coverOf(article) {
  if (article.coverImage) return article.coverImage;
  const image = blocksOf(article).find((block) => block.type === "image" && block.data?.url);
  return image?.data?.url || "";
}

function captionOf(article) {
  const image = blocksOf(article).find((block) => block.type === "image" && block.data?.caption);
  return image?.data?.caption || "";
}

function quoteOf(article) {
  const quote = blocksOf(article).find((block) => block.type === "quote" && block.data?.text);
  if (!quote) return null;
  return {
    text: quote.data.text,
    credit: quote.data.citation || "",
  };
}

function paragraphsOf(article) {
  return blocksOf(article)
    .filter((block) => block.type === "paragraph" && block.data?.text)
    .map((block) => block.data.text);
}

function whenOf(article) {
  const value = article.publishedAt || article.updatedAt;
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatClock(date) {
  if (!date) return "";
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${clock} IST`;
}

function relativeTime(date) {
  if (!date) return "";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function plain(doc) {
  return doc?.toObject ? doc.toObject({ versionKey: false }) : doc;
}

function presentCard(doc) {
  const article = plain(doc);
  const when = whenOf(article);
  const kind = kindOf(article);
  const category = article.category || "Economy";
  const subCategory = article.subCategory || "";

  return {
    id: String(article._id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || "",
    category,
    subCategory,
    categoryHref: categoryHref(category),
    subCategoryHref: subCategory ? categoryHref(category, subCategory) : "",
    kicker: article.kicker || "",
    tags: article.tags || [],
    coverImage: coverOf(article),
    featured: Boolean(article.featured),
    author: article.author || "Editorial Desk",
    kind,
    readTime: readTime(article),
    publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : null,
    timeAgo: relativeTime(when),
    clock: formatClock(when),
    href: `/article/${article.slug}`,
  };
}

function presentArticle(doc) {
  const article = plain(doc);
  const card = presentCard(article);
  const when = whenOf(article);

  return {
    ...card,
    section: card.category,
    sectionHref: card.categoryHref,
    subsection: card.subCategory || article.kicker || card.category,
    subsectionHref: card.subCategoryHref,
    tagLeft: card.category,
    tagRight: article.kicker || (article.featured ? "Featured" : article.tags?.[0] || "Story"),
    dek: article.excerpt || "",
    image: card.coverImage,
    caption: captionOf(article),
    role: article.kicker || "Editorial Desk",
    avatar: "",
    date: formatDate(when),
    time: formatClock(when),
    paragraphs: paragraphsOf(article),
    quote: quoteOf(article),
    whyItMatters: [],
    blocks: blocksOf(article),
  };
}

function presentHero(card) {
  return {
    slug: card.slug,
    tagLeft: card.category,
    tagRight: card.kicker || (card.featured ? "Featured" : card.tags[0] || "Story"),
    type: card.kind,
    readTime: card.readTime,
    cta: card.kind === "Analysis" ? "Read Analysis" : "Read Full Story",
    title: card.title,
    dek: card.excerpt,
    image: card.coverImage,
  };
}

function presentTopStory(card) {
  return {
    category: card.category,
    categoryHref: card.categoryHref,
    title: card.title,
    summary: card.excerpt,
    time: card.timeAgo,
    image: card.coverImage,
    href: card.href,
  };
}

function presentLatest(card) {
  return {
    tag: card.category,
    time: card.timeAgo,
    title: card.title,
    summary: card.excerpt,
    image: card.coverImage,
    href: card.href,
  };
}

function presentUpdate(card) {
  return {
    time: card.clock,
    title: card.title,
    href: card.href,
  };
}

function presentRelated(card) {
  return {
    title: card.title,
    time: card.timeAgo,
    image: card.coverImage,
    href: card.href,
    tag: card.subCategory || card.category,
  };
}

module.exports = {
  presentArticle,
  presentCard,
  presentHero,
  presentLatest,
  presentRelated,
  presentTopStory,
  presentUpdate,
};
