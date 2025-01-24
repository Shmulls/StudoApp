const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Reference to the user (Clerk user ID)
  title: { type: String, required: true }, // Notification title
  message: { type: String, required: true }, // Notification message content
  status: { type: String, enum: ["unread", "read"], default: "unread" }, // Read status
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the notification was created
});

module.exports = mongoose.model("Notification", NotificationSchema);
