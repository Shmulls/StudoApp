const express = require("express");
const Task = require("../models/Task");
const CompletedTask = require("../models/CompletedTask");
const router = express.Router();
const mongoose = require("mongoose");
const io = require("../server");
const Notification = require("../models/Notification");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    // Ensure the time is a valid Date
    const taskData = {
      ...req.body,
      time: new Date(req.body.time), // Convert to Date object
    };

    const task = new Task(taskData);
    const newTask = await task.save();

    console.log("Task created successfully:", newTask);

    // Create a new notification
    const notification = new Notification({
      userId: "broadcast", // Use "broadcast" for system-wide notifications
      title: "New Task Added",
      message: `A new task titled "${newTask.title}" has been added.`,
      createdAt: new Date(),
    });

    // Save the notification to the database
    const savedNotification = await notification.save();

    // Debug log for notification creation
    console.log("Notification created successfully:", savedNotification);

    // Emit the notification using Socket.io
    const io = req.app.get("io"); // Retrieve io instance from app
    if (!io) {
      console.error("Socket.io instance not found!");
      return res.status(500).json({ message: "Socket.io not initialized" });
    }

    io.emit("new-notification", {
      _id: savedNotification._id,
      title: savedNotification.title,
      message: savedNotification.message,
      createdAt: savedNotification.createdAt,
    });

    console.log("Emitted: New notification ->", {
      title: savedNotification.title,
      message: savedNotification.message,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({ message: "Error creating task" });
  }
});

// Update a task
router.patch("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH request to mark the task as completed
router.patch("/:id/complete", async (req, res) => {
  const { userId } = req.body; // Get userId from the request body
  const { id } = req.params; // Get taskId from URL parameter

  try {
    // Ensure that the taskId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create the completed task entry in the CompletedTasks collection
    const completedTask = new CompletedTask({
      userId,
      taskId: task._id,
      title: task.title,
      description: task.description,
      location: task.location,
      time: task.time,
      signedUp: task.signedUp,
    });

    await completedTask.save();
    res
      .status(200)
      .json({ message: "Task marked as completed", completedTask });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Error completing task" });
  }
});

// Get the last 20 completed tasks for a user
router.get("/completed/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const completedTasks = await CompletedTask.find({ userId })
      .sort({ completedAt: -1 }) // Sort by the most recent completion time
      .limit(20); // Get the last 20 tasks

    res.json(completedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving completed tasks" });
  }
});

module.exports = router;
