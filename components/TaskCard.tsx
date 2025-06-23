/**
 * TaskCard Component - Modern Design
 */

import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Linking,
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
  onComplete?: (taskId: string, feedback: string, points: number) => void;
  onTaskUpdate?: () => void;
}

const TaskCard = ({
  task,
  onSignUp,
  onComplete,
  onTaskUpdate,
}: TaskCardProps) => {
  const { user } = useUser();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCompletePress = () => {
    setShowFeedbackModal(true);
  };

  const handleCompleteTask = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const API_URL =
        process.env.EXPO_PUBLIC_API_URL ||
        Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

      const requestBody = {
        userId: user?.id,
        feedback: feedback || "",
        pointsReward: task.pointsReward || 1,
        userName: user?.fullName || user?.firstName || "Unknown User",
        userImage: user?.imageUrl || null,
      };

      const response = await fetch(`${API_URL}/tasks/${task._id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setShowFeedbackModal(false);
        setFeedback("");
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }
    } catch (error) {
      console.error("❌ Error completing task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseFeedbackModal = () => {
    console.log("🔄 Closing feedback modal");
    setShowFeedbackModal(false);
    setFeedback("");
  };

  const handleSignUp = async () => {
    if (onSignUp) {
      await onSignUp(task._id);
    }
  };

  const handleCancel = async () => {
    if (onSignUp) {
      onSignUp(task._id);
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

    if (taskDate.getTime() === today.getTime()) {
      return `Today, ${timeStr}`;
    }

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (taskDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${timeStr}`;
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openInMaps = () => {
    try {
      let mapsUrl = "";
      if (task.location?.coordinates) {
        const [lng, lat] = task.location.coordinates;
        mapsUrl = `https://maps.google.com/maps?q=${lat},${lng}`;
      } else {
        mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
          task.locationLabel || ""
        )}`;
      }

      Linking.openURL(mapsUrl).catch((err) => {
        console.error("❌ Error opening maps:", err);
        Alert.alert("Error", "Could not open maps application");
      });
    } catch (error) {
      console.error("❌ Error preparing maps URL:", error);
      Alert.alert("Error", "Could not prepare navigation");
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.modernCard,
          task.signedUp && styles.assignedCard,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        {/* Main Content */}
        <View style={styles.cardContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.modernTitle} numberOfLines={2}>
                {task.title}
              </Text>
              {task.signedUp && (
                <View style={styles.assignedIndicator}>
                  <Ionicons name="checkmark-circle" size={12} color="#00C851" />
                  <Text style={styles.assignedText}>Assigned</Text>
                </View>
              )}
            </View>
          </View>

          {/* Time & Location Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#007AFF" />
              <Text style={styles.infoText}>
                {task.time ? formatTaskDateTime(task.time) : "No time set"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="#34C759" />
              <Text style={styles.infoText} numberOfLines={2}>
                {task.locationLabel || "No location"}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text
              style={styles.descriptionText}
              numberOfLines={showFullDescription ? undefined : 2}
            >
              {task.description}
            </Text>

            {task.description && task.description.length > 80 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setShowFullDescription(!showFullDescription)}
                activeOpacity={0.7}
              >
                <Text style={styles.expandText}>
                  {showFullDescription ? "Show less" : "Read more"}
                </Text>
                <Ionicons
                  name={showFullDescription ? "chevron-up" : "chevron-down"}
                  size={12}
                  color="#007AFF"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Task Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statChip}>
              <Ionicons name="hourglass-outline" size={12} color="#FF8A00" />
              <Text style={styles.statText}>{task.estimatedHours || 1}h</Text>
            </View>

            {/* ✅ Points chip next to hours */}
            <View style={styles.statChip}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.statText}>+{task.pointsReward || 1}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <View style={styles.actionButtons}>
              {!task.signedUp ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleSignUp}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.joinButtonText}>Join Task</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.assignedActions}>
                  <TouchableOpacity
                    style={styles.navigationBtn}
                    onPress={() => {
                      if (task.locationLabel) {
                        Alert.alert("📍 Navigate to Task", task.locationLabel, [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Open Maps",
                            onPress: openInMaps,
                            style: "default",
                          },
                        ]);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={16} color="#007AFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    testID="complete-task-btn"
                    style={styles.completeButton}
                    onPress={handleCompletePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ✅ Bottom Status Bar - Orange for New, Green for Assigned */}
        <View
          style={[
            styles.bottomStatusBar,
            { backgroundColor: task.signedUp ? "#00C851" : "#FF8A00" }, // Orange for new tasks
          ]}
        />
      </Animated.View>

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={handleCloseFeedbackModal}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={handleCompleteTask}
        loading={submitting}
        pointsReward={task.pointsReward || 1}
      />
    </>
  );
};

export default TaskCard;

// ✅ MODERN STYLES - CLEAN DESIGN
const styles = StyleSheet.create({
  modernCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  assignedCard: {
    shadowColor: "#00C851",
    shadowOpacity: 0.15,
    backgroundColor: "#fafffe",
    borderColor: "#e8f5e8",
  },
  bottomStatusBar: {
    height: 4,
    width: "100%",
    // Optional: Add subtle inner shadow effect
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: -1 },
    elevation: 2,
  },
  cardContent: {
    padding: 20,
  },

  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modernTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D1D1F",
    lineHeight: 24,
    marginBottom: 4,
  },
  assignedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  assignedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#00C851",
    marginLeft: 4,
  },

  // Info Section
  infoSection: {
    flexDirection: "column", // Changed from row to column
    marginBottom: 16,
    gap: 8, // Reduced gap
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed to flex-start for multiline
    minWidth: 0,
  },
  infoText: {
    fontSize: 13,
    color: "#6B6B6B",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18, // Better line height for multiline
  },

  // Description Section
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 20,
    marginBottom: 8,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  expandText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    marginRight: 4,
  },

  // Stats Section
  statsSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  priorityChip: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FED7D7",
  },
  statText: {
    fontSize: 12,
    color: "#495057",
    fontWeight: "600",
    marginLeft: 4,
  },

  // Action Section
  actionSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align everything to the right
  },
  actionButtons: {
    alignItems: "flex-end",
  },

  // Join Button
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF", // Modern blue instead of green
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#007AFF", // Blue shadow instead of green
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  joinButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  // Assigned Actions
  assignedActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Navigation button styling (unchanged but repositioned)
  navigationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBDEFB",
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Cancel/trash button styling
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    shadowColor: "#FF3B30",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // ✅ New green circle complete button
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00C851", // Green background
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00A843", // Darker green border
    shadowColor: "#00C851",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  // New styles for modern corner accent
  cornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    // No shadow for the accent
  },
});
