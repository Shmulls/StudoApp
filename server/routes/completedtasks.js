const express = require("express");
const CompletedTask = require("../models/CompletedTask");
const router = express.Router();

router.post("/completed-tasks", async (req, res) => {
  try {
    console.log("CompletedTask POST body:", req.body); // Add this line
    const completedTask = new CompletedTask(req.body);
    await completedTask.save();
    res.status(201).json(completedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/completed-tasks", async (req, res) => {
  try {
    const completedTasks = await CompletedTask.find().sort({ completedAt: -1 });
    res.json(completedTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
