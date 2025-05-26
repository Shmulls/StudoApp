import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";
import { fetchNotifications } from "../../../api";
import { Notification } from "../../../types/notifications";

const socket = io("http://localhost:5001");

const NotificationsScreen = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const { data } = await fetchNotifications(user?.id);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    getNotifications();

    // Listen for real-time notifications
    socket.on("new-notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]); // NOTE - This is a common pattern to update the state with the new notification
    });

    // Clean up socket connection
    return () => {
      socket.off("new-notification");
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Ionicons name="home" size={24} color="#333" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item: Notification) => item._id}
        renderItem={({ item }: { item: Notification }) => (
          <View style={styles.notificationCard}>
            <Ionicons
              name="return-down-forward-outline"
              size={45}
              color="#000"
            />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAD961",
    padding: 20,
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 3,
  },
  notificationContent: {
    marginLeft: 10,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
  },
});
