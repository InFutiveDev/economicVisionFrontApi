const Article = require("../models/Article");
const {
  presentCard,
  presentHero,
  presentLatest,
  presentTopStory,
  presentUpdate,
} = require("../utils/present");

async function getHome(req, res) {
  try {
    const articles = await Article.findPublished(
      {},
      {
        sort: { featured: -1, publishedAt: -1, updatedAt: -1 },
        limit: 12,
      }
    );

    const cards = articles.map(presentCard);
    const featured = cards.filter((card) => card.featured);
    const heroCards = (featured.length ? featured : cards).slice(0, 5);
    const latest = cards[0] || null;

    res.json({
      hero: heroCards.map(presentHero),
      topStories: cards.slice(0, 8).map(presentTopStory),
      latest: {
        featured: latest ? presentLatest(latest) : null,
        updates: cards.slice(1, 6).map(presentUpdate),
      },
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
