// models/CompletedTask.js
const mongoose = require("mongoose");

const CompletedTaskSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Reference to the user (Clerk user ID)
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true }, // Reference to the task
  completedAt: { type: Date, default: Date.now }, // Timestamp of when the task was completed
  title: { type: String, required: true }, // Task title
  description: { type: String, required: true }, // Task description
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  time: { type: String, required: true }, // Task time
  signedUp: { type: Boolean, default: false }, // Whether the user is signed up for the task
});

// תמיכה בחיפושים גיאוגרפיים בעתיד
CompletedTaskSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("CompletedTask", CompletedTaskSchema);
