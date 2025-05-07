import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchTasks, updateTask } from "../../../api";
import CalendarProgress from "../../../components/CalendarProgress";
import { Task } from "../../../types/task";
import { addTaskToCalendar } from "../../../utils/calendarUtils";

const HomeScreen = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch tasks from the backend
  useEffect(() => {
    const getTasks = async () => {
      try {
        const { data } = await fetchTasks(); // Fetch tasks from the backend
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasks();
  }, []);

  const handleSignUp = async (taskId: string) => {
    console.log("handleSignUp called with taskId:", taskId);
    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.error("Task not found");
      return;
    }

    console.log("Task time before adding to calendar:", task.time);

    const updatedTask = { ...task, signedUp: !task.signedUp };
    try {
      setLoading(true); // Start loading

      // Perform both operations in parallel
      await Promise.all([
        updateTask(taskId, updatedTask), // Update the task in the backend
        !task.signedUp && addTaskToCalendar(task), // Add the task to the calendar
      ]);

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );

      if (!task.signedUp) {
        Alert.alert("Success", "Successfully added to calendar!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          {/* Notification Icon */}
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Settings Icon */}
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Progress */}
      <CalendarProgress tasks={tasks} />

      {/* Task Section */}
      <Text style={styles.tasksTitle}>
        Volunteers available in your area ({tasks.length})
      </Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              <Text style={styles.taskDetails}>
                <Text style={styles.bold}>
                  ⏰{" "}
                  {new Date(item.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.taskButton,
                item.signedUp && styles.taskButtonCompleted,
              ]}
              onPress={() => handleSignUp(item._id)} // Ensure this is correct
            >
              <Text style={styles.taskButtonText}>
                {item.signedUp ? "Cancel" : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAD961",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginTop: 45,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
  },
  icon: {
    marginLeft: 20,
  },
  menuIcon: {
    fontSize: 24,
    color: "#333",
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    borderColor: "#00000",
    borderRadius: 5,
    width: "100%",
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderColor: "#000",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#fff",
    shadowOpacity: 2,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  checkedICON: {
    width: 30,
    height: 30,
  },
  signupICON: {
    // width: 50,
    // height: 30,
    right: 10,
  },
  taskDetails: {
    fontSize: 12,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  taskButton: {
    position: "absolute",
    right: 20,
    bottom: 8,
  },
  taskButtonCompleted: {
    backgroundColor: "#4CAF50",
    borderRadius: 9,
    padding: 4,
  },
  taskButtonText: {
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    padding: 8,
    color: "#000",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
