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
  onSignUp?: (taskId: string) => void;
  onComplete?: (pointsEarned: number) => void; // Add this line
  onTaskUpdate?: () => void;
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
      console.log("Points to award:", task.pointsReward || 1);

      const apiUrl = `http://128.140.74.218:5001/api/tasks/${task._id}/complete`;
      console.log("📡 API URL:", apiUrl);

      const requestBody = {
        userId: user?.id,
        feedback: feedback || null,
        pointsReward: task.pointsReward || 1,
        userName: user?.fullName || user?.firstName || "Unknown User",
        userImage: user?.imageUrl || null,
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

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Task completion response:", result);

        // Call onComplete with the actual points earned
        if (onComplete) {
          const pointsEarned = task.pointsReward || 1;
          console.log(`🎯 Calling onComplete with ${pointsEarned} points`);
          onComplete(pointsEarned); // FIX: Pass pointsEarned instead of task._id
        }

        setShowFeedbackModal(false);
        setFeedback("");
      } else {
        console.error("❌ Failed to complete task:", response.status);
      }
    } catch (error) {
      console.error("❌ Error completing task:", error);
    } finally {
      setSubmitting(false);
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
            onPress={() => onSignUp && onSignUp(task._id)}
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
            onPress={() => onSignUp && onSignUp(task._id)} // This will toggle signedUp to false
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

          {/* Reward Badge */}
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.rewardText}>+{task.pointsReward || 1}</Text>
          </View>
        </View>

        <Text style={styles.modernTaskDescription} numberOfLines={2}>
          {task.description}
        </Text>

        {/* Task Stats Row - Remove trophy, keep only duration */}
        <View style={styles.taskStatsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.statText}>{task.estimatedHours || 1}h</Text>
          </View>
          {/* Remove the trophy stat item completely */}
        </View>

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
        pointsReward={task.pointsReward || 1} // Pass points to modal
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
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F57F17",
    marginLeft: 4,
  },
  taskStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginLeft: 6,
  },
});
