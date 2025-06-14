const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be "all" for broadcast or specific user ID
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "new_task",
      "task_assigned",
      "task_completed",
      "task_reminder",
      "general",
    ], // Add new_task here
    default: "general",
  },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  createdAt: { type: Date, default: Date.now },
  // Add these fields for task completion notifications
  completedBy: {
    id: { type: String },
    name: { type: String },
    image: { type: String },
  },
  read: { type: Boolean, default: false }, // For backward compatibility
});

module.exports = mongoose.model("Notification", NotificationSchema);
