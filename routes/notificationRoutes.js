const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

const router = express.Router();

// ✅ Get all notifications for a user (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user },
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Mark a notification as read (Protected)
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ msg: "Notification not found" });

    if (notification.userId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    notification.status = "read";
    await notification.save();

    res.json({ msg: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a notification (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ msg: "Notification not found" });

    if (notification.userId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    await notification.destroy();
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
