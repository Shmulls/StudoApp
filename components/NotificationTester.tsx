import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const NotificationTester = ({ task }: { task: any }) => {
  const [testingNotification, setTestingNotification] = useState(false);

  const testNotificationFlow = async () => {
    if (!Device.isDevice) {
      setTestingNotification(true);

      // Simulate notification scheduling
      console.log("🧪 TESTING NOTIFICATION FLOW:");
      console.log("📅 Task:", task.title);
      console.log("⏰ Task Time:", new Date(task.time).toLocaleString());

      const taskDate = new Date(task.time);
      const reminderTimes = [60, 30, 5];

      reminderTimes.forEach((minutes) => {
        const reminderTime = new Date(taskDate.getTime() - minutes * 60 * 1000);
        console.log(
          `🔔 Would notify ${minutes} min before:`,
          reminderTime.toLocaleString()
        );
      });

      // Simulate notification popup
      setTimeout(() => {
        Alert.alert(
          "📅 Task Starting Soon!",
          `"${task.title}" starts in 30 minutes`,
          [
            { text: "Dismiss", style: "cancel" },
            {
              text: "View Task",
              onPress: () => console.log("User tapped notification"),
            },
          ]
        );
        setTestingNotification(false);
      }, 2000);
    }
  };

  if (Device.isDevice) return null; // Only show in simulator

  return (
    <View style={styles.testerContainer}>
      <TouchableOpacity
        style={styles.testButton}
        onPress={testNotificationFlow}
        disabled={testingNotification}
      >
        <Ionicons
          name={testingNotification ? "hourglass" : "notifications-outline"}
          size={16}
          color="#fff"
        />
        <Text style={styles.testButtonText}>
          {testingNotification ? "Testing..." : "🧪 Test Notification"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  testerContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  testButton: {
    backgroundColor: "#9C27B0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
