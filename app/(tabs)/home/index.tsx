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
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
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

  // Calendar marking for tasks
  const markedDates = tasks.reduce((acc, task) => {
    if (task.time) {
      const dateObj = new Date(task.time);
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split("T")[0];
        acc[dateStr] = {
          marked: true,
          dotColor: task.completed ? "#4CAF50" : "#FAD961",
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

      {/* Conditionally Render Header, Progress Bar, and Calendar */}
      {tab !== "complete" && (
        <>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Image
                source={{ uri: user?.imageUrl }}
                style={styles.profileImage}
              />
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

          {/* Welcome Section */}
          <Text style={styles.welcomeText}>
            Welcome Back, <Text style={styles.bold}>{user?.firstName}</Text>!{" "}
            <Text style={{ color: "#FF9800" }}>🧡</Text>
          </Text>

          {/* Milestone Progress Bar */}
          <MilestoneProgressBar completed={completedCount} total={totalCount} />

          {/* Calendar View */}
          <View style={[styles.calendarContainer, { flex: 1 }]}>
            <CalendarProvider
              date={new Date().toISOString().split("T")[0]} // Set the initial date
              onDateChanged={(date) => {
                console.log("Date changed to:", date);
                setSelectedDate(date); // Update selected date
              }}
              onMonthChange={(month) => {
                console.log("Month changed to:", month);
              }}
            >
              <WeekCalendar
                current={new Date().toISOString().split("T")[0]}
                markedDates={markedDates}
                onDayPress={(day) => {
                  console.log("Selected day:", day.dateString);
                  setSelectedDate(day.dateString); // Update selected date
                }}
                theme={{
                  backgroundColor: "#fff",
                  calendarBackground: "#fff",
                  textSectionTitleColor: "#222",
                  selectedDayBackgroundColor: "#333",
                  selectedDayTextColor: "#fff",
                  todayTextColor: "#FAD961",
                  dayTextColor: "#222",
                  arrowColor: "#FAD961",
                  monthTextColor: "#222",
                  indicatorColor: "#FAD961",
                  textDayFontWeight: "500",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "bold",
                  textDayFontSize: 16, // Ensure consistent font size for day numbers
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16, // Ensure consistent font size for day headers
                }}
                style={{
                  height: 100, // Increase height to ensure proper spacing
                  paddingVertical: 0, // Remove unnecessary padding
                  justifyContent: "center", // Center-align content
                }}
              />
            </CalendarProvider>
          </View>
        </>
      )}

      {/* Tabs for New, Assigned, Complete */}
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
            <CompletedTaskCard task={item} /> // Use simplified card for completed tasks
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
  calendarContainer: {
    flexGrow: 0, // Prevents the container from growing unnecessarily
    minHeight: 120, // Ensures the calendar has enough space to render
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
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
