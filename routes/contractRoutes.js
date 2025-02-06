const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Contract = require("../models/Contract");
const Listing = require("../models/Listing");

const router = express.Router();

// ✅ Create a contract (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { listingId, farmerId, startDate, endDate } = req.body;

    // Find the listing
    const listing = await Listing.findByPk(listingId);
    if (!listing) return res.status(404).json({ msg: "Listing not found" });

    // Ensure the owner is correct
    if (listing.ownerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    const contract = await Contract.create({
      listingId,
      farmerId,
      ownerId: req.user,
      startDate,
      endDate,
      status: "pending",
    });

    res.status(201).json({ msg: "Contract created", contract });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get all contracts for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const contracts = await Contract.findAll({ where: { ownerId: req.user } });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get a single contract by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    // Ensure the user is the owner or farmer
    if (contract.ownerId !== req.user && contract.farmerId !== req.user)
      return res.status(403).json({ msg: "Unauthorized" });

    res.json(contract);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Update contract status (Protected - Owner Only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    if (contract.ownerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    const { status } = req.body;
    contract.status = status;
    await contract.save();

    res.json({ msg: "Contract updated", contract });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a contract (Protected - Owner Only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    if (contract.ownerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    await contract.destroy();
    res.json({ msg: "Contract deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
