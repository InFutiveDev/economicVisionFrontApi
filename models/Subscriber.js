const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "" },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);
