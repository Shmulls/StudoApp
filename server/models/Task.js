const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  time: { type: String, required: true },
  signedUp: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", TaskSchema);
