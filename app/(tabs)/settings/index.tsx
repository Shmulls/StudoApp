import { useClerk } from "@clerk/clerk-expo";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const APP_DOWNLOAD_LINK = "https://your-app-download-link.com"; // Replace with your real link

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
  const { signOut, user } = useClerk();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Ionicons name="home" size={24} color="#333" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {/* Notification Setting */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#ccc", true: "#7ED957" }}
            thumbColor={notificationsEnabled ? "#fff" : "#fff"}
          />
        </View>

        {/* Share App */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setQrVisible(true)}
        >
          <Text style={styles.settingText}>Share App</Text>
          <Feather name="share-2" size={24} color="#222" />
        </TouchableOpacity>

        {/* Terms and Conditions */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setTermsVisible(true)}
        >
          <Text style={styles.settingText}>Terms and Conditions</Text>
          <Feather name="file-text" size={24} color="#222" />
        </TouchableOpacity>

        {/* Contact */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            Linking.openURL(
              "mailto:support@studoapp.com?subject=Support%20Request&body=Hi%20StudoApp%20team,"
            )
          }
        >
          <Text style={styles.settingText}>Contact</Text>
          <Feather name="mail" size={24} color="#222" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.settingRow} onPress={() => signOut()}>
          <Text style={styles.settingText}>Logout</Text>
          <MaterialIcons name="logout" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* QR Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
            >
              Scan to Download the App
            </Text>
            <QRCode value={APP_DOWNLOAD_LINK} size={180} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setQrVisible(false)}
            >
              <Text style={{ color: "#222", fontSize: 16, marginTop: 20 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal
        visible={termsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Terms and Conditions
            </Text>
            <ScrollView style={{ flex: 1, width: "100%" }}>
              <Text style={{ fontSize: 14, color: "#222" }}>{TERMS_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTermsVisible(false)}
            >
              <Text style={{ color: "#222", fontSize: 16, marginTop: 20 }}>
                Close
              </Text>
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
    backgroundColor: "#FAD961",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
  },
  icon: {
    marginLeft: 20,
  },
  content: {
    flex: 1,
    marginTop: 10, // Optional: adjust as needed for a little space
    width: "100%",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    marginBottom: 6,
  },
  settingText: {
    fontSize: 18,
    color: "#222",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    elevation: 5,
    minWidth: 260,
  },
  closeButton: {
    marginTop: 10,
    padding: 8,
  },
});
