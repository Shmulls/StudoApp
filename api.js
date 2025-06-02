import axios from "axios";

// Change this to your server's public IP:
const API = axios.create({ baseURL: "http://128.140.74.218:5001/api" });

export const fetchTasks = () => API.get("/tasks");
export const createTask = (task) => API.post("/tasks", task);
export const updateTask = (id, updatedTask) =>
  API.patch(`/tasks/${id}`, updatedTask);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const fetchCompletedTasks = () => API.get("/completed-tasks");

// Fix notification functions to use axios consistently
export const fetchNotifications = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  return API.get(`/notifications/${userId}`);
};

// Fix function to mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  return API.patch(`/notifications/${notificationId}`, { status: "read" });
};

// Create a notification (if needed for testing)
export const createNotification = (notification) =>
  API.post("/notifications", notification);

export const addCompletedTask = (completedTask) =>
  API.post("/completed-tasks", completedTask);
