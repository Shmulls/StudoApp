const express = require("express");
const Task = require("../models/Task");
const CompletedTask = require("../models/CompletedTask");
const Notification = require("../models/Notification");
const router = express.Router();
const mongoose = require("mongoose");

// Get all tasks with user-specific signup status
router.get("/", async (req, res) => {
  try {
    const { userId, excludeCompleted, organizationId } = req.query; // ✅ Add organizationId

    console.log("🔍 Fetching tasks with filters:", {
      userId,
      excludeCompleted,
      organizationId, // ✅ Log it
    });

    // Build query filters
    let query = {};

    // ✅ Filter by organization if provided
    if (organizationId) {
      // Only filter by organization for organization users
      const userRole = req.headers["user-role"] || req.query.userRole;
      if (userRole === "organization") {
        query.createdBy = organizationId;
        console.log("🏢 Filtering tasks for organization:", organizationId);
      }
    }

    // ✅ Exclude completed tasks if requested
    if (excludeCompleted === "true") {
      query.completed = { $ne: true }; // Only get non-completed tasks
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    console.log(
      `📋 Found ${tasks.length} tasks for organization ${
        organizationId || "all"
      }`
    );

    if (userId) {
      // Add user-specific signup status
      const tasksWithSignupStatus = tasks.map((task) => {
        const isSignedUp = task.signedUpUsers?.some(
          (signup) => signup.userId === userId
        );

        return {
          ...task.toObject(),
          signedUp: isSignedUp,
        };
      });

      console.log("✅ Added signup status for user:", userId);
      res.json(tasksWithSignupStatus);
    } else {
      res.json(tasks);
    }
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: error.message });
  }
});

