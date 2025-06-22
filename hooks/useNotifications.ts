import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { NotificationService } from "../services/notificationService";

export const useNotifications = () => {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Request permissions when app starts
    NotificationService.requestPermissions();

    // Listen for notifications when app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification received:", notification);
      });

    // Listen for user tapping on notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);

        const data = response.notification.request.content.data;
        if (data?.type === "task-reminder") {
          // Handle navigation to task or show task details
          console.log("📋 Task reminder tapped:", data.taskTitle);
          // You can add navigation logic here
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    scheduleTaskReminder: NotificationService.scheduleTaskReminder,
    cancelTaskReminder: NotificationService.cancelTaskReminder,
    scheduleMultipleReminders: NotificationService.scheduleMultipleReminders,
  };
};
