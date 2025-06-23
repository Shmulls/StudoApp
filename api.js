import axios from "axios";

// Define API_URL properly
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api";

// Add comprehensive logging
console.log("🔍 Environment Variables Check:", {
  API_URL: API_URL,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  LOCATION_API: process.env.EXPO_PUBLIC_LOCATION_API_KEY ? "SET" : "NOT SET",
});

const API = axios.create({
  baseURL: API_URL, // Use the defined API_URL
  timeout: 10000, // 10 second timeout
});

// Detailed request/response logging
API.interceptors.request.use(
  (config) => {
    console.log("🚀 API REQUEST:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("❌ REQUEST SETUP ERROR:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("✅ API SUCCESS:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API ERROR:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      code: error.code,
    });
    return Promise.reject(error);
  }
);

// Fix fetchTasks to use axios instead of fetch
export const fetchTasks = async (userId, organizationId) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (organizationId) params.organizationId = organizationId;

    console.log("📡 Fetching tasks with params:", params);

    const response = await API.get("/tasks", { params });
    console.log("✅ Tasks fetched successfully:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    throw error;
  }
};

export const createTask = (task) => API.post("/tasks", task);
export const updateTask = (id, updatedTask) =>
  API.patch(`/tasks/${id}`, updatedTask);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const fetchCompletedTasks = () => API.get("/completed-tasks");

// Add new function to get user points
export const fetchUserPoints = (userId) => API.get(`/tasks/points/${userId}`);

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

// Add this new function specifically for organization tasks
export const fetchOrganizationTasks = async (organizationId) => {
  try {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    console.log("📡 Fetching tasks for organization:", organizationId);

    const response = await API.get("/tasks", {
      params: { organizationId },
    });

    console.log("✅ Organization tasks fetched:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching organization tasks:", error);
    throw error;
  }
};
