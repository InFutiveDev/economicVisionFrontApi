const Media = require("../models/Media");
const { categoryHref } = require("./slug");

const MEDIA_TYPES = ["video", "podcast", "story"];

function youTubeId(input) {
  const value = String(input || "").trim();
  if (!value) return null;
  const match = value.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function presentMedia(item) {
  const ytId = youTubeId(item.url);
  return {
    id: String(item._id),
    type: item.type,
    title: item.title,
    summary: item.summary || "",
    image: item.image || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ""),
    url: item.url || "",
    duration: item.duration || "",
    category: item.category || "",
    subCategory: item.subCategory || "",
    categoryHref: item.category ? categoryHref(item.category, item.subCategory) : "",
    youtubeId: ytId,
    embedUrl: ytId ? `https://www.youtube-nocookie.com/embed/${ytId}` : null,
  };
}

async function findMedia({ type, limit } = {}) {
  const filter = { published: { $ne: false } };
  if (MEDIA_TYPES.includes(type)) filter.type = type;
  const query = Media.find(filter).sort({ order: 1, createdAt: -1 });
  if (limit) query.limit(limit);
  return (await query).map(presentMedia);
}

async function mediaByType() {
  const items = await findMedia();
  return {
    videos: items.filter((item) => item.type === "video"),
    podcasts: items.filter((item) => item.type === "podcast"),
    stories: items.filter((item) => item.type === "story"),
  };
}

module.exports = { MEDIA_TYPES, findMedia, mediaByType, presentMedia, youTubeId };
