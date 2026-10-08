const express = require("express");
const { z } = require("zod");
const Subscriber = require("../models/Subscriber");
const { sendSubscriberNotice } = require("../utils/mailer");

const router = express.Router();

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  source: z.string().trim().max(40).optional(),
  website: z.string().optional(),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const attempts = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  const { email, source, website } = parsed.data;

  if (website) {
    return res.status(201).json({ message: "Thanks for subscribing!" });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({ message: "Too many attempts. Please try again later." });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ message: "You're already subscribed." });
    }

    const subscriber = await Subscriber.create({ email, source: source || "" });

    try {
      const result = await sendSubscriberNotice({ email, source });
      if (result.sent) {
        subscriber.notifiedAt = new Date();
        await subscriber.save();
      } else {
        console.warn(`Subscriber ${email} saved, admin email skipped: ${result.reason}`);
      }
    } catch (error) {
      console.error(`Subscriber ${email} saved, admin email failed:`, error.message);
    }

    res.status(201).json({ message: "Thanks for subscribing!" });
  } catch (error) {
    if (error?.code === 11000) {
      return res.json({ message: "You're already subscribed." });
    }
    res.status(500).json({ message: "Could not subscribe right now. Please try again." });
  }
});

module.exports = router;
