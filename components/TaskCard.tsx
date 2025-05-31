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

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onSignUp: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onSignUp, onComplete }) => (
  <View style={styles.taskCard}>
    <View style={styles.taskInfo}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <Text style={styles.taskDetails}>
        <Text style={styles.bold}>
          📍 {task.locationLabel || "No location selected"}
        </Text>
      </Text>
      <Text style={styles.taskDetails}>
        <Text style={styles.bold}>
          ⏰{" "}
          {new Date(task.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Text>
    </View>
    <View style={styles.taskActions}>
      <TouchableOpacity
        style={[styles.taskButton, task.signedUp && styles.taskButtonCompleted]}
        onPress={() => onSignUp(task._id)}
      >
        <Text style={styles.taskButtonText}>
          {task.signedUp ? "Cancel" : "Register"}
        </Text>
      </TouchableOpacity>
      {task.signedUp && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete(task._id)}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default TaskCard;
