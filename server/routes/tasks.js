const express = require("express");
const Task = require("../models/Task");
const CompletedTask = require("../models/CompletedTask");
const Notification = require("../models/Notification");
const router = express.Router();
const mongoose = require("mongoose");

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
    console.log("Task creation request body:", req.body); // Debug log

    // Ensure the time is a valid Date and include new fields
    const taskData = {
      ...req.body,
      time: new Date(req.body.time), // Convert to Date object
      createdBy: req.body.createdBy || req.body.userId || "unknown", // Better fallback handling
      pointsReward: req.body.pointsReward || 1, // Default to 1 if not provided
      estimatedHours: req.body.estimatedHours || 1, // Default to 1 if not provided
    };

    console.log("Task data before saving:", taskData); // Debug log

    const task = new Task(taskData);
    const newTask = await task.save();

    console.log("Task created successfully:", newTask);

    // Create notification with points information
    const notification = new Notification({
      userId: "all", // or specific user IDs
      title: "New Task Available!",
      message: `${task.title} - ${task.description.substring(0, 100)}${
        task.description.length > 100 ? "..." : ""
      } (${task.pointsReward} ${
        task.pointsReward === 1 ? "point" : "points"
      }, ${task.estimatedHours}h)`,
      type: "new_task",
      taskId: task._id,
      status: "unread",
      createdAt: new Date(),
    });

    await notification.save();

    // Emit real-time notification via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new-notification", notification);
      console.log("Notification emitted via Socket.IO");
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({
      message: "Error creating task",
      error: error.message,
    });
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
  console.log("🔥 PATCH /complete route hit!");
  console.log("Task ID:", req.params.id);
  console.log("Request body:", req.body);

  const { userId, feedback, pointsReward, userName, userImage } = req.body;
  const { id } = req.params;

  try {
    // Find the task first
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("📋 Found task:", task);

    // Mark the original task as completed
    task.completed = true;
    await task.save();
    console.log("✅ Original task marked as completed");

    // Create a completed task entry
    console.log("💾 Creating completed task entry...");
    const completedTask = new CompletedTask({
      userId: userId,
      taskId: task._id,
      title: task.title,
      description: task.description,
      location: task.location,
      time: task.time,
      signedUp: task.signedUp,
      feedback: feedback || "",
      completedAt: new Date(),
    });

    const savedCompletedTask = await completedTask.save();
    console.log("✅ Completed task saved:", savedCompletedTask._id);

    // Create notification for organization owner (if task was created by someone else)
    if (task.createdBy && task.createdBy !== userId) {
      console.log("🔔 Creating completion notification...");

      // Create a simpler message format that includes feedback and points
      let message = `Feedback: ${
        feedback || "No feedback provided"
      } | Points earned: ${pointsReward || task.pointsReward || 1}`;

      const notification = new Notification({
        userId: task.createdBy, // Organization owner who created the task
        title: `Task Completed: ${task.title}`,
        message: message,
        type: "task_completed",
        taskId: task._id,
        status: "unread",
        completedBy: {
          id: userId,
          name: userName || "Unknown User",
          image: userImage || null,
        },
        read: false,
      });

      await notification.save();
      console.log("🔔 Task completion notification created:", notification);

      // Send real-time notification
      const io = req.app.get("io");
      if (io) {
        io.to(`org_${task.createdBy}`).emit("new-notification", notification);
        console.log(
          `📡 Emitted completion notification to org_${task.createdBy}`
        );
      }
    }

    res.json({
      success: true,
      message: "Task completed successfully",
      task: task,
      completedTask: savedCompletedTask,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: error.message });
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

// Get all completed tasks
router.get("/completed", async (req, res) => {
  try {
    const completedTasks = await Task.find({ completed: true });
    res.json(completedTasks);
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({ message: "Error fetching completed tasks" });
  }
});

module.exports = router;
