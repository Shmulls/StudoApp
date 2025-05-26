import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { createTask, fetchTasks, updateTask } from "../../../api";
import ChartStats from "../../../components/CharStats";
import MapPicker from "../../../components/MapPicker";
import { Task } from "../../../types/task";

const LOCATION_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";

// Define the type for newTask
type NewTask = {
  title: string;
  description: string;
  location: { type: "Point"; coordinates: [number, number] } | null;
  locationLabel: string;
  time: string;
  signedUp: boolean;
};

const Organization = () => {
  const { user, isLoaded } = useUser(); // get isLoaded
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    location: null,
    locationLabel: "",
    time: "",
    signedUp: false,
  });
  const [creating, setCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [orgTab, setOrgTab] = useState<"pending" | "completed" | "statistics">(
    "pending"
  );
  const [tab, setTab] = useState<"year" | "month">("year");
  const closedTasksRef = useRef<LottieView>(null);
  const openTasksRef = useRef<LottieView>(null);

  // Check if the user has the correct role
  useEffect(() => {
    if (!isLoaded) return; // Wait until Clerk user is loaded
    if (user?.unsafeMetadata?.role !== "organization") {
      router.push("/auth/not-authorized"); // Redirect unauthorized users
    }
  }, [user, isLoaded]);

  // Fetch tasks from the backend
  useEffect(() => {
    const getTasks = async () => {
      try {
        const { data } = await fetchTasks(); // Fetch tasks from the backend
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Play the closed tasks animation
      if (closedTasksRef.current) {
        closedTasksRef.current.play();
      }

      // Play the open tasks animation
      if (openTasksRef.current) {
        openTasksRef.current.play();
      }
    }, 1000); // Trigger every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleSignUp = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.error("Task not found");
      return;
    }

    const updatedTask = { ...task, signedUp: !task.signedUp };
    try {
      await updateTask(taskId, updatedTask); // Update the task in the backend
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCreateTask = async () => {
    if (
      !newTask.title ||
      !newTask.description ||
      !newTask.location ||
      !newTask.time
    ) {
      alert("Please fill all fields and select a location.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await createTask(newTask);
      setTasks((prev) => [data, ...prev]);
      setAddTaskVisible(false);
      setNewTask({
        title: "",
        description: "",
        location: null,
        locationLabel: "",
        time: "",
        signedUp: false,
      });
    } catch (e) {
      alert("Failed to create task.");
    }
    setCreating(false);
  };

  const openCount = tasks.filter((t) => !t.completed).length;
  const closedCount = tasks.filter((t) => t.completed).length;
  const returnCount = 0; // Replace with your logic
  const total = openCount + closedCount + returnCount;
  const percent = "+12%"; // Replace with your logic
  const yearChartLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const yearChartData = [5, 8, 6, 10, 12, 7, 9, 11, 8, 10, 7, 12]; // Replace with your real data

  const monthChartLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const monthChartData = [2, 4, 3, 5];

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>✅ You are in the Organization Feed</Text>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.headerIcons}>
          {/* Notification Icon */}
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons
              name="notifications-outline"
              size={30}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Settings Icon */}
          <TouchableOpacity
            onPress={() => router.push("/organization-settings")}
          >
            <Ionicons
              name="settings-outline"
              size={30}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Add Task Icon */}
          <TouchableOpacity onPress={() => setAddTaskVisible(true)}>
            <Ionicons
              name="add-circle"
              size={36}
              color="#FF9800"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* <ChartStats
        open={openCount}
        closed={closedCount}
        returned={returnCount}
        total={total}
        percent={percent}
        chartData={chartData}
        tab="year"
        onTab={(tab) => {
          // Handle tab switch (year/month) and update chartData accordingly
        }}
      /> */}

      {/* Task Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginVertical: 14,
          backgroundColor: "#fff",
          borderRadius: 8,
          padding: 4,
          elevation: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => setOrgTab("pending")}
          style={[styles.tab, orgTab === "pending" && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              orgTab === "pending" && styles.tabTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrgTab("completed")}
          style={[styles.tab, orgTab === "completed" && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              orgTab === "completed" && styles.tabTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrgTab("statistics")}
          style={[styles.tab, orgTab === "statistics" && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              orgTab === "statistics" && styles.tabTextActive,
            ]}
          >
            Statistics
          </Text>
        </TouchableOpacity>
      </View>
      {orgTab === "pending" && (
        <>
          <Text style={styles.tasksTitle}>Pending Tasks</Text>
          <FlatList
            data={tasks.filter((t) => !t.completed)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDescription}>{item.description}</Text>
                  <Text style={styles.taskDetails}>
                    <Text style={styles.bold}>
                      📍 {item.locationLabel || "No location selected"}
                    </Text>
                    {"\n"}
                    <Text style={styles.bold}>
                      ⏰{" "}
                      {item.time
                        ? new Date(item.time).toLocaleString()
                        : "No time set"}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.taskButton,
                    item.signedUp && styles.taskButtonCompleted,
                  ]}
                  onPress={() => handleSignUp(item._id)}
                >
                  <Text style={styles.taskButtonText}>
                    {item.signedUp ? "Completed" : "Pending"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: "#888",
                  marginTop: 20,
                }}
              >
                No pending tasks.
              </Text>
            }
          />
        </>
      )}

      {orgTab === "completed" && (
        <>
          <Text style={styles.tasksTitle}>Completed Tasks</Text>
          <FlatList
            data={tasks.filter((t) => t.completed)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDescription}>{item.description}</Text>
                  <Text style={styles.taskDetails}>
                    <Text style={styles.bold}>
                      📍 {item.locationLabel || "No location selected"}
                    </Text>
                    {"\n"}
                    <Text style={styles.bold}>
                      ⏰{" "}
                      {item.time
                        ? new Date(item.time).toLocaleString()
                        : "No time set"}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.taskButton,
                    item.signedUp && styles.taskButtonCompleted,
                  ]}
                  onPress={() => handleSignUp(item._id)}
                >
                  <Text style={styles.taskButtonText}>
                    {item.signedUp ? "Completed" : "Pending"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: "#888",
                  marginTop: 20,
                }}
              >
                No completed tasks.
              </Text>
            }
          />
        </>
      )}

      {orgTab === "statistics" && (
        <ChartStats
          open={openCount}
          closed={closedCount}
          total={total}
          percent={percent}
          chartData={tab === "year" ? yearChartData : monthChartData}
          chartLabels={tab === "year" ? yearChartLabels : monthChartLabels}
          tab={tab}
          onTab={(tab) => setTab(tab as "year" | "month")}
        />
      )}

      {/* Add Task Modal */}
      <Modal
        visible={addTaskVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddTaskVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newTask.title}
              onChangeText={(text) =>
                setNewTask((t) => ({ ...t, title: text }))
              }
            />
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Description"
              value={newTask.description}
              multiline
              onChangeText={(text) =>
                setNewTask((t) => ({ ...t, description: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Location Name or Address"
              value={newTask.locationLabel}
              onChangeText={(text) =>
                setNewTask((t) => ({ ...t, locationLabel: text }))
              }
              autoCapitalize="words"
            />
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
              Pick Location on Map:
            </Text>
            <MapPicker
              onLocationSelected={(loc: any) =>
                setNewTask((t) => ({ ...t, location: loc }))
              }
              marker={
                newTask.location
                  ? {
                      latitude: newTask.location.coordinates[1],
                      longitude: newTask.location.coordinates[0],
                    }
                  : null
              }
            />
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (details && details.geometry && details.geometry.location) {
                  const { lat, lng } = details.geometry.location;
                  setNewTask((t) => ({
                    ...t,
                    locationLabel: data.description,
                    location: { type: "Point", coordinates: [lng, lat] },
                  }));
                  // Optionally, you can also update the map region/marker here
                }
              }}
              query={{
                key: process.env.EXPO_PUBLIC_LOCATION_API_KEY, // Use the key from your .env file
                language: "en",
              }}
              styles={{
                textInput: styles.input,
                container: { flex: 0, marginBottom: 10 },
              }}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>
                {newTask.time
                  ? new Date(newTask.time).toLocaleString()
                  : "Select Date & Time"}
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="datetime"
              onConfirm={(date) => {
                setShowDatePicker(false);
                setNewTask((t) => ({
                  ...t,
                  time: date.toISOString(),
                }));
              }}
              onCancel={() => setShowDatePicker(false)}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF9800" }]}
                onPress={handleCreateTask}
                disabled={creating}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {creating ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setAddTaskVisible(false)}
              >
                <Text style={{ color: "#222" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Organization;

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
    width: 45,
    height: 45,
    borderRadius: 40,
    borderColor: "#fff",
    borderWidth: 2,
    marginTop: 25,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
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
    backgroundColor: "#4CAF50",
    borderRadius: 9,
    padding: 4,
  },
  taskButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statisticsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statisticsItem: {
    alignItems: "center",
    flex: 1,
  },
  statisticsLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statisticsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statisticsIcon: {
    width: 80,
    height: 80,
  },
  lottieIcon: {
    width: 50,
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: "90%",
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#FF9800",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  createTaskButton: {
    backgroundColor: "#FF9800",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  createTaskButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FF9800",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
