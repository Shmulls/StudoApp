const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "task_completed",
      "task_assigned",
      "task_reminder",
      "general",
      "new_task",
    ],
    default: "general",
  },
  userId: { type: String, required: true },
  taskId: { type: String },
  organizationInfo: {
    name: { type: String },
    image: { type: String },
  },
  taskInfo: {
    title: { type: String },
    location: { type: String },
    time: { type: Date },
  },
  completedBy: {
    id: { type: String },
    name: { type: String },
    image: { type: String },
  },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
