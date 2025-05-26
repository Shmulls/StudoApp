import CompletedTaskCard from "@/components/CompletedTaskCard";
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
import FeedbackModal from "../../../components/FeedbackModal";
import MilestoneProgressBar from "../../../components/MilestoneProgressBar";
import TaskCard from "../../../components/TaskCard";
import { useTasks } from "../../../hooks/useTasks";

const HomeScreen = () => {
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState<"new" | "assigned" | "complete">("new");
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // New state

  const { tasks, visibleTasks, loading, handleSignUp, handleComplete } =
    useTasks(user);

  // Progress bar data
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  // Task filters for tabs
  const newTasks = visibleTasks.filter((t) => !t.signedUp);
  const assignedTasks = visibleTasks.filter((t) => t.signedUp);
  const completedTasks = tasks.filter((t) => t.completed);

  // Build period marking for tasks (example: each task is a period of 1 day)
  const markedDates = tasks.reduce((acc, task) => {
    if (task.time) {
      const dateObj = new Date(task.time);
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split("T")[0];
        acc[dateStr] = {
          startingDay: true,
          endingDay: true,
          color: task.completed ? "#FFB17A" : "#FAD961",
          textColor: "#222",
        };
      }
    }
    return acc;
  }, {} as Record<string, any>);

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

      {/* Header Section - always visible */}
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
        </View>
      </View>

      {/* Welcome Section - always visible */}
      <Text style={styles.welcomeText}>
        Welcome Back, <Text style={styles.bold}>{user?.firstName}</Text>!{" "}
        <Text style={{ color: "#FF9800" }}>🧡</Text>
      </Text>

      {/* Milestone Progress Bar - always visible */}
      <MilestoneProgressBar completed={completedCount} total={totalCount} />

      {/* Tabs for New, Assigned, Complete - always visible */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab("new")}
          style={[styles.tab, tab === "new" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "new" && styles.tabTextActive]}>
            New
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("assigned")}
          style={[styles.tab, tab === "assigned" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "assigned" && styles.tabTextActive]}
          >
            Assigned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("complete")}
          style={[styles.tab, tab === "complete" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "complete" && styles.tabTextActive]}
          >
            Complete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Section */}
      <FlatList
        data={
          tab === "new"
            ? newTasks
            : tab === "assigned"
            ? assignedTasks
            : completedTasks // Show completed tasks for the "Complete" tab
        }
        keyExtractor={(item) => item._id}
        renderItem={({ item }) =>
          tab === "complete" ? (
            <CompletedTaskCard task={item} />
          ) : (
            <TaskCard
              task={item}
              onSignUp={handleSignUp}
              onComplete={onComplete}
            />
          )
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            {tab === "new"
              ? "No new tasks available."
              : tab === "assigned"
              ? "No assigned tasks."
              : "No completed tasks."}
          </Text>
        }
      />

      <FeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={submitFeedback}
        loading={loading}
      />

      {/* Display selected date */}
      {selectedDate && (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Selected date: {selectedDate}
        </Text>
      )}
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
    marginBottom: 10,
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
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 10,
    color: "#222",
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    elevation: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#FAD961",
  },
  tabText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#222",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
