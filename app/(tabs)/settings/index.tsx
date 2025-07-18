import { useAuth, useUser } from "@clerk/clerk-expo";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NotificationService } from "../../../services/notificationService";
import { goHome } from "../../../utils/navigation";

const APP_DOWNLOAD_LINK =
  "https://expo.dev/artifacts/eas/v4r4yB6dXTwSqpncD7PfKb.apk";

const TERMS_TEXT = `
Welcome to StudoApp!

1. Use of Service
StudoApp is designed to help students manage tasks, assignments, and collaborate. You agree to use the app responsibly and not for any unlawful or harmful activities.

2. User Content
You are responsible for any content you submit. Do not post inappropriate, offensive, or copyrighted material without permission.

3. Privacy
We respect your privacy. Your personal information is only used to provide and improve the service. We do not sell your data to third parties.

4. Limitation of Liability
StudoApp is provided "as is" without warranties. We are not liable for any damages or losses resulting from your use of the app.

5. Changes to Terms
We may update these terms from time to time. Continued use of the app means you accept the new terms.

If you have questions, contact us at support@studoapp.com.
`;

const SettingsScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  // Check location settings on component mount
  useEffect(() => {
    checkLocationSettings();
  }, []);

  // Check notification permissions on load
  useEffect(() => {
    checkNotificationSettings();
  }, []);

  const checkLocationSettings = async () => {
    try {
      // Check if location is enabled in app settings
      const locationSetting = await AsyncStorage.getItem("locationEnabled");
      const isLocationEnabled = locationSetting === "true";

      // Check if location permission is granted
      let { status } = await Location.getForegroundPermissionsAsync();

      // Location is considered enabled if both permission is granted AND app setting is enabled
      setLocationEnabled(isLocationEnabled && status === "granted");
    } catch (error) {
      console.error("Error checking location settings:", error);
    }
  };

  const checkNotificationSettings = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);
  };

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      // User wants to enable location
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          // Permission granted, save setting and enable
          await AsyncStorage.setItem("locationEnabled", "true");
          setLocationEnabled(true);
          Alert.alert(
            "Location Enabled",
            "Your location will now be used to sort tasks by distance.",
            [{ text: "OK" }]
          );
        } else {
          // Permission denied
          Alert.alert(
            "Location Permission Denied",
            "Please enable location permission in your device settings to use location-based features.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Settings",
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          setLocationEnabled(false);
          await AsyncStorage.setItem("locationEnabled", "false");
        }
      } catch (error) {
        console.error("Error requesting location permission:", error);
        setLocationEnabled(false);
        await AsyncStorage.setItem("locationEnabled", "false");
      }
    } else {
      // User wants to disable location
      await AsyncStorage.setItem("locationEnabled", "false");
      setLocationEnabled(false);
      Alert.alert(
        "Location Disabled",
        "Location-based sorting will no longer be available.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      setNotificationsEnabled(granted);
      if (granted) {
        Alert.alert(
          "Notifications Enabled",
          "You'll receive reminders for your assigned tasks!"
        );
      }
    } else {
      setNotificationsEnabled(false);
      // You might want to cancel all scheduled notifications here
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => goHome(user)}
        >
          <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              Hi,{" "}
              {(() => {
                // Check if it's an organization
                if (user?.unsafeMetadata?.role === "organization") {
                  return String(
                    user?.unsafeMetadata?.organizationName || "Organization"
                  );
                }

                // For students, try different sources
                const fullName = user?.unsafeMetadata?.fullName as string;
                if (fullName && fullName.trim()) {
                  return fullName.split(" ")[0]; // Get first name only for greeting
                }

                // Try firstName from metadata
                const firstName =
                  (user?.unsafeMetadata?.firstName as string) ||
                  user?.firstName;
                if (firstName && firstName.trim()) {
                  return firstName;
                }

                // Fallback to email username
                return (
                  user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "User"
                );
              })()}{" "}
              👋
            </Text>
            <Text style={styles.userEmail}>
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsContainer}>
          {/* Notification Setting */}
          <View style={styles.modernSettingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#4CAF50" }]}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#e0e0e0"
            />
          </View>

          {/* Location Setting */}
          <View style={styles.modernSettingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#FF9800" }]}
              >
                <Ionicons name="location-outline" size={20} color="#fff" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Location Services</Text>
                <Text style={styles.settingSubtext}>
                  Sort tasks by distance from your location
                </Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: "#e0e0e0", true: "#FF9800" }}
              thumbColor={locationEnabled ? "#fff" : "#fff"}
              ios_backgroundColor="#e0e0e0"
            />
          </View>

          {/* Share App */}
          <TouchableOpacity
            style={styles.modernSettingRow}
            onPress={() => setQrVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#2196F3" }]}
              >
                <Feather name="share-2" size={20} color="#fff" />
              </View>
              <Text style={styles.settingText}>Share App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.modernSettingRow}
            onPress={() => setTermsVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#9C27B0" }]}
              >
                <Feather name="file-text" size={20} color="#fff" />
              </View>
              <Text style={styles.settingText}>Terms and Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Contact */}
          <TouchableOpacity
            style={styles.modernSettingRow}
            onPress={() =>
              Linking.openURL(
                "mailto:support@studoapp.com?subject=Support%20Request&body=Hi%20StudoApp%20team,"
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#FF5722" }]}
              >
                <Feather name="mail" size={20} color="#fff" />
              </View>
              <Text style={styles.settingText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.modernSettingRow, styles.logoutRow]}
            onPress={() => signOut()}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#F44336" }]}
              >
                <MaterialIcons name="logout" size={20} color="#fff" />
              </View>
              <Text style={[styles.settingText, styles.logoutText]}>
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern QR Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modernModalContent}>
            <Text style={styles.modalTitle}>Share StudoApp</Text>
            <Text style={styles.modalSubtitle}>Scan to download the app</Text>
            <View style={styles.qrContainer}>
              <QRCode value={APP_DOWNLOAD_LINK} size={180} />
            </View>
            <TouchableOpacity
              style={styles.modernCloseButton}
              onPress={() => setQrVisible(false)}
            >
              <Text style={styles.modernCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modern Terms Modal */}
      <Modal
        visible={termsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modernModalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <ScrollView
              style={styles.termsScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.termsText}>{TERMS_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modernCloseButton}
              onPress={() => setTermsVisible(false)}
            >
              <Text style={styles.modernCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;

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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modernSettingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  logoutRow: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#F44336",
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
    minWidth: 300,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  termsScrollView: {
    maxHeight: 300,
    width: "100%",
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
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
