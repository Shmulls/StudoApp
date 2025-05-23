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
import { fetchCompletedTasks } from "../../../api";
import { Task } from "../../../types/task";

const HistoryTasks = () => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const getCompletedTasks = async () => {
      try {
        const { data } = await fetchCompletedTasks();
        setCompletedTasks(data);
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    };

    getCompletedTasks();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ height: 80 }} /> {/* ~3 inches of space above header */}
      <View style={styles.header}>
        <Text style={styles.title}>Completed Tasks</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Ionicons name="home" size={24} color="#333" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <Text style={styles.taskDetails}>
              Completed at:{" "}
              {item.completedAt
                ? new Date(item.completedAt).toLocaleString()
                : "N/A"}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default HistoryTasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAD961",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  headerIcons: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 10,
  },
  taskCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
  },
  taskDetails: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
  },
});
