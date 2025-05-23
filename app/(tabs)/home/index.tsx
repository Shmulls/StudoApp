import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addCompletedTask, fetchTasks, updateTask } from "../../../api";
import CalendarProgress from "../../../components/CalendarProgress";
import { Task } from "../../../types/task";
import { addTaskToCalendar } from "../../../utils/calendarUtils";

const HomeScreen = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  // Fetch tasks from the backend
  useEffect(() => {
    const getTasks = async () => {
      try {
        const { data } = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasks();
  }, []);

  const handleSignUp = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const updatedTask = { ...task, signedUp: !task.signedUp };
    try {
      setLoading(true);
      await Promise.all([
        updateTask(taskId, updatedTask),
        !task.signedUp && addTaskToCalendar(task),
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
      setLoading(false);
    }
  };

  const handleComplete = (taskId: string) => {
    setSelectedTaskId(taskId);
    setModalVisible(true);
  };

  const submitFeedback = async () => {
    if (!selectedTaskId) return;

    try {
      setLoading(true);

      // Find the completed task
      const completedTask = tasks.find((task) => task._id === selectedTaskId);
      if (!completedTask) return;

      // Prepare completed task data
      const completedTaskData = {
        userId: user?.id,
        taskId: completedTask._id,
        title: completedTask.title,
        description: completedTask.description,
        location: completedTask.location,
        time: completedTask.time,
        signedUp: completedTask.signedUp,
        feedback, // Optionally add feedback if your model supports it
      };

      // Send to backend
      await addCompletedTask(completedTaskData);

      // Optionally update the task state to mark it as completed
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTaskId ? { ...task, completed: true } : task
        )
      );

      Alert.alert("Success", "Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setFeedback("");
      setSelectedTaskId(null);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Task Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Enter your feedback"
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitFeedback}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* History Button as Icon */}
          <TouchableOpacity
            onPress={() => router.push("/history")}
            style={styles.icon}
          >
            <Ionicons name="cloud-done-outline" size={24} color="#333" />
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
            <View style={styles.taskActions}>
              <TouchableOpacity
                style={[
                  styles.taskButton,
                  item.signedUp && styles.taskButtonCompleted,
                ]}
                onPress={() => handleSignUp(item._id)}
              >
                <Text style={styles.taskButtonText}>
                  {item.signedUp ? "Cancel" : "Register"}
                </Text>
              </TouchableOpacity>
              {item.signedUp && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleComplete(item._id)}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* Remove the old History Button at the bottom */}
      {/* <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.historyButtonText}>Go to History</Text>
      </TouchableOpacity> */}
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
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  taskButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 0.5,
    paddingHorizontal: 4,
    borderRadius: 5,
  },
  taskButtonCompleted: {
    backgroundColor: "#CC5500",
    paddingVertical: 0.5,
    paddingHorizontal: 4,
    borderRadius: 5,
  },
  taskButtonText: {
    borderRadius: 4,
    padding: 8,
    color: "#fff",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  feedbackInput: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 5,
  },
  completeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#000",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  historyButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  historyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
