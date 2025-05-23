import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import CalendarProgress from "../../../components/CalendarProgress";
import FeedbackModal from "../../../components/FeedbackModal";
import TaskCard from "../../../components/TaskCard";
import { useTasks } from "../../../hooks/useTasks"; // <-- import the hook

const HomeScreen = () => {
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const { visibleTasks, loading, handleSignUp, handleComplete, tasks } =
    useTasks(user);

  // Show feedback modal and handle feedback submission
  const onComplete = (taskId: string) => {
    setSelectedTaskId(taskId);
    setModalVisible(true);
  };

  const submitFeedback = async () => {
    if (!selectedTaskId) return;
    const success = await handleComplete(selectedTaskId, feedback);
    if (success) {
      Alert.alert("Success", "Feedback submitted successfully!");
    }
    setModalVisible(false);
    setFeedback("");
    setSelectedTaskId(null);
  };

  return (
    <View style={styles.container}>
      {loading && !modalVisible && (
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
        Volunteers available in your area ({visibleTasks.length})
      </Text>
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onSignUp={handleSignUp}
            onComplete={onComplete}
          />
        )}
      />

      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={submitFeedback}
        loading={loading}
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
