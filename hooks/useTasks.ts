import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Task } from "../types/task";

export const useTasks = (user: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      console.log("❌ No user ID available");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Fetching tasks for user:", user.id);

      // ✅ Add excludeCompleted=true to prevent completed tasks from showing in New tab
      const response = await fetch(
        `${API_URL}/tasks?userId=${user.id}&excludeCompleted=true`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(
          `✅ Fetched ${data.length} tasks with user-specific signup status`
        );
        setTasks(data);

        // ✅ Save to cache for offline use
        try {
          await AsyncStorage.setItem(`tasks_${user?.id}`, JSON.stringify(data));
          console.log("💾 Tasks cached successfully");
        } catch (cacheError) {
          console.log("⚠️ Failed to cache tasks");
        }
      } else {
        console.error("❌ Failed to fetch tasks");
      }
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);

      // Try to load cached data
      try {
        const cached = await AsyncStorage.getItem(`tasks_${user?.id}`);
        if (cached && tasks.length === 0) {
          setTasks(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.log("No cached data available");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, API_URL]);

  const handleSignUp = async (taskId: string) => {
    if (!user?.id) return;

    try {
      console.log("📝 Signing up for task:", taskId);

      const response = await fetch(`${API_URL}/tasks/${taskId}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user?.fullName || user?.firstName || "Unknown User",
          userImage: user?.imageUrl || null,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        console.log("✅ Signup successful");

        // Update the task in local state
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
        );
      } else {
        const error = await response.json();
        console.error("❌ Signup failed:", error.message);
      }
    } catch (error) {
      console.error("❌ Error in signup:", error);
    }
  };

  const handleComplete = useCallback(
    async (taskId: string, feedback?: string, pointsReward?: number) => {
      if (!user?.id) return;

      try {
        console.log("🔄 Completing task:", taskId);
        console.log("🔄 Feedback:", feedback);
        console.log("🔄 Points:", pointsReward);

        const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            feedback: feedback || "",
            pointsReward: pointsReward || 1,
            userName: user.fullName || user.firstName || "Unknown User",
            userImage: user.imageUrl || null,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Task completion successful:", result);

          // ✅ Remove the completed task from local tasks state
          setTasks((prevTasks) => {
            const updatedTasks = prevTasks.filter(
              (task) => task._id !== taskId
            );
            console.log(
              `📝 Removed completed task. Tasks remaining: ${updatedTasks.length}`
            );
            return updatedTasks;
          });

          console.log("📝 Local task state updated - completed task removed");
          return result;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Task completion failed");
        }
      } catch (error) {
        console.error("❌ Error in handleComplete:", error);
        throw error;
      }
    },
    [user?.id, API_URL]
  );

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [fetchTasks, user?.id]);

  return {
    tasks,
    visibleTasks: tasks, // You can add filtering logic here if needed
    loading,
    handleSignUp,
    handleComplete,
    fetchTasks,
    setTasks,
  };
};
