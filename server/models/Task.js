const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  locationLabel: { type: String },
  time: { type: Date, required: true },
  signedUpUsers: [
    {
      userId: { type: String, required: true },
      userName: { type: String },
      userImage: { type: String },
      signedUpAt: { type: Date, default: Date.now },
    },
  ],
  maxSignups: { type: Number, default: 10 },
  completed: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  pointsReward: { type: Number, default: 1 },
  estimatedHours: { type: Number, default: 1 },
  feedback: { type: String },
  completedAt: { type: Date },
  completedBy: { type: String },
});

module.exports = mongoose.model("Task", TaskSchema);
