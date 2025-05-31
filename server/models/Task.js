const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: Object,
  locationLabel: String,
  time: mongoose.Schema.Types.Mixed,
  signedUp: Boolean,
  completed: { type: Boolean, default: false },
  assignedUserId: { type: String, default: null }, // Add this
  assignedUserName: { type: String, default: null }, // Add this
  assignedUserImage: { type: String, default: null }, // Add this
});

module.exports = mongoose.model("Task", taskSchema, "tasks");
