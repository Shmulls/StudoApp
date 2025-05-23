const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: Object,
  time: mongoose.Schema.Types.Mixed,
  signedUp: Boolean,
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", taskSchema, "tasks");
