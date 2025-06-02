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

interface TaskCardProps {
  task: Task;
  onSignUp: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskCard = ({ task, onSignUp, onComplete }: TaskCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
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
              onPress={() => onComplete(task._id)}
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

  return (
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
              {task.time
                ? new Date(task.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No time set"}
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
