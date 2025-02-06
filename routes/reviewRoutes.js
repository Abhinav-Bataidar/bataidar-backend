const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Contract = require("../models/Contract");

const router = express.Router();

// ✅ Submit a Review (Protected - Only after contract completion)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reviewedUserId, contractId, rating, comment } = req.body;

    // Check if contract exists and is completed
    const contract = await Contract.findByPk(contractId);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });
    if (contract.status !== "completed") return res.status(400).json({ msg: "Contract must be completed before reviewing" });

    // Ensure the reviewer was part of the contract
    if (contract.ownerId !== req.user && contract.farmerId !== req.user)
      return res.status(403).json({ msg: "Unauthorized to review" });

    const review = await Review.create({
      reviewerId: req.user,
      reviewedUserId,
      contractId,
      rating,
      comment,
    });

    res.status(201).json({ msg: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get all reviews for a user (Public)
router.get("/:userId", async (req, res) => {
  try {
    const reviews = await Review.findAll({ where: { reviewedUserId: req.params.userId } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get review details by ID (Public)
router.get("/details/:id", async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a Review (Protected - Only Reviewer)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    if (review.reviewerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    await review.destroy();
    res.json({ msg: "Review deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
