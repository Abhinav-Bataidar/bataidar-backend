const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

// ✅ Send a Message (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Ensure receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ msg: "Receiver not found" });

    const message = await Message.create({
      senderId: req.user,
      receiverId,
      content,
      status: "sent",
    });

    res.status(201).json({ msg: "Message sent", message });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get Messages for the Authenticated User (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        receiverId: req.user,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get Sent Messages (Protected)
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        senderId: req.user,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Update Message Status to Read (Protected - Receiver Only)
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    if (message.receiverId !== req.user) return res.status(403).json({ msg: "Unauthorized" });

    message.status = "read";
    await message.save();

    res.json({ msg: "Message marked as read", message });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Delete a Message (Protected - Sender or Receiver Only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    if (message.senderId !== req.user && message.receiverId !== req.user)
      return res.status(403).json({ msg: "Unauthorized" });

    await message.destroy();
    res.json({ msg: "Message deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
