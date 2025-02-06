const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Listing = require("../models/Listing");

const router = express.Router();

// ✅ Create a new land listing (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, location, size, price } = req.body;
    const listing = await Listing.create({
      title,
      description,
      location,
      size,
      price,
      ownerId: req.user, // User ID from JWT
    });

    res.status(201).json({ msg: "Listing created", listing });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get all land listings (Public)
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.findAll();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get a single listing by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ msg: "Listing not found" });

    res.json(listing);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Update a listing (Protected - Owner Only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ msg: "Listing not found" });

    if (listing.ownerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    const { title, description, location, size, price } = req.body;
    await listing.update({ title, description, location, size, price });

    res.json({ msg: "Listing updated", listing });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a listing (Protected - Owner Only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ msg: "Listing not found" });

    if (listing.ownerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    await listing.destroy();
    res.json({ msg: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
