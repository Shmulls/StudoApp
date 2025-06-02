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
  signedUp: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  assignedUserId: { type: String, default: null },
  assignedUserName: { type: String, default: null },
  assignedUserImage: { type: String, default: null },
  createdBy: { type: String, required: true },
  feedback: { type: String },
  completedAt: { type: Date },
  completedBy: { type: String },
});

module.exports = mongoose.model("Task", TaskSchema);
