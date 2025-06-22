const mongoose = require("mongoose");

const CompletedTaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  completedAt: { type: Date, default: Date.now },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  time: { type: String, required: true },
  signedUp: { type: Boolean, default: false },
  feedback: { type: String }, // Add feedback field
  // Add new fields
  pointsReward: { type: Number, default: 1 },
  estimatedHours: { type: Number, default: 1 },
});

module.exports = mongoose.model("CompletedTask", CompletedTaskSchema);
