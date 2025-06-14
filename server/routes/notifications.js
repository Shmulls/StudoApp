const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

// Get notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching notifications for user:", userId);

    // Get notifications for this specific user OR broadcast notifications (userId: "all")
    const notifications = await Notification.find({
      $or: [{ userId: userId }, { userId: "all" }],
    }).sort({ createdAt: -1 });

    console.log(
      `Found ${notifications.length} notifications for user ${userId}`
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.patch("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { status } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create notification (for testing)
router.post("/", async (req, res) => {
  try {
    console.log("Creating notification:", req.body);
    const notification = new Notification(req.body);
    await notification.save();

    // Emit real-time notification
    const io = req.app.get("io");
    if (io) {
      io.emit("new-notification", notification);
      console.log("Notification emitted via socket");
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
