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
      {/* Modern Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push("/organization-profile")}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: user?.imageUrl }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome Back 👋</Text>
            <Text style={styles.userName}>{user?.firstName}!</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/organization-notification")}
          >
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddTaskVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Tab Navigation */}
      <View style={styles.modernTabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setOrgTab("pending")}
            style={[styles.tab, orgTab === "pending" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="time-outline"
                size={18}
                color={orgTab === "pending" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  orgTab === "pending" && styles.tabTextActive,
                ]}
              >
                Pending
              </Text>
              {tasks.filter((t) => !t.completed).length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {tasks.filter((t) => !t.completed).length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOrgTab("completed")}
            style={[styles.tab, orgTab === "completed" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={orgTab === "completed" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  orgTab === "completed" && styles.tabTextActive,
                ]}
              >
                Completed
              </Text>
              {tasks.filter((t) => t.completed).length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {tasks.filter((t) => t.completed).length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOrgTab("statistics")}
            style={[styles.tab, orgTab === "statistics" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="analytics-outline"
                size={18}
                color={orgTab === "statistics" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  orgTab === "statistics" && styles.tabTextActive,
                ]}
              >
                Statistics
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {orgTab === "pending" && (
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
            <Text style={styles.sectionSubtitle}>
              {tasks.filter((t) => !t.completed).length} active tasks
            </Text>
          </View>
          <FlatList
            data={tasks.filter((t) => !t.completed)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => setActiveTaskId(item._id)}
                onPressOut={() => setActiveTaskId(null)}
                style={[
                  styles.modernTaskCard,
                  activeTaskId === item._id && styles.taskCardActive,
                ]}
              >
                <View style={styles.taskCardHeader}>
                  <View style={styles.taskPriority} />
                  <View style={styles.taskMainContent}>
                    <Text style={styles.modernTaskTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.taskTimeContainer}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.modernTaskTime}>
                        {item.time
                          ? new Date(item.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "No time set"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTask(item._id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ff4757"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.modernTaskDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.taskCardFooter}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.modernLocationText} numberOfLines={1}>
                      {item.locationLabel || "No location selected"}
                    </Text>
                  </View>
                  <View style={styles.assigneeContainer}>
                    {item.assignedUserImage ? (
                      <TouchableOpacity
                        style={styles.modernAvatarWrapper}
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
                          style={styles.modernAvatar}
                        />
                        <View style={styles.avatarBadge} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.unassignedIndicator}>
                        <Ionicons
                          name="person-add-outline"
                          size={16}
                          color="#999"
                        />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={64}
                  color="#ddd"
                />
                <Text style={styles.emptyStateTitle}>All caught up!</Text>
                <Text style={styles.emptyStateSubtitle}>
                  No pending tasks at the moment.
                </Text>
              </View>
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}

      {orgTab === "completed" && (
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            <Text style={styles.sectionSubtitle}>
              {tasks.filter((t) => t.completed).length} completed
            </Text>
          </View>
          <FlatList
            data={tasks.filter((t) => t.completed)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.completedTaskCard}>
                <View style={styles.completedHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <View style={styles.completedContent}>
                    <Text style={styles.completedTaskTitle}>{item.title}</Text>
                    <Text
                      style={styles.completedTaskDescription}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Text style={styles.completedTime}>
                    {item.time
                      ? new Date(item.time).toLocaleDateString()
                      : "No date"}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color="#ddd" />
                <Text style={styles.emptyStateTitle}>
                  No completed tasks yet
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Complete some tasks to see them here.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}

      {orgTab === "statistics" && (
        <OrgStatistics
          open={openCount}
          closed={closedCount}
          percent={Math.round(
            (closedCount / (openCount + closedCount || 1)) * 100
          )}
          chartData={getChartData(tab, tasks, user)}
          chartLabels={getChartLabels(tab)}
          tab={tab}
          onTab={setTab}
          averageCompletionTime={
            closedCount > 0
              ? tasks
                  .filter((task) => task.completed)
                  .reduce((acc, task) => {
                    const taskDate = new Date(task.time);
                    const now = new Date();
                    const diffInHours =
                      Math.abs(now.getTime() - taskDate.getTime()) / 3600000;
                    return acc + (diffInHours > 0 ? diffInHours : 24);
                  }, 0) / closedCount
              : 0
          }
          overdueTasks={
            tasks.filter(
              (task) => !task.completed && new Date(task.time) < new Date()
            ).length
          }
        />
      )}

      {/* Modern User Detail Modal */}
      <Modal
        visible={userModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modernModalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatarContainer}>
                    <Image
                      source={{ uri: selectedUser.image }}
                      style={styles.modalAvatar}
                    />
                    <View style={styles.modalAvatarBadge} />
                  </View>
                  <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                  <Text style={styles.modalUserRole}>Task Assignee</Text>
                </View>
                <TouchableOpacity
                  style={styles.modernCloseButton}
                  onPress={() => setUserModalVisible(false)}
                >
                  <Text style={styles.modernCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Task Modal remains the same */}
      <AddTaskModal
        visible={addTaskVisible}
        creating={creating}
        newTask={newTask}
        setNewTask={setNewTask}
        onClose={() => setAddTaskVisible(false)}
        onCreate={handleCreateTask}
      />
    </View>
  );
};

export default Organization;

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
    flex: 1,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4757",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modernTabContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2, // Add small margin between tabs
  },
  tabActive: {
    backgroundColor: "#FF9800",
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 24, // Ensure minimum height
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 13, // Slightly smaller font
    marginLeft: 4, // Reduce margin
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabBadge: {
    position: "absolute",
    top: -12, // Move higher up
    right: -6, // Adjust right position
    backgroundColor: "#ff4757",
    borderRadius: 10,
    minWidth: 18, // Slightly smaller
    height: 18, // Slightly smaller
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4, // Reduce padding
    zIndex: 10, // Ensure it's above other elements
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 10, // Smaller font
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modernTaskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  taskCardActive: {
    borderLeftColor: "#ff4757",
    transform: [{ scale: 0.98 }],
  },
  taskCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9800",
    marginRight: 12,
    marginTop: 6,
  },
  taskMainContent: {
    flex: 1,
  },
  modernTaskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  taskTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modernTaskTime: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  taskActions: {
    alignItems: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  modernTaskDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 16,
  },
  taskCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  modernLocationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  assigneeContainer: {
    alignItems: "center",
  },
  modernAvatarWrapper: {
    position: "relative",
  },
  modernAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  unassignedIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  completedTaskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  completedHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedContent: {
    flex: 1,
    marginLeft: 12,
  },
  completedTaskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    textDecorationLine: "line-through",
    textDecorationColor: "#999",
  },
  completedTaskDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  completedTime: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  flatListContent: {
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modernModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    minWidth: 280,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalAvatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
  },
  modalAvatarBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  modalUserRole: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  modernCloseButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  modernCloseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

function getChartLabels(tab: "day" | "week" | "month" | "year") {
  const now = new Date();
  if (tab === "year") {
    return ["2021", "2022", "2023", "2024", "2025"];
  } else if (tab === "month") {
    const monthNames = [
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
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
      return monthNames[monthIndex];
    });
  } else if (tab === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - 6 + i);
      return date.getDate().toString();
    });
  } else if (tab === "day") {
    return ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
  }
  return ["No Data"];
}

function getChartData(
  tab: "day" | "week" | "month" | "year",
  tasks: Task[],
  user: any
) {
  const now = new Date();

  if (tab === "year") {
    // Only show real task growth based on actual tasks
    const arr = Array(5).fill(0);
    const year = now.getFullYear();
    tasks.forEach((task) => {
      const taskDate = new Date(task.time);
      const taskYear = taskDate.getFullYear();
      const idx = taskYear - (year - 4);
      if (idx >= 0 && idx < 5) {
        arr[idx]++;
      }
    });
    return arr;
  } else if (tab === "month") {
    // Show real tasks over last 6 months
    const arr = Array(6).fill(0);
    tasks.forEach((task) => {
      const taskDate = new Date(task.time);
      const monthsDiff =
        (now.getFullYear() - taskDate.getFullYear()) * 12 +
        (now.getMonth() - taskDate.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 6) {
        arr[5 - monthsDiff]++;
      }
    });
    return arr; // Return real data only
  } else if (tab === "week") {
    // Show real daily task activity for the current week
    const arr = Array(7).fill(0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);

    tasks.forEach((task) => {
      const taskDate = new Date(task.time);
      const daysDiff = Math.floor(
        (taskDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff >= 0 && daysDiff < 7) {
        arr[daysDiff]++;
      }
    });
    return arr; // Return real data only, no fake random data
  } else if (tab === "day") {
    // Show real task activity throughout the day
    const arr = Array(6).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      const taskDate = new Date(task.time);
      if (taskDate.toDateString() === today.toDateString()) {
        const period = Math.floor(taskDate.getHours() / 4);
        if (period >= 0 && period < 6) arr[period]++;
      }
    });
    return arr; // Return real data only
  }
  return [0]; // Return zero data instead of fake data
}
