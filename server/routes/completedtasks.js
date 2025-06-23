const express = require("express");
const router = express.Router();
const CompletedTask = require("../models/CompletedTask");
const Task = require("../models/Task"); // ✅ Add this import
const Notification = require("../models/Notification");

router.post("/completed-tasks", async (req, res) => {
  try {
    console.log("CompletedTask POST body:", req.body);

    const {
      userId,
      taskId,
      title,
      description,
      location,
      time,
      signedUp,
      feedback,
      userName,
      userImage,
      pointsReward,
      estimatedHours,
      completedAt,
    } = req.body;

    // 1. Create the completed task record
    const completedTask = new CompletedTask({
      userId,
      taskId,
      title,
      description,
      location,
      time,
      signedUp: signedUp || false,
      feedback: feedback || "",
      completedAt: completedAt || new Date(),
      pointsReward: pointsReward || 1,
      estimatedHours: estimatedHours || 1,
    });

    await completedTask.save();
    console.log("✅ CompletedTask created successfully");

    // 2. ✅ UPDATE THE ORIGINAL TASK TO MARK AS COMPLETED
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        completed: true,
        completedAt: new Date(),
        completedBy: userId,
      },
      { new: true } // Return the updated document
    );

    console.log(
      "✅ Original task updated to completed:",
      updatedTask ? "SUCCESS" : "FAILED"
    );

    // 3. Create notification (your existing code)
    const task = await Task.findById(taskId);
    if (task && task.createdBy !== userId) {
      const notification = new Notification({
        title: `Task "${title}" Completed`,
        message: `A user has completed the task "${title}" with feedback: ${feedback}`,
        type: "task_completed",
        userId: task.createdBy,
        taskId: taskId,
        completedBy: {
          id: userId,
          name: userName,
          image: userImage,
        },
        status: "unread",
      });

      await notification.save();
      console.log("Task completion notification created:", notification);

      // ✅ Safe socket emission
      if (req.io) {
        req.io.emit(`notification_${task.createdBy}`, {
          title: `Task "${title}" Completed`,
          message: `${userName} completed your task with feedback: ${feedback}`,
          type: "task_completed",
          taskId: taskId,
          completedBy: { id: userId, name: userName, image: userImage },
        });
        console.log(`Emitted notification to org_${task.createdBy}`);
      } else {
        console.log(
          "⚠️ Socket.io not available, skipping real-time notification"
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Task completed successfully",
      completedTask,
      taskUpdated: !!updatedTask,
    });
  } catch (error) {
    console.error("❌ Error in completed-tasks route:", error);
    res.status(500).json({
      error: "Failed to complete task",
      details: error.message,
    });
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
