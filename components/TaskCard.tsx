/**
 * TaskCard Component
 * ------------------
 * Purpose:
 *   - Renders a single task card for the home feed.
 *   - Displays task title, description, time, and action buttons.
 *   - Handles sign up/cancel and complete actions via props.
 * Usage:
 *   <TaskCard
 *     task={task}
 *     onSignUp={handleSignUp}
 *     onComplete={handleComplete}
 *   />
 */

import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Task } from "../types/task";
import FeedbackModal from "./FeedbackModal";

interface TaskCardProps {
  task: Task;
  onSignUp: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onTaskUpdate?: (taskId: string) => void;
}

const TaskCard = ({
  task,
  onSignUp,
  onComplete,
  onTaskUpdate,
}: TaskCardProps) => {
  const { user } = useUser();
  const [isPressed, setIsPressed] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Show feedback modal when complete button is pressed
  const handleCompletePress = () => {
    setShowFeedbackModal(true);
  };

  // Handle the actual task completion with feedback
  const handleCompleteTask = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      console.log("🔥 Starting task completion process...");
      console.log("Task ID:", task._id);
      console.log("User ID:", user?.id);
      console.log("Feedback:", feedback);

      const apiUrl = `http://128.140.74.218:5001/api/tasks/${task._id}/complete`;
      console.log("📡 API URL:", apiUrl);

      const requestBody = {
        userId: user?.id,
        feedback: feedback || null,
      };
      console.log("📦 Request body:", requestBody);

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      // Try to parse the response
      let result;
      try {
        const responseText = await response.text();
        console.log("📄 Raw response text:", responseText);

        if (responseText) {
          result = JSON.parse(responseText);
          console.log("✅ Task completion response:", result);

          // Verify the completion was successful
          if (result.message && result.message.includes("completed")) {
            console.log("🎉 Task completion confirmed!");
          }
        }
      } catch (parseError) {
        console.error("⚠️ Error parsing response JSON:", parseError);
        // Don't throw here - the HTTP status was successful
        console.log("ℹ️ Treating as successful despite parse error");
      }

      // ALWAYS close modal and update UI if we got a successful HTTP status
      console.log("🔄 Updating UI state...");

      // Close the feedback modal and reset states
      setShowFeedbackModal(false);
      setFeedback("");
      setSubmitting(false);

      // Notify parent component (wrap in try-catch to isolate errors)
      try {
        console.log("📢 Notifying parent components...");
        onComplete(task._id);

        if (onTaskUpdate) {
          console.log("🔄 Triggering task update...");
          onTaskUpdate(task._id);
        }
      } catch (parentError) {
        console.error("⚠️ Error in parent notifications:", parentError);
        // Don't let parent errors affect our success flow
      }

      // Show success message
      console.log("🎉 Showing success message...");
      Alert.alert(
        "Success! 🎉",
        "Task completed successfully! You earned +1 point!"
      );
    } catch (error) {
      console.error("💥 Error in task completion flow:", error);
      setSubmitting(false);

      // Check if this is a network/fetch error vs a real API error
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        "message" in error &&
        (error as { name: string; message: string }).name === "TypeError" &&
        (error as { name: string; message: string }).message.includes(
          "Network request failed"
        )
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        (error as { message: string }).message.includes("JSON")
      ) {
        // JSON parsing error - but might still be successful
        console.log(
          "🤔 JSON error detected, checking if task was completed anyway..."
        );

        // Close modal and refresh to see current state
        setShowFeedbackModal(false);
        setFeedback("");

        Alert.alert(
          "Task Updated",
          "Your task may have been completed. Refreshing the task list...",
          [
            {
              text: "OK",
              onPress: () => {
                if (onTaskUpdate) {
                  onTaskUpdate(task._id);
                }
              },
            },
          ]
        );
      } else {
        // Real error
        Alert.alert(
          "Error",
          `Failed to complete task: ${
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message: string }).message
              : String(error)
          }\n\nPlease try again.`
        );
      }
    }
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedback("");
  };

  const renderActionButtons = () => {
    if (!task.signedUp) {
      // Register Button
      return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            style={styles.modernRegisterButton}
            onPress={() => onSignUp(task._id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.registerButtonText}>Register</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else {
      // Complete and Cancel buttons
      return (
        <View style={styles.assignedButtonContainer}>
          <TouchableOpacity
            style={styles.modernCancelButton}
            onPress={() => onSignUp(task._id)} // This will toggle signedUp to false
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="#ff4757" />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={styles.modernCompleteButton}
              onPress={handleCompletePress} // Show feedback modal instead of completing directly
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.completeButtonText}>Complete</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }
  };

  const formatTaskDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // If it's today, just show time
    if (taskDate.getTime() === today.getTime()) {
      return `Today • ${timeStr}`;
    }

    // If it's tomorrow
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (taskDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow • ${timeStr}`;
    }

    // Otherwise show date and time
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <View style={styles.modernTaskCard}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskPriority} />
          <View style={styles.taskMainContent}>
            <Text style={styles.modernTaskTitle} numberOfLines={2}>
              {task.title}
            </Text>
            <View style={styles.taskTimeContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.modernTaskTime}>
                {task.time ? formatTaskDateTime(task.time) : "No time set"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.modernTaskDescription} numberOfLines={2}>
          {task.description}
        </Text>

        <View style={styles.taskCardFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.modernLocationText} numberOfLines={1}>
              {task.locationLabel || "No location selected"}
            </Text>
          </View>
          {renderActionButtons()}
        </View>
      </View>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={handleCloseFeedbackModal}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={handleCompleteTask}
        loading={submitting}
      />
    </>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  modernTaskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  taskCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9800",
    marginRight: 12,
    marginTop: 6,
  },
  taskMainContent: {
    flex: 1,
  },
  modernTaskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  taskTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modernTaskTime: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  modernTaskDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 16,
  },
  taskCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  modernLocationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  modernRegisterButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  assignedButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modernCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffe0e0",
  },
  modernCompleteButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
