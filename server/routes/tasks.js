const express = require("express");
const Task = require("../models/Task");
const CompletedTask = require("../models/CompletedTask");
const Notification = require("../models/Notification");
const router = express.Router();
const mongoose = require("mongoose");
const io = require("../server");

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

    // Ensure the time is a valid Date
    const taskData = {
      ...req.body,
      time: new Date(req.body.time), // Convert to Date object
      createdBy: req.body.createdBy || req.body.userId || "unknown", // Better fallback handling
    };

    console.log("Task data before saving:", taskData); // Debug log

    const task = new Task(taskData);
    const newTask = await task.save();

    console.log("Task created successfully:", newTask);

    // Create notification for all users (you can customize this logic)
    const notification = new Notification({
      userId: "all", // or specific user IDs
      title: "New Task Available!",
      message: `${task.title} - ${task.description.substring(0, 100)}...`,
      type: "new_task",
      taskId: task._id,
      createdAt: new Date(),
    });

    await notification.save();

    // Emit real-time notification via Socket.IO
    req.app.get("io").emit("new-notification", notification);

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res
      .status(400)
      .json({ message: "Error creating task", error: error.message });
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

  const { userId, feedback } = req.body;
  const { id } = req.params;

  try {
    // Ensure that the taskId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid task ID:", id);
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);
    console.log("📋 Found task:", task);

    if (!task) {
      console.log("❌ Task not found with ID:", id);
      return res.status(404).json({ message: "Task not found" });
    }

    // 🎯 MARK THE ORIGINAL TASK AS COMPLETED 🎯
    task.completed = true;
    task.completedAt = new Date();
    task.completedBy = userId;
    await task.save();
    console.log("✅ Original task marked as completed");

    // Create the completed task entry (for detailed tracking)
    console.log("💾 Creating completed task entry...");
    const completedTask = new CompletedTask({
      userId,
      taskId: task._id,
      title: task.title,
      description: task.description,
      location: task.location,
      time: task.time,
      signedUp: task.signedUp,
      feedback: feedback || null,
      completedAt: new Date(),
    });

    await completedTask.save();
    console.log("✅ Completed task saved:", completedTask._id);

    // 🎯 CREATE NOTIFICATION FOR TASK COMPLETION 🎯
    console.log("🔍 Checking notification conditions:");
    console.log("- task.createdBy:", task.createdBy);
    console.log("- userId:", userId);
    console.log("- createdBy !== userId:", task.createdBy !== userId);
    console.log("- createdBy !== 'unknown':", task.createdBy !== "unknown");

    if (
      task.createdBy &&
      task.createdBy !== userId &&
      task.createdBy !== "unknown"
    ) {
      console.log("🔔 Creating notification...");

      const notification = new Notification({
        title: `Task "${task.title}" Completed`,
        message: `A user has completed the task "${task.title}"${
          feedback ? ` with feedback: ${feedback}` : "."
        }`,
        type: "task_completed",
        userId: task.createdBy,
        taskId: task._id,
        completedBy: {
          id: userId,
          name: `User ${userId}`,
          image: null,
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
    } else {
      console.log("❌ No notification created - conditions not met");
      console.log("   createdBy:", task.createdBy);
      console.log("   userId:", userId);
    }

    res.status(200).json({
      message: "Task marked as completed",
      completedTask,
      originalTask: task, // Include the updated original task
      notificationSent:
        task.createdBy &&
        task.createdBy !== userId &&
        task.createdBy !== "unknown",
    });
  } catch (error) {
    console.error("💥 Error completing task:", error);
    res
      .status(500)
      .json({ message: "Error completing task", error: error.message });
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
