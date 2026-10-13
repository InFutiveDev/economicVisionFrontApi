const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoose = require("mongoose");

const healthRoutes = require("./routes/health");
const articleRoutes = require("./routes/articles");
const homeRoutes = require("./routes/home");
const categoryRoutes = require("./routes/categories");
const mediaRoutes = require("./routes/media");
const subscribeRoutes = require("./routes/subscribe");
const epaperRoutes = require("./routes/epaper");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", healthRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/epapers", epaperRoutes);
app.use("/api/epaper", epaperRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Handle body-parser errors (malformed / malicious JSON from external probes).
// These are 400-level client errors — do NOT log as server errors.
app.use((err, req, res, next) => {
  if (err.status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid request body" });
  }
  // Only log unexpected server-side (5xx) errors
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

async function start() {
  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is required and must match the admin API database.");
  }

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB ready");

  app.listen(PORT, () => {
    console.log(`Economic Vision API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
