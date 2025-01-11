import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";

const HomeScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();
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
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.headerIcons}>
          {/* Home icon disabled from home page - may re-used for refresh button */}
          {/* <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="home" size={24} color="#333" style={styles.icon} />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
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
        Volunteers available in your area ({tasks.length})
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
                {item.signedUp ? (
                  <Image
                    source={require("../../assets/images/checked.png")}
                    style={styles.checkedICON}
                  />
                ) : (
                  <Image
                    source={require("../../assets/images/sign-up.png")}
                    style={styles.signupICON}
                  />
                )}
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
    borderColor: "#fff",
    borderWidth: 2,
    marginTop: 60,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
  },
  icon: {
    marginLeft: 20,
  },
  menuIcon: {
    fontSize: 24,
    color: "#333",
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    borderColor: "#00000",
    borderRadius: 5,
    width: "100%",
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskCard: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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
  checkedICON: {
    width: 30,
    height: 30,
  },
  signupICON: {
    // width: 50,
    // height: 30,
    right: 10,
  },
  taskDetails: {
    fontSize: 12,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  taskButton: {
    position: "absolute",
    right: 20,
    bottom: 8,
  },
  taskButtonCompleted: {
    // backgroundColor: "#4CAF50",
  },
  taskButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
