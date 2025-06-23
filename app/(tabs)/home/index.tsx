import CompletedTaskCard from "@/components/CompletedTaskCard";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking, // ✅ Add this import
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [tab, setTab] = useState<"new" | "assigned" | "complete">("new");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"newest" | "oldest" | "location">(
    "newest"
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // Add user location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userTotalPoints, setUserTotalPoints] = useState(0); // Add this state for total points
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // Add avatar URL state
  const [completedTasksData, setCompletedTasks] = useState<any[]>([]); // Add completed tasks state

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
  const completedTasks = completedTasksData; // Use the dedicated completed tasks array

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Add Google Geolocation API configuration at the top
  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_LOCATION_API_KEY; // Use environment variable

  // Replace the existing requestLocationPermission function
  const requestLocationPermission = async () => {
    try {
      console.log("📍 Getting location using Google Geolocation API...");

      // Use Google Geolocation API instead of Expo Location
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_PLACES_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Empty body uses cell towers, WiFi, and IP for location
        }
      );

      const data = await response.json();

      if (data.location) {
        const userCoords = {
          latitude: data.location.lat,
          longitude: data.location.lng,
        };

        setUserLocation(userCoords);
        setLocationEnabled(true);

        // Store location in AsyncStorage for future use
        await AsyncStorage.setItem("userLocation", JSON.stringify(userCoords));
        await AsyncStorage.setItem("locationEnabled", "true");

        console.log("📍 Location obtained via Google API:", userCoords);
        console.log("📍 Accuracy:", data.accuracy, "meters");

        return true;
      } else {
        console.log("⚠️ Could not get location from Google API");
        return false;
      }
    } catch (error) {
      console.error("❌ Error getting location via Google API:", error);

      // Fallback to Expo Location if Google API fails
      try {
        console.log("📍 Falling back to Expo Location...");
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("⚠️ Location permission denied");
          return false;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
        setLocationEnabled(true);

        await AsyncStorage.setItem("userLocation", JSON.stringify(userCoords));
        await AsyncStorage.setItem("locationEnabled", "true");

        console.log("📍 Location obtained via Expo Location:", userCoords);
        return true;
      } catch (fallbackError) {
        console.error("❌ Fallback location error:", fallbackError);
        return false;
      }
    }
  };

  // Update the existing getUserLocation function
  const getUserLocation = async () => {
    return await checkAndGetLocation();
  };

  // Check location settings and get location if enabled
  const checkAndGetLocation = async () => {
    try {
      // First, try to get stored location
      const storedLocation = await AsyncStorage.getItem("userLocation");
      const locationSetting = await AsyncStorage.getItem("locationEnabled");

      if (storedLocation && locationSetting === "true") {
        const coords = JSON.parse(storedLocation);
        setUserLocation(coords);
        setLocationEnabled(true);
        console.log("📍 Using stored location:", coords);
        return coords;
      } else {
        console.log("⚠️ No valid stored location found");
      }

      // If no stored location, clear state
      setUserLocation(null);
      setLocationEnabled(false);
      return null;
    } catch (error) {
      console.error("Error checking stored location:", error);
      setUserLocation(null);
      setLocationEnabled(false);
      return null;
    }
  };

  // Add effect to check location settings when component mounts
  // ❌ DELETE this effect (Lines 191-193):
  /*
  useEffect(() => {
    checkAndGetLocation();
  }, []);
  */

  // Load user avatar from AsyncStorage
  // ❌ DELETE this effect (Lines 195-214):
  /*
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        // First try to get avatar from AsyncStorage
        const storedAvatarUrl = await AsyncStorage.getItem("userAvatarUrl");
        if (storedAvatarUrl) {
          setAvatarUrl(storedAvatarUrl);
          console.log("👤 Loaded avatar from storage:", storedAvatarUrl);
          return;
        }

        // Then try to get it from user metadata
        const metadataAvatar = user?.unsafeMetadata?.avatarUrl as string;
        if (metadataAvatar) {
          setAvatarUrl(metadataAvatar);
          console.log("👤 Loaded avatar from metadata:", metadataAvatar);
        }
      } catch (error) {
        console.log("Could not load avatar:", error);
      }
    };

    if (user) {
      loadUserAvatar();
    }
  }, [user]);
  */

  // Haversine formula to calculate distance between two lat/lng points in meters
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Add this helper function at the top of your component, after the imports
  const getCreationTimeFromObjectId = (objectId: string): number => {
    try {
      // First 4 bytes of ObjectId represent creation timestamp
      return parseInt(objectId.substring(0, 8), 16) * 1000;
    } catch {
      return 0;
    }
  };

  // Task sorting and filtering logic
  const getTabData = () => {
    let data: typeof tasks = [];
    switch (tab) {
      case "new":
        // ✅ FIX: Show only tasks user hasn't signed up for AND aren't completed
        data = tasks.filter((t) => !t.signedUp && !t.completed);
        console.log("📋 New tasks (not signed up):", data.length);
        break;
      case "assigned":
        // ✅ FIX: Show only tasks user HAS signed up for AND aren't completed
        data = tasks.filter((t) => t.signedUp && !t.completed);
        console.log("📋 Assigned tasks (signed up):", data.length);
        break;
      case "complete":
        // ✅ Show completed tasks from the dedicated completed tasks array
        data = completedTasks;
        console.log("📋 Completed tasks:", data.length);
        break;
      default:
        data = [];
    }

    // Apply filter with FIXED sorting logic
    if (filter === "newest") {
      return [...data].sort((a, b) => {
        // Sort by creation time from ObjectId (newest first)
        const timeA = getCreationTimeFromObjectId(a._id);
        const timeB = getCreationTimeFromObjectId(b._id);
        return timeB - timeA; // Newest created tasks first
      });
    }

    if (filter === "oldest") {
      return [...data].sort((a, b) => {
        // Sort by creation time from ObjectId (oldest first)
        const timeA = getCreationTimeFromObjectId(a._id);
        const timeB = getCreationTimeFromObjectId(b._id);
        return timeA - timeB; // Oldest created tasks first
      });
    }

    if (filter === "location") {
      // Check if location services are enabled and user location is available
      if (!locationEnabled || !userLocation) {
        console.log("⚠️ Location disabled or unavailable, showing all tasks");
        // If location is disabled, show all tasks unsorted
        return [...data];
      }

      console.log("📍 Sorting by location. User location:", userLocation);

      // Sort by distance (closest first)
      return [...data].sort((a, b) => {
        // Get task coordinates - fix the coordinate extraction
        const getTaskCoordinates = (task: any) => {
          // Check if task has location with coordinates
          if (task.location) {
            // Handle GeoJSON Point format
            if (
              task.location.type === "Point" &&
              Array.isArray(task.location.coordinates) &&
              task.location.coordinates.length >= 2
            ) {
              return {
                longitude: parseFloat(task.location.coordinates[0]),
                latitude: parseFloat(task.location.coordinates[1]),
              };
            }

            // Handle direct lat/lng properties
            if (task.location.latitude && task.location.longitude) {
              return {
                longitude: parseFloat(task.location.longitude),
                latitude: parseFloat(task.location.latitude),
              };
            }

            // Handle lat/lng properties
            if (task.location.lat && task.location.lng) {
              return {
                longitude: parseFloat(task.location.lng),
                latitude: parseFloat(task.location.lat),
              };
            }
          }

          console.log(
            "⚠️ Task has no valid coordinates:",
            task._id,
            task.location
          );
          return null;
        };

        const aCoords = getTaskCoordinates(a);
        const bCoords = getTaskCoordinates(b);

        // If either task doesn't have coordinates, put it at the end
        if (!aCoords && !bCoords) return 0;
        if (!aCoords) {
          console.log("⚠️ Task A has no coordinates:", a._id);
          return 1; // Push to end
        }
        if (!bCoords) {
          console.log("⚠️ Task B has no coordinates:", b._id);
          return -1; // Keep A before B
        }

        // Calculate distances using Haversine formula
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          aCoords.latitude,
          aCoords.longitude
        );

        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          bCoords.latitude,
          bCoords.longitude
        );

        console.log(
          `📏 Task ${a._id}: ${(distanceA / 1000).toFixed(2)}km away`
        );
        console.log(
          `📏 Task ${b._id}: ${(distanceB / 1000).toFixed(2)}km away`
        );

        return distanceA - distanceB; // Sort by distance (ascending - closest first)
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

  // Update your handleComplete function to properly update points
  const handleTaskComplete = async (
    taskId: string,
    feedback: string,
    pointsEarned: number
  ) => {
    try {
      console.log("🎯 Completing task:", taskId);
      console.log("🎯 Feedback:", feedback);
      console.log("🎯 Points earned:", pointsEarned);

      // ✅ Call handleComplete with correct parameters
      const result = await handleComplete(taskId, feedback, pointsEarned);

      if (result) {
        // ✅ Only refresh completed tasks - let the useEffect handle point calculation
        await fetchCompletedTasks();

        console.log("✅ Task completion handled successfully");
      }
    } catch (error) {
      console.error("❌ Error handling task completion:", error);
    }
  };

  // Add a function to fetch completed tasks:
  const fetchCompletedTasks = async () => {
    if (!user?.id) return;

    try {
      console.log("🔄 Fetching completed tasks for user:", user.id);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tasks/completed/${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Completed tasks fetched:", data.length);

        setCompletedTasks(data);

        // ✅ Cache successful data
        await AsyncStorage.setItem(
          `completedTasks_${user.id}`,
          JSON.stringify(data)
        );
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching completed tasks:", error);

      // ✅ Load cached data on failure
      try {
        const cached = await AsyncStorage.getItem(`completedTasks_${user.id}`);
        if (cached && completedTasksData.length === 0) {
          setCompletedTasks(JSON.parse(cached));
          console.log("📱 Loaded cached completed tasks");
        }
      } catch (cacheError) {
        console.log("No cached completed tasks available");
      }
    }
  };

  // Add this test component inside your HomeScreen component
  const TestAvatarUpload = () => {
    const [uploading, setUploading] = useState(false);

    // Cloudinary config (same as signup)
    const CLOUDINARY_CLOUD_NAME = "dwmb1pxju";
    const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";

    const uploadToCloudinary = async (imageUri: string) => {
      try {
        console.log("☁️ Testing Cloudinary upload...");

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: "avatar.jpg",
        } as any);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "avatars");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Test Cloudinary upload successful:", data.secure_url);
          return data.secure_url;
        } else {
          throw new Error(data.error?.message || "Upload failed");
        }
      } catch (error) {
        console.error("❌ Test Cloudinary upload failed:", error);
        throw error;
      }
    };

    const pickImage = async () => {
      try {
        setUploading(true);

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          console.log("🧪 Testing avatar upload with:", result.assets[0].uri);

          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);

          // Update local state and storage
          setAvatarUrl(cloudinaryUrl);
          await AsyncStorage.setItem("userAvatarUrl", cloudinaryUrl);

          Alert.alert("Success", "Avatar uploaded to Cloudinary successfully!");
        }
      } catch (error) {
        console.error("❌ Avatar upload failed:", error);
        Alert.alert(
          "Error",
          `Upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setUploading(false);
      }
    };

    const testStoredAvatar = async () => {
      try {
        setUploading(true);
        const storedAvatar = await AsyncStorage.getItem("userAvatarUrl");

        if (storedAvatar) {
          console.log("🧪 Found stored avatar URL:", storedAvatar);
          setAvatarUrl(storedAvatar);
          Alert.alert("Success", "Loaded stored avatar!");
        } else {
          Alert.alert("No Avatar", "No stored avatar URL found");
        }
      } catch (error) {
        console.error("❌ Load stored avatar failed:", error);
        Alert.alert(
          "Error",
          `Load failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setUploading(false);
      }
    };

    return (
      <View style={styles.testSection}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.testButtonText}>🧪 Test Cloudinary Upload</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.testButton,
            { backgroundColor: "#00b894", marginTop: 8 },
          ]}
          onPress={testStoredAvatar}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.testButtonText}>🔄 Load Stored Avatar</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const loadStoredPoints = async () => {
    if (!user?.id) return;

    try {
      const storedPoints = await AsyncStorage.getItem(
        `userTotalPoints_${user.id}`
      );
      if (storedPoints) {
        setUserTotalPoints(parseInt(storedPoints, 10));
        console.log(`📊 Loaded points for ${user.id}: ${storedPoints}`);
      }
    } catch (error) {
      console.error("Error loading user points:", error);
    }
  };

  const checkLocation = async () => {
    return await checkAndGetLocation();
  };

  // Load user avatar from AsyncStorage and metadata
  const loadUserAvatar = async () => {
    try {
      // First try to get avatar from AsyncStorage
      const storedAvatarUrl = await AsyncStorage.getItem("userAvatarUrl");
      if (storedAvatarUrl) {
        setAvatarUrl(storedAvatarUrl);
        console.log("👤 Loaded avatar from storage:", storedAvatarUrl);
        return;
      }

      // Then try to get it from user metadata
      const metadataAvatar = user?.unsafeMetadata?.avatarUrl as string;
      if (metadataAvatar) {
        setAvatarUrl(metadataAvatar);
        console.log("👤 Loaded avatar from metadata:", metadataAvatar);
      }
    } catch (error) {
      console.log("Could not load avatar:", error);
    }
  };

  // ✅ Single consolidated effect:
  useEffect(() => {
    const initializeHomeData = async () => {
      if (!user?.id) return;

      try {
        console.log("🏠 Initializing home data for user:", user.id);

        // Phase 1: Load cached data immediately (fast)
        await Promise.all([
          loadStoredPoints(),
          loadUserAvatar(),
          checkAndGetLocation(),
        ]);

        // Phase 2: Fetch fresh data (slower)
        const [tasksResult, completedResult] = await Promise.allSettled([
          fetchTasks(),
          fetchCompletedTasks(),
        ]);

        console.log("✅ Home data initialization complete");
      } catch (error) {
        console.error("❌ Failed to load home data:", error);

        // ✅ Load fallback data instead of leaving empty
        try {
          const cachedTasks = await AsyncStorage.getItem(`tasks_${user.id}`);
          const cachedCompleted = await AsyncStorage.getItem(
            `completedTasks_${user.id}`
          );
          const cachedPoints = await AsyncStorage.getItem(
            `userTotalPoints_${user.id}`
          );

          if (cachedTasks && tasks.length === 0) {
            setTasks(JSON.parse(cachedTasks));
          }
          if (cachedCompleted && completedTasksData.length === 0) {
            setCompletedTasks(JSON.parse(cachedCompleted));
          }
          if (cachedPoints) {
            setUserTotalPoints(parseInt(cachedPoints, 10));
          }

          console.log("📱 Loaded fallback data from cache");
        } catch (cacheError) {
          console.log("No cached data available");
        }
      }
    };

    initializeHomeData();
  }, [user?.id]); // ✅ Only depend on user.id

  // ✅ ADD this effect to auto-calculate points when completed tasks change:
  useEffect(() => {
    // Calculate points from completed tasks data (even if it's empty)
    const totalPoints = completedTasksData.reduce((sum: number, task: any) => {
      return sum + (task.pointsReward || 1);
    }, 0);

    console.log(
      "🎯 Auto-calculated points from completed tasks:",
      totalPoints,
      "from",
      completedTasksData.length,
      "tasks"
    );

    setUserTotalPoints(totalPoints);

    // Store in AsyncStorage if user exists
    if (user?.id) {
      AsyncStorage.setItem(
        `userTotalPoints_${user.id}`,
        totalPoints.toString()
      );
    }
  }, [completedTasksData, user?.id]); // Trigger when completed tasks change

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
                source={{
                  uri: avatarUrl || user?.imageUrl || undefined, // Use Cloudinary URL first
                }}
                style={styles.profileImage}
                onError={() => {
                  console.log(
                    "Failed to load avatar, falling back to Clerk image"
                  );
                  // Could set a fallback here if needed
                }}
              />
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome Back 👋</Text>
            {/* ✅ Check metadata first, then fallback to Clerk built-ins */}
            <Text style={styles.userName}>
              {(() => {
                // Try to get the full name from metadata
                const fullName = user?.unsafeMetadata?.fullName as string;
                if (fullName && fullName.trim()) {
                  return fullName;
                }

                // Try firstName + lastName from metadata
                const firstName =
                  (user?.unsafeMetadata?.firstName as string) || "";
                const lastName =
                  (user?.unsafeMetadata?.lastName as string) || "";
                const metadataName = `${firstName} ${lastName}`.trim();
                if (metadataName) {
                  return metadataName;
                }

                // Try Clerk's built-in name fields (if they exist)
                const clerkName = `${user?.firstName || ""} ${
                  user?.lastName || ""
                }`.trim();
                if (clerkName) {
                  return clerkName;
                }

                // Fallback to email or "User"
                return (
                  user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
                  "User"
                );
              })()}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          {/* Yellow ribbon icon - first */}
          <TouchableOpacity
            style={styles.ribbonButton}
            onPress={async () => {
              try {
                const url = "https://stories.bringthemhomenow.net/";
                console.log("🎗️ Opening ribbon website:", url);

                // Check if the device can open URLs
                const supported = await Linking.canOpenURL(url);

                if (supported) {
                  await Linking.openURL(url);
                  console.log("✅ Successfully opened ribbon website");
                } else {
                  console.error("❌ Cannot open URL:", url);
                  Alert.alert(
                    "Unable to Open",
                    "We couldn't open the link. Please check your internet connection and try again."
                  );
                }
              } catch (error) {
                console.error("❌ Error opening ribbon website:", error);
                Alert.alert(
                  "Error",
                  "Something went wrong while trying to open the link. Please try again."
                );
              }
            }}
          >
            <Text style={styles.ribbonIcon}>🎗️</Text>
          </TouchableOpacity>

          {/* Notifications - second */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/notification")}
          >
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          {/* Settings - third */}
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
        <MilestoneProgressBar points={userTotalPoints} maxPoints={maxPoints} />
      </View>

      {/* Modern Tab Navigation - Same as Organization Feed */}
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
                name="checkmark-circle-outline"
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

      {/* Tasks Section - Now takes full space */}
      <View style={styles.cleanTasksSection}>
        <View style={styles.cleanSectionHeader}>
          <Text style={styles.cleanSectionTitle}>
            {tab === "new"
              ? "Available Tasks"
              : tab === "assigned"
              ? "Your Tasks"
              : "Completed"}
          </Text>

          <TouchableOpacity
            style={styles.cleanFilter}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Ionicons name="options-outline" size={18} color="#666" />
            <Text style={styles.cleanFilterText}>
              {filter === "newest"
                ? "Recent"
                : filter === "oldest"
                ? "Oldest"
                : "Nearby"}
            </Text>
            <Ionicons
              name={showFilterMenu ? "chevron-up" : "chevron-down"}
              size={14}
              color="#999"
            />
          </TouchableOpacity>

          {/* Filter Dropdown Menu */}
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
                  Recent
                </Text>
                {filter === "newest" && (
                  <Ionicons name="checkmark" size={16} color="#FF9800" />
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
                  Oldest
                </Text>
                {filter === "oldest" && (
                  <Ionicons name="checkmark" size={16} color="#FF9800" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterMenuItem,
                  filter === "location" && styles.filterMenuItemActive,
                ]}
                onPress={async () => {
                  // Check if location is available
                  if (!locationEnabled || !userLocation) {
                    console.log("📍 Location not available, requesting...");

                    // Show loading state
                    setShowFilterMenu(false);

                    const success = await requestLocationPermission();
                    if (!success) {
                      Alert.alert(
                        "Location Required",
                        "We need your location to show nearby tasks. Please enable location services or try again.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Try Again",
                            onPress: async () => {
                              const retry = await requestLocationPermission();
                              if (retry) {
                                setFilter("location");
                              }
                            },
                          },
                        ]
                      );
                      return;
                    }
                  }

                  setFilter("location");
                  setShowFilterMenu(false);
                }}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={filter === "location" ? "#FF9800" : "#666"}
                  />
                  {locationEnabled && userLocation && (
                    <View style={styles.locationStatusDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.filterMenuText,
                    filter === "location" && styles.filterMenuTextActive,
                  ]}
                >
                  Nearby
                  {!locationEnabled || !userLocation ? " (Get Location)" : ""}
                </Text>
                {filter === "location" && (
                  <Ionicons name="checkmark" size={16} color="#FF9800" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <FlatList
          data={getTabData()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            tab === "complete" ? (
              <CompletedTaskCard task={item} />
            ) : (
              <TaskCard
                task={item}
                onSignUp={() => handleSignUp(item._id)}
                onTaskUpdate={async () => {
                  console.log("🔄 Home: Refreshing all task data...");
                  // ✅ Refresh both regular tasks and completed tasks after completion
                  await Promise.all([fetchTasks(), fetchCompletedTasks()]);

                  console.log("✅ Home: All task data refreshed");
                }}
              />
            )
          }
          ListEmptyComponent={
            <View style={styles.cleanEmptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={getEmptyIcon() as any}
                  size={48}
                  color="#e0e0e0"
                />
              </View>
              <Text style={styles.cleanEmptyTitle}>No tasks yet</Text>
              <Text style={styles.cleanEmptySubtitle}>{getEmptyMessage()}</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cleanListContent}
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
    paddingTop: 12, // Reduced from 20
    paddingBottom: 8, // Reduced from 20
  },
  sectionTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8, // Reduced from 12
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12, // Reduced from 16
    padding: 12, // Reduced from 20
    shadowColor: "#000",
    shadowOpacity: 0.05, // Reduced shadow
    shadowRadius: 8, // Reduced from 12
    shadowOffset: { width: 0, height: 2 }, // Reduced from 4
    elevation: 3, // Reduced from 4
    marginBottom: 4, // Reduced from 8
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8, // Reduced from 16
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    color: "#FF9800",
  },
  statLabel: {
    fontSize: 11, // Reduced from 12
    color: "#666",
    marginTop: 2, // Reduced from 4
  },
  floatingTabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    zIndex: 1000,
  },
  floatingTabWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  floatingTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    position: "relative",
    overflow: "hidden",
  },
  floatingTabActive: {
    backgroundColor: "#FF9800",
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  activeTabGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    zIndex: -1,
  },
  floatingTabContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  tabIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4757",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 10,
  },
  floatingBadgeText: {
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
  /* Clean Modern Tabs - Move to top area */
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
  /* Tasks Section - Now takes full space */
  cleanTasksSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  cleanSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cleanSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  cleanFilter: {
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
  },
  cleanFilterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
  },
  cleanEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  cleanEmptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 8,
    marginBottom: 4,
  },
  cleanEmptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  cleanListContent: {
    paddingBottom: 40,
  },
  locationIconContainer: {
    position: "relative",
    marginRight: 12,
  },
  locationStatusDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    borderWidth: 1,
    borderColor: "#fff",
  },
  testSection: {
    backgroundColor: "#fff3cd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ffeaa7",
  },
  testButton: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  ribbonButton: {
    width: 40, // ✅ Same as iconButton width
    height: 40, // ✅ Same as iconButton height
    borderRadius: 20, // ✅ Same as iconButton borderRadius
    backgroundColor: "#f8f9fa", // ✅ Same as iconButton backgroundColor
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8, // ✅ Same as iconButton marginLeft
    position: "relative", // ✅ Same as iconButton position
  },

  ribbonIcon: {
    fontSize: 18, // ✅ Keep the emoji size consistent
  },
});
