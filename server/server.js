const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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

// Create an HTTP server and integrate it with socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (update this for production)
  },
});

// Attach io instance to the app for use in routes
app.set("io", io);

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle organization room joining
  socket.on("join-organization", (userId) => {
    socket.join(`org_${userId}`);
    console.log(`User ${userId} joined organization room`);
  });

  // Handle organization room leaving
  socket.on("leave-organization", (userId) => {
    socket.leave(`org_${userId}`);
    console.log(`User ${userId} left organization room`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Routes
const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

const completedTasksRouter = require("./routes/completedtasks");
app.use("/api", completedTasksRouter);

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
