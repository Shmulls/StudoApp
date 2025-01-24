const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes); // Add the notifications route

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const cron = require("node-cron");
const Notification = require("./models/Notification");

// Schedule a task to clean up notifications older than 30 days
cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled cleanup for old notifications...");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

  try {
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
    });
    console.log(`Deleted ${result.deletedCount} old notifications.`);
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
  }
});
