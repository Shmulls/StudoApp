import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { createTask, deleteTask, fetchTasks, updateTask } from "../../../api";
import AddTaskModal from "../../../components/AddTaskModal";
import OrgStatistics from "../../../components/OrgStatistics";
import { Task } from "../../../types/task";

// const LOCATION_API_KEY = "AIzaSyAjyYxXChjy1vRsJqanVMJxjieY1cOCHLA";

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
  const [tab, setTab] = useState<"day" | "week" | "month" | "year">("year");
  const closedTasksRef = useRef<LottieView>(null);
  const openTasksRef = useRef<LottieView>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    image: string;
  } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverTaskId, setPopoverTaskId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [refreshing, setRefreshing] = useState(false);

  const POPUP_WIDTH = 200;
  const screenWidth = Dimensions.get("window").width;
  const popoverLeft = Math.min(
    Math.max(popoverPosition.x - POPUP_WIDTH / 2, 8),
    screenWidth - POPUP_WIDTH - 8
  );

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

  useEffect(() => {
    // Animate pulse when a user is newly assigned
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleDeleteTask = async (taskId: string | null) => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setPopoverVisible(false);
    } catch (error) {
      alert("Failed to delete task.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
    setRefreshing(false);
  };

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          {/* Notification Icon */}
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Settings Icon */}
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="#333"
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Add Task Icon */}
          <TouchableOpacity onPress={() => setAddTaskVisible(true)}>
            <Ionicons
              name="add-circle"
              size={36}
              color="#525252"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Welcome Section */}
      <Text style={styles.welcomeText}>
        Welcome Back, <Text style={styles.bold}>{user?.firstName}</Text>!{" "}
        <Text style={{ color: "#FF9800" }}>🧡</Text>
      </Text>
      {/* Milestone Progress Bar */}
      <View style={styles.tabRow}>
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
            {/* Change or remove "Pending" below as you wish */}
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
              <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => setActiveTaskId(item._id)}
                onPressOut={() => setActiveTaskId(null)}
                style={[
                  styles.taskCard,
                  activeTaskId === item._id && styles.taskCardActive,
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.dot} />
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.taskTime}>
                    {item.time
                      ? new Date(item.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No time set"}
                  </Text>
                </View>
                <Text style={styles.taskDescription}>{item.description}</Text>
                <View style={styles.cardFooterRow}>
                  <View style={styles.locationRowWrapper}>
                    <Ionicons name="location-outline" size={16} color="#333" />
                    <Text
                      style={styles.locationText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.locationLabel || "No location selected"}
                    </Text>
                  </View>
                  <View style={styles.avatarRowBottom}>
                    {item.assignedUserImage && (
                      <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={() => {
                          setSelectedUser({
                            name: item.assignedUserName ?? "",
                            image: item.assignedUserImage ?? "",
                          });
                          setUserModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: item.assignedUserImage }}
                          style={styles.avatar}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={() => handleDeleteTask(item._id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
            refreshing={refreshing}
            onRefresh={onRefresh}
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
        <OrgStatistics
          open={openCount}
          closed={closedCount}
          percent={Math.round(
            (closedCount / (openCount + closedCount || 1)) * 100
          )}
          chartData={getChartData(tab, tasks, user)} // see below
          chartLabels={getChartLabels(tab)}
          tab={tab}
          onTab={setTab}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        visible={addTaskVisible}
        creating={creating}
        newTask={newTask}
        setNewTask={setNewTask}
        onClose={() => setAddTaskVisible(false)}
        onCreate={handleCreateTask}
        styles={styles}
      />

      {/* User Detail Modal */}
      <Modal
        visible={userModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              minWidth: 220,
            }}
          >
            {selectedUser && (
              <>
                <Image
                  source={{ uri: selectedUser.image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginBottom: 12,
                  }}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 8,
                  }}
                >
                  {selectedUser.name}
                </Text>
                {/* Add more user info here if available */}
              </>
            )}
            <TouchableOpacity
              style={{
                marginTop: 16,
                backgroundColor: "#FF9800",
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 24,
              }}
              onPress={() => setUserModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: "#F9CE60",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginTop: 45,
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
    // borderWidth: 1,
    // borderColor: "#525252", // Add black border
    padding: 18,
    marginBottom: 18,
    // backgroundColor: "#F9CE60",
    minHeight: 120,
    borderRadius: 16,
    // Shadow for iOS
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.18,
    // shadowRadius: 8,
    // Shadow for Android
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    // borderColor: "#000",
    // borderRadius: 15,
    // padding: 15,
    // marginBottom: 15,
    // shadowColor: "#fff",
    // shadowOpacity: 2,
    // shadowRadius: 5,
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
  },
  taskCardActive: {
    borderColor: "#000",
    borderWidth: 2,
  },
  taskInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  taskRightColumn: {
    width: 80,
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexDirection: "column",
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    flexShrink: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: "#444",
    marginVertical: 6,
    marginLeft: 20,
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
    backgroundColor: "#525252",
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
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#525252", // Changed from #FF9800 to match home feed
  },
  tabText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#fff", // Changed from #fff to match home feed
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 10,
    color: "#222",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    elevation: 1,
  },
  pendingBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  pendingBadgeText: {
    fontSize: 12,
    color: "#856404",
    marginLeft: 4,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#525252",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    elevation: 1,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTouchable: {
    alignSelf: "flex-end",
    marginTop: "auto", // Push to bottom
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  avatarRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: 8,
  },
  avatarName: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  groupLabel: {
    color: "#B39DDB",
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#525252",
    marginRight: 8,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationRowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0, // allows text truncation
    marginRight: 8,
  },
  locationText: {
    fontSize: 13,
    color: "#222",
    marginLeft: 4,
    flex: 1,
    minWidth: 0,
  },
  taskTime: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginLeft: 10,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

function getChartLabels(tab: "day" | "week" | "month" | "year") {
  const now = new Date();
  if (tab === "year") {
    const year = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => (year - 4 + i).toString());
  }
  return [];
}

function getChartData(
  tab: "day" | "week" | "month" | "year",
  tasks: Task[],
  user: any
) {
  const now = new Date();
  if (tab === "year") {
    const arr = Array(5).fill(0);
    const year = now.getFullYear();
    tasks.forEach((task) => {
      const d = new Date(task.time);
      if (task.createdBy === user.id) {
        const idx = d.getFullYear() - (year - 4);
        if (idx >= 0 && idx < 5) arr[idx]++;
      }
    });
    return arr;
  }
  return [];
}
