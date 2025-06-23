import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";
import { fetchNotifications, markNotificationAsRead } from "../../../api";

const socket = io("http://128.140.74.218:5001");

type UserNotification = {
  _id: string;
  title: string;
  message: string;
  type: "new_task" | "task_reminder" | "general";
  userId: string;
  taskId?: string;
  organizationInfo?: {
    name: string;
    image?: string;
  };
  taskInfo?: {
    title: string;
    location: string;
    time: string;
  };
  status: "unread" | "read";
  createdAt: string;
  updatedAt: string;
};

const UserNotificationsScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    console.log("🔍 Setting up user notifications for:", user.id);

    // Join user room for real-time notifications
    socket.emit("join-user", user.id);
    console.log(`📡 Joined user room: user_${user.id}`);

    // Listen for new notifications
    socket.on("new-notification", (notification) => {
      console.log("🔔 Received new notification:", notification);

      // Check if this notification is for this user
      if (notification.userId === user.id || notification.userId === "all") {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    // Initial fetch
    fetchUserNotifications();

    return () => {
      socket.emit("leave-user", user.id);
      socket.off("new-notification");
    };
  }, [user]);

  const fetchUserNotifications = async () => {
    if (!user?.id) return;

    try {
      console.log("🔍 Fetching notifications for user:", user.id);
      const response = await fetchNotifications(user.id);
      console.log("📡 API Response:", response.data);

      const notificationsData = response.data?.data || response.data || [];

      // Filter for user-relevant notifications (new tasks in their area)
      const userNotifications = notificationsData.filter(
        (notification: UserNotification) => {
          return (
            (notification.userId === user.id ||
              notification.userId === "all") &&
            (notification.type === "new_task" ||
              notification.type === "task_reminder")
          );
        }
      );

      console.log("✅ User notifications:", userNotifications);

      // BETTER: Create a single source of truth by merging all notifications
      setNotifications((prev) => {
        // Create a map to avoid duplicates using notification ID as key
        const notificationMap = new Map();

        // Add existing notifications first
        prev.forEach((notification) => {
          notificationMap.set(notification._id, notification);
        });

        // Add/update with fetched notifications
        userNotifications.forEach((notification: UserNotification) => {
          notificationMap.set(notification._id, notification);
        });

        // Convert back to array and sort by creation date (newest first)
        const mergedNotifications = Array.from(notificationMap.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log(
          `📊 Total notifications after merge: ${mergedNotifications.length}`
        );
        return mergedNotifications;
      });
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: UserNotification) => {
    // Mark as read if unread
    if (notification.status === "unread") {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? { ...item, status: "read" as const }
              : item
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to task details or show more info
    Alert.alert(notification.title, notification.message, [
      { text: "OK", style: "default" },
    ]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_task":
        return { name: "add-circle", color: "#4CAF50" };
      case "task_reminder":
        return { name: "time", color: "#FF9800" };
      default:
        return { name: "notifications", color: "#2196F3" };
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotification = ({ item }: { item: UserNotification }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          item.status === "unread" && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationIcon}>
          <Ionicons
            name={iconData.name as any}
            size={24}
            color={iconData.color}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatNotificationTime(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {/* Organization and Task Info */}
          {item.organizationInfo && (
            <View style={styles.organizationSection}>
              <View style={styles.organizationInfo}>
                {item.organizationInfo.image ? (
                  <Image
                    source={{ uri: item.organizationInfo.image }}
                    style={styles.organizationImage}
                  />
                ) : (
                  <View style={styles.organizationImagePlaceholder}>
                    <Ionicons name="business" size={16} color="#666" />
                  </View>
                )}
                <Text style={styles.organizationText}>
                  {item.organizationInfo.name}
                </Text>
              </View>
            </View>
          )}

          {/* Task Info */}
          {item.taskInfo && (
            <View style={styles.taskInfoSection}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                📋 {item.taskInfo.title}
              </Text>
              <Text style={styles.taskLocation} numberOfLines={1}>
                📍 {item.taskInfo.location}
              </Text>
              <Text style={styles.taskTime}>
                🕒 {new Date(item.taskInfo.time).toLocaleDateString()} at{" "}
                {new Date(item.taskInfo.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        </View>

        {item.status === "unread" && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Back to Home Feed Button */}
        <TouchableOpacity
          style={styles.homeIconButton}
          onPress={() => router.push("/(tabs)/home")}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.filterInfo}>
        <Ionicons name="information-circle" size={16} color="#FF9800" />
        <Text style={styles.filterInfoText}>
          Showing new tasks available in your area
        </Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              You'll receive notifications when new tasks are available in your
              area
            </Text>

            {/* Back to Home Button in Empty State */}
            <TouchableOpacity
              style={styles.emptyStateHomeIcon}
              onPress={() => router.push("/(tabs)/home")}
              activeOpacity={0.7}
            >
              <Ionicons name="home-outline" size={32} color="#222" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  unreadBadge: {
    backgroundColor: "#ff4757",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff3e0",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  filterInfoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#e0e0e0",
  },
  unreadNotification: {
    borderLeftColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  organizationSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  organizationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  organizationImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizationImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  organizationText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  taskInfoSection: {
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 8,
  },
  taskTitle: {
    fontSize: 13,
    color: "#2196F3",
    fontWeight: "600",
    marginBottom: 2,
  },
  taskLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 12,
    color: "#666",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginTop: 6,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  homeIconButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: "#f0f7ff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  emptyStateHomeIcon: {
    marginTop: 16,
    padding: 12,
    borderRadius: 24,
    backgroundColor: "#f0f7ff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});

export default UserNotificationsScreen;
