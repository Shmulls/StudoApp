import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const HistoryTasks = ({ route }: any) => {
  const { completedTasks } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Tasks</Text>
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <Text style={styles.taskDetails}>
              Completed at: {new Date(item.completedAt).toLocaleString()}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
