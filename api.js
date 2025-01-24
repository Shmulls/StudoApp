import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001/api" });

export const fetchTasks = () => API.get("/tasks");
export const createTask = (task) => API.post("/tasks", task);
export const updateTask = (id, updatedTask) =>
  API.patch(`/tasks/${id}`, updatedTask);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Fetch notifications for a user
export const fetchNotifications = (userId) =>
  API.get(`/notifications/${userId}`);

// Create a notification (if needed for testing)
export const createNotification = (notification) =>
  API.post("/notifications", notification);
