const mongoose = require("mongoose");
const Epaper = require("../models/Epaper");

function serializeEpaper(doc) {
  if (!doc) return null;
  const item = doc.toObject ? doc.toObject({ versionKey: false }) : doc;

  const rawTitle = item.title || item.name || "संवाद फर्स्ट";
  const rawName = item.name || item.title || "संवाद फर्स्ट";
  const mainParagraph =
    item.paragraph ||
    item.excerpt ||
    item.description ||
    (item.paragraphs && item.paragraphs[0]) ||
    "";
  const paragraphsList =
    Array.isArray(item.paragraphs) && item.paragraphs.length
      ? item.paragraphs
      : mainParagraph
      ? [mainParagraph]
      : [];

  return {
    id: String(item._id || item.id),
    title: rawTitle,
    name: rawName,
    city: item.city || "",
    date: item.date || "",
    dateShort: item.dateShort || "",
    slug: item.slug || "",
    paragraph: mainParagraph,
    excerpt: item.excerpt || mainParagraph,
    description: item.description || mainParagraph,
    paragraphs: paragraphsList,
    cover:
      item.cover ||
      (item.pages && item.pages[0] ? item.pages[0].image : "") ||
      "",
    pages: (item.pages || []).map((page, idx) => ({
      id: String(page.id || page._id || `page-${idx + 1}`),
      pageNumber: page.pageNumber || idx + 1,
      title: page.title || `Page ${idx + 1}`,
      image: page.image || "",
      description: page.description || page.paragraph || "",
      paragraph: page.paragraph || page.description || "",
      customDesign: page.customDesign || null,
    })),
    today: Boolean(item.today),
    status: item.status || "published",
    pdfUrl: item.pdfUrl || "",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: item.updatedAt
      ? new Date(item.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

async function listEpapers(req, res) {
  try {
    const filter = { status: "published" };

    if (req.query.city) {
      filter.city = new RegExp(`^${req.query.city.trim()}$`, "i");
    }
    if (req.query.today !== undefined) {
      filter.today = req.query.today === "true";
    }
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { name: new RegExp(q, "i") },
        { title: new RegExp(q, "i") },
        { city: new RegExp(q, "i") },
        { slug: new RegExp(q, "i") },
        { date: new RegExp(q, "i") },
        { paragraph: new RegExp(q, "i") },
      ];
    }

    const items = await Epaper.find(filter).sort({ today: -1, createdAt: -1 });
    res.json({ epapers: items.map(serializeEpaper) });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch e-papers",
      error: error.message,
    });
  }
}

async function getEpaper(req, res) {
  try {
    const { id } = req.params;
    let item = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await Epaper.findOne({ _id: id, status: "published" });
    }
    if (!item) {
      item = await Epaper.findOne({ slug: id, status: "published" });
    }

    if (!item) {
      return res.status(404).json({ message: "E-Paper edition not found." });
    }

    res.json({ epaper: serializeEpaper(item) });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch e-paper",
      error: error.message,
    });
  }
}

module.exports = {
  serializeEpaper,
  listEpapers,
  getEpaper,
};
