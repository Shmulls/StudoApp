const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  time: { type: Date, required: true }, // Change to Date type
  signedUp: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", TaskSchema);
