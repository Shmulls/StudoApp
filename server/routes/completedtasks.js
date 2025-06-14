const express = require("express");
const router = express.Router();
const CompletedTask = require("../models/CompletedTask");
const Notification = require("../models/Notification"); // Add this import
const Task = require("../models/Task"); // Add this import

router.post("/completed-tasks", async (req, res) => {
  try {
    const {
      userId,
      taskId,
      title,
      description,
      location,
      time,
      signedUp,
      feedback,
      userName, // Add this parameter
      userImage, // Add this parameter
    } = req.body;

    console.log("CompletedTask POST body:", req.body);

    // Save completed task
    const completedTask = new CompletedTask({
      userId,
      taskId,
      title,
      description,
      location,
      time,
      signedUp,
      feedback,
      completedAt: new Date(),
    });

    await completedTask.save();

    // Find the original task to get the organization owner (createdBy)
    const originalTask = await Task.findById(taskId);

    if (originalTask && originalTask.createdBy !== userId) {
      // Create notification for organization owner with actual user info
      const notification = new Notification({
        title: `Task "${title}" Completed`,
        message: `A user has completed the task "${title}"${
          feedback ? ` with feedback: ${feedback}` : "."
        }`,
        type: "task_completed",
        userId: originalTask.createdBy, // Organization owner who created the task
        taskId: taskId,
        completedBy: {
          id: userId,
          name: userName || "Unknown User", // Use the actual user name
          image: userImage || null, // Use the actual user image
        },
        read: false,
      });

      await notification.save();
      console.log("Task completion notification created:", notification);

      // Send real-time notification
      const io = req.app.get("io");
      if (io) {
        io.to(`org_${originalTask.createdBy}`).emit(
          "new-notification",
          notification
        );
        console.log(`Emitted notification to org_${originalTask.createdBy}`);
      }
    }

    res.status(201).json({
      success: true,
      message: "Task completed successfully",
      completedTask,
    });
  } catch (error) {
    console.error("Error saving completed task:", error);
    res.status(500).json({ error: "Failed to save completed task" });
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
