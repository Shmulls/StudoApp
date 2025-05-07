const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: Object,
  time: mongoose.Schema.Types.Mixed,
  signedUp: Boolean,
});

module.exports = mongoose.model("Task", taskSchema, "tasks");
//                                          ^^^^^^^^^^^^^^^^ forces collection name
