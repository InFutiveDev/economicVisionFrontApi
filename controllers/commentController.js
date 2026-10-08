const Comment = require("../models/Comment");

function presentComment(doc) {
  return {
    id: doc._id.toString(),
    articleSlug: doc.articleSlug,
    name: doc.name,
    text: doc.text,
    createdAt: doc.createdAt,
    date: new Date(doc.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

async function getCommentsBySlug(req, res) {
  try {
    const { slug } = req.params;
    const docs = await Comment.find({ articleSlug: slug, status: "approved" }).sort({ createdAt: -1 });
    res.json({
      comments: docs.map(presentComment),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
}

async function createComment(req, res) {
  try {
    const { slug } = req.params;
    const { name, text } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const comment = await Comment.create({
      articleSlug: slug,
      name: String(name).trim(),
      text: String(text).trim(),
      status: "approved",
    });

    res.status(201).json({
      comment: presentComment(comment),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
}

module.exports = {
  getCommentsBySlug,
  createComment,
};
