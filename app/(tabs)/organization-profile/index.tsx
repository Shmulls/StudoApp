import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OrganizationProfile = () => {
  const { user } = useUser();
  const [editingField, setEditingField] = useState<
    "phoneNumber" | "password" | null
  >(null);
  const [phoneNumber, setPhoneNumber] = useState(
    typeof user?.unsafeMetadata?.phoneNumber === "string"
      ? user.unsafeMetadata.phoneNumber
      : ""
  );
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  // Add avatar states for Cloudinary
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = "dwmb1pxju";
  const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";

  // Load avatar on component mount
  useEffect(() => {
    const loadOrganizationAvatar = async () => {
      try {
        // First try AsyncStorage
        const storedAvatarUrl = await AsyncStorage.getItem(
          "organizationAvatarUrl"
        );
        if (storedAvatarUrl) {
          setAvatarUrl(storedAvatarUrl);
          console.log(
            "🏢 Profile: Loaded avatar from storage:",
            storedAvatarUrl
          );
          return;
        }

        // Then try user metadata
        const metadataAvatar = user?.unsafeMetadata?.avatarUrl as string;
        if (metadataAvatar) {
          setAvatarUrl(metadataAvatar);
          console.log(
            "🏢 Profile: Loaded avatar from metadata:",
            metadataAvatar
          );
        }
      } catch (error) {
        console.log("Could not load organization avatar:", error);
      }
    };

    if (user) {
      loadOrganizationAvatar();
    }
  }, [user]);

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      console.log("☁️ Organization Profile: Uploading to Cloudinary...");

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "organization-logo.jpg",
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "organization-logos");

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
        console.log(
          "✅ Organization Profile: Cloudinary upload successful:",
          data.secure_url
        );
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error(
        "❌ Organization Profile: Cloudinary upload failed:",
        error
      );
      throw error;
    }
  };

  // Updated pickImage function with Cloudinary
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUploading(true);
        const imageUri = result.assets[0].uri;

        try {
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(imageUri);

          // Update local state immediately
          setAvatarUrl(cloudinaryUrl);

          // Store in AsyncStorage
          await AsyncStorage.setItem("organizationAvatarUrl", cloudinaryUrl);

          // Update user metadata
          await user?.update({
            unsafeMetadata: {
              ...user?.unsafeMetadata,
              avatarUrl: cloudinaryUrl,
            },
          });

          console.log("✅ Organization Profile: Logo updated successfully");
          Alert.alert("Success", "Organization logo updated successfully!");
        } catch (error) {
          console.error("❌ Organization Profile: Logo upload failed:", error);
          Alert.alert(
            "Upload Failed",
            "Could not update your organization logo. Please try again."
          );
        } finally {
          setAvatarUploading(false);
        }
      }
    } catch (error) {
      console.error("Error updating organization logo:", error);
      Alert.alert(
        "Error",
        "Failed to update organization logo. Please try again."
      );
      setAvatarUploading(false);
    }
  };

  const handleSavePhone = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          phoneNumber: phoneNumber,
        },
      });
      setEditingField(null);
      Alert.alert("Success", "Phone number updated successfully!");
    } catch (error) {
      console.error("Error updating phone:", error);
      Alert.alert("Error", "Failed to update phone number. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (passwordFields.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await user?.updatePassword({
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });
      setPasswordError(null);
      setPasswordSuccess(true);
      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setEditingField(null);

      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(
        "Failed to change password. Please check your current password."
      );
    }
  };

  const renderPhoneField = () => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldLabelContainer}>
          <View style={styles.fieldIconContainer}>
            <Ionicons name="call" size={20} color="#FF9800" />
          </View>
          <Text style={styles.fieldLabel}>Contact Phone</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            editingField === "phoneNumber"
              ? handleSavePhone()
              : setEditingField("phoneNumber")
          }
        >
          <Ionicons
            name={editingField === "phoneNumber" ? "checkmark" : "pencil"}
            size={18}
            color={editingField === "phoneNumber" ? "#4CAF50" : "#666"}
          />
        </TouchableOpacity>
      </View>
      {editingField === "phoneNumber" ? (
        <TextInput
          style={styles.fieldInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Enter contact phone number"
        />
      ) : (
        <Text style={styles.fieldValue}>{phoneNumber || "Not provided"}</Text>
      )}
    </View>
  );

  const renderPasswordField = () => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldLabelContainer}>
          <View style={styles.fieldIconContainer}>
            <Ionicons name="lock-closed" size={20} color="#FF9800" />
          </View>
          <Text style={styles.fieldLabel}>Password</Text>
        </View>
        {editingField !== "password" && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditingField("password")}
          >
            <Ionicons name="pencil" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {editingField === "password" ? (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.fieldInput}
            placeholder="Current password"
            secureTextEntry
            value={passwordFields.currentPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, currentPassword: text }))
            }
          />
          <TextInput
            style={styles.fieldInput}
            placeholder="New password (min 8 characters)"
            secureTextEntry
            value={passwordFields.newPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, newPassword: text }))
            }
          />
          <TextInput
            style={styles.fieldInput}
            placeholder="Confirm new password"
            secureTextEntry
            value={passwordFields.confirmPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, confirmPassword: text }))
            }
          />
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
          <View style={styles.passwordActions}>
            <TouchableOpacity
              style={[
                styles.passwordActionButton,
                { backgroundColor: "#4CAF50" },
              ]}
              onPress={handlePasswordChange}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.passwordActionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.passwordActionButton,
                { backgroundColor: "#F44336" },
              ]}
              onPress={() => {
                setEditingField(null);
                setPasswordFields({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPasswordError(null);
              }}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.passwordActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.fieldValue}>••••••••</Text>
      )}

      {passwordSuccess && (
        <Text style={styles.successText}>Password changed successfully!</Text>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found. Please log in.</Text>
      </View>
    );
  }

  const { firstName, lastName, emailAddresses } = user;

  return (
    <View style={styles.container}>
      {/* Organization Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Profile</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Organization Profile Card - Updated with Cloudinary avatar */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={pickImage}
            disabled={avatarUploading}
          >
            {avatarUploading ? (
              <View style={[styles.profileImage, styles.uploadingContainer]}>
                <ActivityIndicator size="large" color="#FF9800" />
              </View>
            ) : (
              <Image
                source={{
                  uri: avatarUrl || user?.imageUrl || undefined,
                }}
                style={styles.profileImage}
                onError={() => {
                  console.log("Failed to load organization profile logo");
                  setAvatarUrl(null);
                }}
              />
            )}
            <View style={styles.editImageIcon}>
              <Ionicons
                name={avatarUploading ? "hourglass" : "camera"}
                size={16}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {(user?.unsafeMetadata?.organizationName as string) ||
              `${firstName} ${lastName}`}
          </Text>
          <Text style={styles.userEmail}>
            {emailAddresses[0]?.emailAddress}
          </Text>
          <View style={styles.organizationBadge}>
            <Ionicons name="business" size={14} color="#FF9800" />
            <Text style={styles.organizationBadgeText}>Organization</Text>
          </View>
        </View>

        {/* Organization Fields - keep all your existing renderPhoneField and renderPasswordField */}
        <View style={styles.fieldsContainer}>
          {renderPhoneField()}
          {renderPasswordField()}
        </View>

        {/* Organization Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#FF9800" />
            <Text style={styles.infoTitle}>Organization Account</Text>
          </View>
          <Text style={styles.infoText}>
            As an organization, you can create and manage tasks for your
            community. Your profile is simplified to focus on essential contact
            information and branding.
          </Text>
        </View>

        {/* Delete Account Button - keep unchanged */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Delete Organization Account",
              "Are you sure you want to delete your organization account? This will remove all your tasks and cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    user
                      ?.delete()
                      .then(() => {
                        router.replace("/auth");
                      })
                      .catch((error) => {
                        console.error("Error deleting organization:", error);
                        Alert.alert(
                          "Error",
                          "Failed to delete organization account. Please try again."
                        );
                      });
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>
            Delete Organization Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OrganizationProfile;

// Add the new uploading container style to your existing StyleSheet
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  uploadingContainer: {
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  editImageIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9800",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
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
    marginBottom: 8,
  },
  organizationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  organizationBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9800",
  },
  fieldsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  fieldCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fieldLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fieldIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff5f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldValue: {
    fontSize: 15,
    color: "#666",
    paddingLeft: 44,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#f8f9fa",
    marginLeft: 44,
    marginBottom: 8,
  },
  passwordContainer: {
    paddingLeft: 44,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  passwordActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  passwordActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#F44336",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#F44336",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
