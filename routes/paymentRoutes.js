const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");
const Contract = require("../models/Contract");

const router = express.Router();

// ✅ Make a Payment (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { contractId, payeeId, amount, paymentMethod } = req.body;

    // Ensure the contract exists
    const contract = await Contract.findByPk(contractId);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    // Ensure the payer is part of the contract
    if (contract.farmerId !== req.user)
      return res.status(403).json({ msg: "Unauthorized to make payment" });

    const payment = await Payment.create({
      contractId,
      payerId: req.user,
      payeeId,
      amount,
      status: "pending",
      paymentMethod,
    });

    res.status(201).json({ msg: "Payment initiated", payment });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get all payments for a user (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { payerId: req.user },
      order: [["createdAt", "DESC"]],
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get payment details by ID (Protected)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    if (payment.payerId !== req.user && payment.payeeId !== req.user)
      return res.status(403).json({ msg: "Unauthorized" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Update payment status (Protected - Admin or Payee Only)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    if (payment.payeeId !== req.user)
      return res.status(403).json({ msg: "Unauthorized" });

    const { status } = req.body;
    payment.status = status;
    await payment.save();

    res.json({ msg: "Payment status updated", payment });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a Payment Record (Protected - Only Payer)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    if (payment.payerId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    await payment.destroy();
    res.json({ msg: "Payment record deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
