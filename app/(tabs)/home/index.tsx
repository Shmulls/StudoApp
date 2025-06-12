import CompletedTaskCard from "@/components/CompletedTaskCard";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MilestoneProgressBar from "../../../components/MilestoneProgressBar";
import TaskCard from "../../../components/TaskCard";
import { useTasks } from "../../../hooks/useTasks";

const HomeScreen = () => {
  const { user } = useUser();
  const [tab, setTab] = useState<"new" | "assigned" | "complete">("new");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"newest" | "oldest" | "location">(
    "newest"
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false); // Add this line

  const {
    tasks,
    visibleTasks,
    loading,
    handleSignUp,
    handleComplete,
    fetchTasks,
    setTasks, // Add setTasks to update local task state
  } = useTasks(user);

  // Progress bar data - now using points instead of task count
  const userPoints = tasks.filter((t) => t.completed).length; // Each completed task = 1 point
  const maxPoints = 120; // Goal

  // Task filters for tabs
  const newTasks = visibleTasks.filter((t) => !t.signedUp);
  const assignedTasks = visibleTasks.filter((t) => t.signedUp);
  const completedTasks = tasks.filter((t) => t.completed);

  // Build period marking for tasks
  const markedDates = tasks.reduce((acc, task) => {
    if (task.time) {
      const dateObj = new Date(task.time);
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split("T")[0];
        acc[dateStr] = {
          startingDay: true,
          endingDay: true,
          color: task.completed ? "#FFB17A" : "#FAD961",
          textColor: "#222",
        };
      }
    }
    return acc;
  }, {} as Record<string, any>);

  // Refetch tasks when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const getTabData = () => {
    let data: typeof tasks = [];
    switch (tab) {
      case "new":
        data = newTasks;
        break;
      case "assigned":
        data = assignedTasks;
        break;
      case "complete":
        data = completedTasks;
        break;
      default:
        data = [];
    }

    // Apply filter
    if (filter === "newest") {
      return [...data].sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }
    if (filter === "oldest") {
      return [...data].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );
    }
    if (filter === "location") {
      // Sort alphabetically by location (string or object with address)
      return [...data].sort((a, b) => {
        const getLocationString = (loc: any) => {
          if (loc && typeof loc === "object") {
            if ("address" in loc && typeof loc.address === "string") {
              return loc.address;
            }
            // If it's a Point object, convert coordinates to string
            if (loc.type === "Point" && Array.isArray(loc.coordinates)) {
              return loc.coordinates.join(",");
            }
          }
          return String(loc || "");
        };
        return getLocationString(a.location).localeCompare(
          getLocationString(b.location)
        );
      });
    }
    return data;
  };

  const getEmptyMessage = () => {
    switch (tab) {
      case "new":
        return "No new tasks available.";
      case "assigned":
        return "No assigned tasks.";
      case "complete":
        return "No completed tasks.";
      default:
        return "No tasks available.";
    }
  };

  const getEmptyIcon = () => {
    switch (tab) {
      case "new":
        return "add-circle-outline";
      case "assigned":
        return "person-outline";
      case "complete":
        return "checkmark-done-outline";
      default:
        return "list-outline";
    }
  };

  // Make sure your handlers are safe:
  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log("🏠 Home: Handling task completion for:", taskId);

      // Remove task from local state
      setTasks((prevTasks) => {
        const filtered = prevTasks.filter((task) => task._id !== taskId);
        console.log("📊 Tasks remaining:", filtered.length);
        return filtered;
      });

      // Refresh after a short delay
      setTimeout(() => {
        console.log("🔄 Home: Refreshing task data...");
        fetchTasks().catch((error) => {
          console.error("⚠️ Home: Error refreshing tasks:", error);
        });
      }, 1000);
    } catch (error) {
      console.error("💥 Home: Error in handleCompleteTask:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9800" />
        </View>
      )}

      {/* Modern Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push("/profile")}>
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
            onPress={() => router.push("/notification")}
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
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressCard}>
          <MilestoneProgressBar points={userPoints} maxPoints={maxPoints} />
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{maxPoints - userPoints}</Text>
              <Text style={styles.statLabel}>To Goal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round((userPoints / maxPoints) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modern Tab Navigation */}
      <View style={styles.modernTabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setTab("new")}
            style={[styles.tab, tab === "new" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={tab === "new" ? "#fff" : "#666"}
              />
              <Text
                style={[styles.tabText, tab === "new" && styles.tabTextActive]}
              >
                New
              </Text>
              {newTasks.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{newTasks.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("assigned")}
            style={[styles.tab, tab === "assigned" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="person-outline"
                size={18}
                color={tab === "assigned" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === "assigned" && styles.tabTextActive,
                ]}
              >
                Assigned
              </Text>
              {assignedTasks.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {assignedTasks.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("complete")}
            style={[styles.tab, tab === "complete" && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color={tab === "complete" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === "complete" && styles.tabTextActive,
                ]}
              >
                Complete
              </Text>
              {completedTasks.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {completedTasks.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.tasksSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {tab === "new"
              ? "New Tasks"
              : tab === "assigned"
              ? "Your Tasks"
              : "Completed Tasks"}
          </Text>

          {/* Modern Filter Dropdown */}
          <TouchableOpacity
            style={styles.filterContainer}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Ionicons
              name={
                filter === "newest"
                  ? "time-outline"
                  : filter === "oldest"
                  ? "hourglass-outline"
                  : "location-outline"
              }
              size={16}
              color="#666"
            />
            <Text style={styles.filterText}>
              {filter === "newest"
                ? "Newest"
                : filter === "oldest"
                ? "Oldest"
                : "Location"}
            </Text>
            <Ionicons
              name={showFilterMenu ? "chevron-up" : "chevron-down"}
              size={16}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Filter Menu Dropdown */}
        {showFilterMenu && (
          <View style={styles.filterMenu}>
            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === "newest" && styles.filterMenuItemActive,
              ]}
              onPress={() => {
                setFilter("newest");
                setShowFilterMenu(false);
              }}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={filter === "newest" ? "#FF9800" : "#666"}
              />
              <Text
                style={[
                  styles.filterMenuText,
                  filter === "newest" && styles.filterMenuTextActive,
                ]}
              >
                Newest First
              </Text>
              {filter === "newest" && (
                <Ionicons name="checkmark" size={18} color="#FF9800" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === "oldest" && styles.filterMenuItemActive,
              ]}
              onPress={() => {
                setFilter("oldest");
                setShowFilterMenu(false);
              }}
            >
              <Ionicons
                name="hourglass-outline"
                size={18}
                color={filter === "oldest" ? "#FF9800" : "#666"}
              />
              <Text
                style={[
                  styles.filterMenuText,
                  filter === "oldest" && styles.filterMenuTextActive,
                ]}
              >
                Oldest First
              </Text>
              {filter === "oldest" && (
                <Ionicons name="checkmark" size={18} color="#FF9800" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === "location" && styles.filterMenuItemActive,
              ]}
              onPress={() => {
                setFilter("location");
                setShowFilterMenu(false);
              }}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={filter === "location" ? "#FF9800" : "#666"}
              />
              <Text
                style={[
                  styles.filterMenuText,
                  filter === "location" && styles.filterMenuTextActive,
                ]}
              >
                By Location
              </Text>
              {filter === "location" && (
                <Ionicons name="checkmark" size={18} color="#FF9800" />
              )}
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={getTabData()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            tab === "complete" ? (
              <CompletedTaskCard task={item} />
            ) : (
              <TaskCard
                task={item}
                onSignUp={handleSignUp}
                onComplete={handleCompleteTask} // Use the new direct completion handler
                onTaskUpdate={fetchTasks} // Add this to refresh the list
              />
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name={getEmptyIcon() as any} size={64} color="#ddd" />
              <Text style={styles.emptyStateTitle}>
                {tab === "new"
                  ? "No New Tasks"
                  : tab === "assigned"
                  ? "No Assigned Tasks"
                  : "No Completed Tasks"}
              </Text>
              <Text style={styles.emptyStateSubtitle}>{getEmptyMessage()}</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            Selected date: {selectedDate}
          </Text>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;

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
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20, // Add bottom padding to prevent overlap
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 8, // Add margin to separate from tabs
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9800",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  modernTabContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8, // Reduce top padding to prevent overlap
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
    marginHorizontal: 2,
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
    minHeight: 24,
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabBadge: {
    position: "absolute",
    top: -12,
    right: -6,
    backgroundColor: "#ff4757",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 10,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12, // Reduce top padding
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minWidth: 100,
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginHorizontal: 6,
  },
  filterMenu: {
    position: "absolute",
    top: 60,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 1000,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  filterMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  filterMenuItemActive: {
    backgroundColor: "#FFF3E0",
  },
  filterMenuText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    marginLeft: 12,
  },
  filterMenuTextActive: {
    color: "#FF9800",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  selectedDateContainer: {
    backgroundColor: "#fff",
    padding: 12,
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
