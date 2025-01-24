const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

// Create a new notification
router.post("/", async (req, res) => {
  const { userId, title, message } = req.body;
  try {
    const notification = new Notification({ userId, title, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification" });
  }
});

// Get all notifications for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ message: "Error retrieving notifications" });
  }
});

// Update notification status (e.g., mark as read)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

module.exports = router;
