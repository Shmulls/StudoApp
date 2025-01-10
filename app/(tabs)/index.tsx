import { useUser } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";

const HomeScreen = () => {
  const { user } = useUser();
  // const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Go shopping for Daphne Levy",
      description:
        "Go to her house and collect money and a shopping list, then go shopping at the nearest supermarket and buy for her the products she requested.",
      time: "11:00 AM",
      location: "Hagvora 11, Ashdod",
      signedUp: false,
    },
    {
      id: 2,
      title: "Go shopping for Daphne Levy",
      description:
        "Go to her house and collect money and a shopping list, then go shopping at the nearest supermarket and buy for her the products she requested.",
      time: "11:00 AM",
      location: "Hagvora 11, Ashdod",
      signedUp: false,
    },
  ]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //   //   setTime(new Date());
  //   // }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  const handleSignUp = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, signedUp: !task.signedUp } : task
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar> */}
        {/* <Text style={styles.date}>{time.toDateString()}</Text> */}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Achievement progress</Text>
        <Progress.Bar
          progress={0.6}
          width={null}
          height={10}
          color="#333"
          borderColor="#ddd"
          style={styles.progressBar}
        />
      </View>

      {/* Task Section */}
      <Text style={styles.tasksTitle}>
        Volunteers available in your area (1)
      </Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              <Text style={styles.taskDetails}>
                <Text style={styles.bold}>📍 {item.location}</Text>{" "}
                <Text style={styles.bold}>⏰ {item.time}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.taskButton,
                item.signedUp && styles.taskButtonCompleted,
              ]}
              onPress={() => handleSignUp(item.id)}
            >
              <Text style={styles.taskButtonText}>
                {item.signedUp ? "✅" : "Sign up"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAD961",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    width: "100%",
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  taskInfo: {
    marginBottom: 10,
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
  taskButton: {
    alignSelf: "flex-end",
    backgroundColor: "#333",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  taskButtonCompleted: {
    backgroundColor: "#4CAF50",
  },
  taskButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
