const Article = require("../models/Article");
const HomeSection = require("../models/HomeSection");
const { mediaByType } = require("../utils/media");
const {
  presentCard,
  presentHero,
  presentLatest,
  presentTopStory,
  presentUpdate,
} = require("../utils/present");

async function curatedSections() {
  const docs = await HomeSection.find().populate("items.article");
  return Object.fromEntries(
    docs.map((doc) => [
      doc.key,
      (doc.items || [])
        .filter((item) => item.article && item.article.status === "published")
        .map((item) => ({
          card: presentCard(item.article),
          label: item.label || "",
          note: item.note || "",
        })),
    ])
  );
}

async function getHome(req, res) {
  try {
    const [articles, curated, media] = await Promise.all([
      Article.findPublished(
        {},
        { sort: { featured: -1, publishedAt: -1, updatedAt: -1 }, limit: 12 }
      ),
      curatedSections(),
      mediaByType(),
    ]);

    const cards = articles.map((doc) => presentCard(doc));
    const featured = cards.filter((card) => card.featured);
    const pick = (key) => (curated[key] || []).map((entry) => entry.card);

    const heroEntries = curated.hero || [];
    const hero = heroEntries.length
      ? heroEntries.map(({ card, label }) => ({
          ...presentHero(card),
          tagRight: label || presentHero(card).tagRight,
        }))
      : (featured.length ? featured : cards).slice(0, 5).map(presentHero);

    const topStories = pick("top-stories").length ? pick("top-stories") : cards.slice(0, 8);
    const latestCards = pick("latest-news").length ? pick("latest-news") : cards.slice(0, 6);

    res.json({
      hero,
      topStories: topStories.map(presentTopStory),
      latest: {
        featured: latestCards[0] ? presentLatest(latestCards[0]) : null,
        updates: latestCards.slice(1, 6).map(presentUpdate),
      },
      exclusive: (curated.exclusive || []).map(({ card, label }) => ({
        type: label || "EXCLUSIVE",
        title: card.title,
        summary: card.excerpt,
        readTime: card.readTime.toUpperCase(),
        image: card.coverImage,
        href: card.href,
      })),
      whyItMatters: (curated["why-it-matters"] || []).map(({ card, label, note }) => ({
        key: label || card.category,
        hi: note || card.title,
        text: card.excerpt,
        href: card.href,
      })),
      opinion: (curated.opinion || []).map(({ card, label }) => ({
        author: card.author,
        role: label,
        title: card.title,
        summary: card.excerpt,
        meta: `${card.readTime}  ·  ${card.timeAgo}`,
        image: card.coverImage,
        href: card.href,
      })),
      ...media,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch homepage",
      error: error.message,
    });
  }
}

module.exports = {
  getHome,
};
