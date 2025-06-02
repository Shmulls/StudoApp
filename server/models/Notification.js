const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["task_completed", "task_assigned", "task_reminder", "general"],
    default: "general",
  },
  userId: { type: String, required: true }, // Who receives the notification
  taskId: { type: String }, // Reference to the task
  completedBy: {
    id: { type: String },
    name: { type: String },
    image: { type: String },
  },
  read: { type: Boolean, default: false }, // Changed from status to read boolean
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
