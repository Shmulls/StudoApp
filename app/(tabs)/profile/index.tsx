import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { goHome } from "../../../utils/navigation";

const ProfileScreen = () => {
  const { user } = useUser();
  const [editingField, setEditingField] = useState<
    keyof typeof fieldValues | "password" | null
  >(null);
  const [fieldValues, setFieldValues] = useState({
    phoneNumber:
      typeof user?.unsafeMetadata?.phoneNumber === "string"
        ? user.unsafeMetadata.phoneNumber
        : "",
    age:
      typeof user?.unsafeMetadata?.age === "string"
        ? user.unsafeMetadata.age
        : "",
    institution:
      typeof user?.unsafeMetadata?.institution === "string"
        ? user.unsafeMetadata.institution
        : "",
    degree:
      typeof user?.unsafeMetadata?.degree === "string"
        ? user.unsafeMetadata.degree
        : "",
    yearOfStudy:
      typeof user?.unsafeMetadata?.yearOfStudy === "string"
        ? user.unsafeMetadata.yearOfStudy
        : "",
  });
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  const handleSave = async (field: keyof typeof fieldValues) => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          [field]: fieldValues[field],
        },
      });
      setEditingField(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordError("Passwords do not match.");
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
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Failed to change password. Please try again.");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        const response = await fetch(selectedAsset.uri);
        const blob = await response.blob();

        await user?.setProfileImage({ file: blob });
        await user?.reload();
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };

  const renderField = (
    label: string,
    field: keyof typeof fieldValues,
    icon: string
  ) => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldLabelContainer}>
          <View style={styles.fieldIconContainer}>
            <Ionicons name={icon as any} size={20} color="#FF9800" />
          </View>
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            editingField === field ? handleSave(field) : setEditingField(field)
          }
        >
          <Ionicons
            name={editingField === field ? "checkmark" : "pencil"}
            size={18}
            color={editingField === field ? "#4CAF50" : "#666"}
          />
        </TouchableOpacity>
      </View>
      {editingField === field ? (
        <TextInput
          style={styles.fieldInput}
          value={fieldValues[field]}
          onChangeText={(text) =>
            setFieldValues((prev) => ({ ...prev, [field]: text }))
          }
          keyboardType={
            field === "age" || field === "yearOfStudy" ? "numeric" : "default"
          }
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {String(fieldValues[field] || "Not provided")}
        </Text>
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
            placeholder="New password"
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

  const { firstName, lastName, emailAddresses, imageUrl } = user;

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => goHome(user)}
        >
          <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={pickImage}
          >
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            <View style={styles.editImageIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.userEmail}>
            {emailAddresses[0]?.emailAddress}
          </Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {renderField("Phone Number", "phoneNumber", "call")}
          {renderField("Age", "age", "calendar")}
          {renderField("Institution", "institution", "school")}
          {renderField("Degree", "degree", "ribbon")}
          {renderField("Year of Study", "yearOfStudy", "time")}
          {renderPasswordField()}
        </View>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
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
                        console.error("Error deleting user:", error);
                        Alert.alert(
                          "Error",
                          "Failed to delete account. Please try again."
                        );
                      });
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

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
  },
  fieldsContainer: {
    gap: 12,
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
    marginTop: 32,
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
