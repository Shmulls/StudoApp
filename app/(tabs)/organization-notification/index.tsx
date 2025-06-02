import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: "task_completed" | "task_assigned" | "task_reminder" | "general";
  userId: string;
  taskId?: string;
  completedBy?: {
    id: string;
    name: string;
    image?: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

const NotificationsScreen = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const getNotifications = async () => {
      try {
        console.log("Fetching notifications for user:", user.id);
        const response = await fetchNotifications(user.id);
        console.log("API Response:", response);

        // Handle axios response structure
        const notificationsData = response.data?.data || response.data || [];
        console.log("Notifications data:", notificationsData);

        // Filter notifications for this organization owner only
        const orgNotifications = notificationsData.filter(
          (notification: Notification) =>
            notification.userId === user.id &&
            notification.type === "task_completed"
        );

        console.log("Filtered notifications:", orgNotifications);
        setNotifications(orgNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Show user-friendly error
        Alert.alert("Error", "Failed to load notifications. Please try again.");
      }
    };

    getNotifications();

    // Listen for real-time notifications specific to this organization
    socket.emit("join-organization", user.id);

    socket.on("new-notification", (notification: Notification) => {
      console.log("Received new notification:", notification);
      // Only add notification if it's for this organization owner
      if (
        notification.userId === user.id &&
        notification.type === "task_completed"
      ) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    // Clean up socket connection
    return () => {
      socket.off("new-notification");
      socket.emit("leave-organization", user.id);
    };
  }, [user]);

  const handleRefresh = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      const response = await fetchNotifications(user.id);
      const notificationsData = response.data?.data || response.data || [];
      const orgNotifications = notificationsData.filter(
        (notification: Notification) =>
          notification.userId === user.id &&
          notification.type === "task_completed"
      );
      setNotifications(orgNotifications);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      Alert.alert("Error", "Failed to refresh notifications.");
    }
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to task details if taskId exists
    if (notification.taskId) {
      router.push(`/(tabs)/organization-feed?taskId=${notification.taskId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return { name: "checkmark-circle", color: "#4CAF50" };
      case "task_assigned":
        return { name: "person-add", color: "#FF9800" };
      case "task_reminder":
        return { name: "time", color: "#2196F3" };
      default:
        return { name: "notifications", color: "#FF9800" };
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.read && styles.unreadNotification,
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

          {item.completedBy && (
            <View style={styles.completedBySection}>
              <View style={styles.completedByInfo}>
                {item.completedBy.image ? (
                  <Image
                    source={{ uri: item.completedBy.image }}
                    style={styles.completedByImage}
                  />
                ) : (
                  <View style={styles.completedByImagePlaceholder}>
                    <Ionicons name="person" size={16} color="#666" />
                  </View>
                )}
                <Text style={styles.completedByText}>
                  Completed by {item.completedBy.name}
                </Text>
              </View>
              {item.taskId && (
                <TouchableOpacity style={styles.viewTaskButton}>
                  <Text style={styles.viewTaskButtonText}>View Task</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FF9800" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Task Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push("/(tabs)/organization-feed")}
        >
          <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filter Info */}
      <View style={styles.filterInfo}>
        <Ionicons name="information-circle-outline" size={16} color="#666" />
        <Text style={styles.filterInfoText}>
          Showing task completion notifications for your organization
        </Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item: Notification) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF9800"]}
            tintColor="#FF9800"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#ddd" />
            <Text style={styles.emptyStateTitle}>No task notifications</Text>
            <Text style={styles.emptyStateSubtitle}>
              You'll see notifications here when users complete your
              organization's tasks
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;

// ... existing styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
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
    borderLeftColor: "#FF9800",
    backgroundColor: "#fffbf5",
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
    marginBottom: 12,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  completedBySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
  },
  completedByInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  completedByImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  completedByImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  completedByText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  viewTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewTaskButtonText: {
    fontSize: 10,
    color: "#FF9800",
    fontWeight: "600",
    marginRight: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9800",
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
});