// Sign up for a task
router.post("/:id/signup", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userImage } = req.body;

    console.log("📝 Signup request:", { taskId: id, userId, userName });

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user already signed up
    const alreadySignedUp = task.signedUpUsers?.some(
      (signup) => signup.userId === userId
    );

    if (alreadySignedUp) {
      // User wants to cancel signup
      task.signedUpUsers = task.signedUpUsers.filter(
        (signup) => signup.userId !== userId
      );
      console.log("❌ User cancelled signup for task:", task.title);
    } else {
      // Check if task has available spots
      if (task.signedUpUsers?.length >= task.maxSignups) {
        return res.status(400).json({ message: "Task is full" });
      }

      // Add user to signedUpUsers
      if (!task.signedUpUsers) {
        task.signedUpUsers = [];
      }

      task.signedUpUsers.push({
        userId,
        userName: userName || "Unknown User",
        userImage: userImage || null,
        signedUpAt: new Date(),
      });

      console.log("✅ User signed up for task:", task.title);
    }

    await task.save();

    // Return updated task with user status
    const taskObj = task.toObject();
    const userSignedUp =
      task.signedUpUsers?.some((signup) => signup.userId === userId) || false;

    res.json({
      ...taskObj,
      signedUp: userSignedUp,
      availableSpots: task.maxSignups - (task.signedUpUsers?.length || 0),
      totalSignedUp: task.signedUpUsers?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error in signup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    console.log("🎯 Creating new task:");
    console.log("📦 Raw request body:", req.body);

    const {
      title,
      description,
      location,
      locationLabel,
      time,
      pointsReward,
      estimatedHours,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!title || !description || !time || !createdBy) {
      console.log("❌ Missing required fields:");
      console.log("- title missing:", !title);
      console.log("- description missing:", !description);
      console.log("- time missing:", !time);
      console.log("- createdBy missing:", !createdBy);

      return res.status(400).json({
        message:
          "Missing required fields: title, description, time, and createdBy are required",
        received: {
          title: !!title,
          description: !!description,
          time: !!time,
          createdBy: !!createdBy,
        },
      });
    }

    // Validate location format
    const taskLocation = location || {
      type: "Point",
      coordinates: [0, 0],
    };

    // Create new task
    const newTask = new Task({
      title: title.trim(),
      description: description.trim(),
      location: taskLocation,
      locationLabel: locationLabel || "No location specified",
      time: new Date(time),
      pointsReward: pointsReward || 1,
      estimatedHours: estimatedHours || 1,
      createdBy: createdBy,
      signedUpUsers: [],
      maxSignups: 10,
      completed: false,
    });

    const savedTask = await newTask.save();
    console.log("✅ Task created successfully:", savedTask._id);

    // ✅ ADD NEW TASK NOTIFICATION CREATION
    try {
      console.log("🔔 Creating new task notification...");

      const notification = new Notification({
        userId: "all", // Send to all users (or you can specify user IDs)
        title: `New Task Available: ${savedTask.title}`,
        message: `${savedTask.description.substring(0, 100)}${
          savedTask.description.length > 100 ? "..." : ""
        }`,
        type: "new_task",
        taskId: savedTask._id,
        status: "unread",
        organizationInfo: {
          name: "IMPACT IDF", // You can get this from the organization
          image: null, // Add organization image if available
        },
        taskInfo: {
          title: savedTask.title,
          location: savedTask.locationLabel,
          time: savedTask.time.toISOString(),
        },
      });

      await notification.save();
      console.log("🔔 New task notification created:", notification._id);

      // Emit real-time notification to all users
      const io = req.app.get("io");
      if (io) {
        io.emit("new-notification", notification);
        console.log("📡 Emitted new task notification to all users");
      }
    } catch (notificationError) {
      console.error("❌ Error creating notification:", notificationError);
      // Don't fail the task creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: savedTask,
    });
  } catch (error) {
    console.error("❌ Error creating task:", error);
    res.status(500).json({
      message: error.message || "Failed to create task",
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
    const task = await Task.findById(id);
    if (!task) {
      console.log("❌ Task not found:", id);
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is signed up for this task
    const userSignup = task.signedUpUsers?.find(
      (signup) => signup.userId === userId
    );

    if (!userSignup) {
      console.log("❌ User not signed up for this task");
      return res.status(400).json({
        message: "User not signed up for this task",
        debug: {
          taskId: id,
          userId: userId,
          signedUpUsers: task.signedUpUsers?.map((s) => s.userId) || [],
        },
      });
    }

    console.log("✅ User is signed up, proceeding with completion");

    // Create completed task entry
    const completedTask = new CompletedTask({
      userId: userId,
      taskId: task._id,
      title: task.title,
      description: task.description,
      location: task.location,
      time: task.time,
      signedUp: true,
      feedback: feedback || "",
      pointsReward: pointsReward || task.pointsReward || 1,
      completedAt: new Date(),
    });

    const savedCompletedTask = await completedTask.save();
    console.log("✅ Completed task saved:", savedCompletedTask._id);

    // ✅ FIX: Check if this is a single-user task or multi-user task
    // Remove user from signedUpUsers
    task.signedUpUsers = task.signedUpUsers.filter(
      (signup) => signup.userId !== userId
    );

    // ✅ IMPORTANT: If this was a single-user task or if maxSignups is 1, mark task as completed
    // This prevents it from reappearing in the New tab
    if (task.maxSignups === 1 || task.signedUpUsers.length === 0) {
      task.completed = true;
      console.log(
        "📝 Task marked as completed (single-user or no remaining signups)"
      );
    }

    await task.save();
    console.log("📝 Task updated successfully");

    // Create notification for organization owner
    if (task.createdBy && task.createdBy !== userId) {
      console.log("🔔 Creating completion notification...");

      let message = `Feedback: ${
        feedback || "No feedback provided"
      } | Points earned: ${pointsReward || task.pointsReward || 1}`;

      const notification = new Notification({
        userId: task.createdBy,
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
      completedTask: savedCompletedTask,
      pointsEarned: pointsReward || task.pointsReward || 1,
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
