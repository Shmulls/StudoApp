const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  time: { type: String, required: true },
  signedUp: { type: Boolean, default: false },
});

TaskSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Task", TaskSchema);
