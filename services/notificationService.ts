import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log(
          "📱 Running on simulator - notifications will be simulated"
        );
        return true; // Return true for simulator to allow testing
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Notification permission not granted");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("task-reminders", {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF9800",
          sound: "default",
        });
      }

      console.log("✅ Notification permissions granted");
      return true;
    } catch (error) {
      console.error("❌ Error requesting notification permissions:", error);
      return false;
    }
  }

  static async scheduleTaskReminder(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    taskTime: string,
    reminderMinutes: number = 30
  ): Promise<string | null> {
    try {
      const taskDate = new Date(taskTime);
      const reminderTime = new Date(
        taskDate.getTime() - reminderMinutes * 60 * 1000
      );

      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        console.log("⏰ Reminder time is in the past, skipping notification");
        return null;
      }

      // For simulator, just log what would happen
      if (!Device.isDevice) {
        console.log(
          `📱 SIMULATOR: Would schedule notification for "${taskTitle}" at ${reminderTime.toLocaleString()}`
        );
        await AsyncStorage.setItem(`notification_${taskId}`, "simulator-id");
        return "simulator-id";
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📅 Task Starting Soon!`,
          body: `"${taskTitle}" starts in ${reminderMinutes} minutes`,
          data: {
            taskId,
            taskTitle,
            taskDescription,
            taskTime,
            type: "task-reminder",
          },
          sound: "default",
          priority: "high",
        },
        trigger: {
          date: reminderTime,
          channelId: "task-reminders",
        },
      });

      // Store notification ID for later cancellation
      await AsyncStorage.setItem(`notification_${taskId}`, notificationId);

      console.log(
        `✅ Scheduled notification for "${taskTitle}" at ${reminderTime.toLocaleString()}`
      );
      return notificationId;
    } catch (error) {
      console.error("❌ Error scheduling notification:", error);
      return null;
    }
  }

  static async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      const notificationId = await AsyncStorage.getItem(
        `notification_${taskId}`
      );
      if (notificationId) {
        // For simulator, just log
        if (!Device.isDevice) {
          console.log(
            `📱 SIMULATOR: Would cancel notification for task ${taskId}`
          );
        } else {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        await AsyncStorage.removeItem(`notification_${taskId}`);
        console.log(`✅ Cancelled notification for task ${taskId}`);
      }
    } catch (error) {
      console.error("❌ Error cancelling notification:", error);
    }
  }

  static async scheduleMultipleReminders(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    taskTime: string
  ): Promise<void> {
    // Schedule multiple reminders: 1 hour, 30 minutes, and 5 minutes before
    const reminderTimes = [60, 30, 5]; // minutes before task

    console.log(
      `⏰ Scheduling ${reminderTimes.length} reminders for "${taskTitle}"`
    );

    for (const minutes of reminderTimes) {
      await this.scheduleTaskReminder(
        `${taskId}_${minutes}min`,
        taskTitle,
        taskDescription,
        taskTime,
        minutes
      );
    }
  }

  static async getAllScheduledNotifications() {
    try {
      if (!Device.isDevice) {
        console.log("📱 SIMULATOR: Would check scheduled notifications");
        return [];
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log("📋 Scheduled notifications:", scheduled.length);
      return scheduled;
    } catch (error) {
      console.error("❌ Error getting scheduled notifications:", error);
      return [];
    }
  }
}
