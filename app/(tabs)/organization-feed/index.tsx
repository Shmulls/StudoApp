import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchTasks, updateTask } from "../../../api";
import { Task } from "../../../types/task";

const Organization = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const closedTasksRef = useRef<LottieView>(null);
  const openTasksRef = useRef<LottieView>(null);

  // Check if the user has the correct role
  useEffect(() => {
    if (user?.unsafeMetadata?.role !== "organization") {
      router.push("/auth/not-authorized"); // Redirect unauthorized users
    }
  }, [user]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      // Play the closed tasks animation
      if (closedTasksRef.current) {
        closedTasksRef.current.play();
      }

      // Play the open tasks animation
      if (openTasksRef.current) {
        openTasksRef.current.play();
      }
    }, 1000); // Trigger every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleSignUp = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.error("Task not found");
      return;
    }

    const updatedTask = { ...task, signedUp: !task.signedUp };
    try {
      await updateTask(taskId, updatedTask); // Update the task in the backend
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>✅ You are in the Organization Feed</Text>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.headerIcons}>
          {/* Notification Icon */}
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons
              name="notifications-outline"
              size={30}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Settings Icon */}
          <TouchableOpacity
            onPress={() => router.push("/organization-settings")}
          >
            <Ionicons
              name="settings-outline"
              size={30}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Bar */}
      <View style={styles.statisticsBar}>
        <View style={styles.statisticsItem}>
          <LottieView
            ref={closedTasksRef}
            source={require("../../../assets/images/closed-tasks.json")} // Path to your Lottie JSON file
            autoPlay
            loop={false}
            style={styles.lottieIcon}
          />
          <Text style={styles.statisticsLabel}>Closed Tasks</Text>
          <Text style={styles.statisticsValue}>2</Text>
        </View>
        <View style={styles.statisticsItem}>
          <LottieView
            ref={openTasksRef}
            source={require("../../../assets/images/opened-tasks.json")} // Path to your Lottie JSON file
            autoPlay
            loop={false}
            style={styles.lottieIcon}
          />
          <Text style={styles.statisticsLabel}>Open Tasks</Text>
          <Text style={styles.statisticsValue}>{tasks.length}</Text>
        </View>
      </View>

      {/* Task Section */}
      <Text style={styles.tasksTitle}>
        Volunteers related to my organization
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
                <Text style={styles.bold}>📍 {item.location}</Text>{" "}
                <Text style={styles.bold}>⏰ {item.time}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.taskButton,
                item.signedUp && styles.taskButtonCompleted,
              ]}
              onPress={() => handleSignUp(item._id)}
            >
              <Text style={styles.taskButtonText}>
                {item.signedUp ? "Completed" : "Pending"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Organization;

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
    width: 45,
    height: 45,
    borderRadius: 40,
    borderColor: "#fff",
    borderWidth: 2,
    marginTop: 25,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
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
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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
    color: "#fff",
    fontWeight: "bold",
  },
  statisticsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statisticsItem: {
    alignItems: "center",
    flex: 1,
  },
  statisticsLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statisticsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statisticsIcon: {
    width: 80,
    height: 80,
  },
  lottieIcon: {
    width: 50,
    height: 50,
  },
});
