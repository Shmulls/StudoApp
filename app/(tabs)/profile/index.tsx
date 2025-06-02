import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, // Add this
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { goHome } from "../../../utils/navigation"; // adjust path as needed

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

  const renderField = (label: string, field: keyof typeof fieldValues) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
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
        />
      ) : (
        <Text style={styles.fieldValue}>
          {String(fieldValues[field] || "Not provided")}
        </Text>
      )}
      <TouchableOpacity
        onPress={() =>
          editingField === field ? handleSave(field) : setEditingField(field)
        }
      >
        <Ionicons
          name={editingField === field ? "checkmark" : "pencil"}
          size={20}
          color="#333"
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );

  const renderPasswordField = () => (
    <View style={styles.passwordRow}>
      <Text style={styles.fieldLabel}>Password Change</Text>
      {editingField === "password" ? (
        <View style={styles.passwordBox}>
          {/* Current Password */}
          <TextInput
            style={styles.passwordInput}
            placeholder="Current password"
            secureTextEntry
            value={passwordFields.currentPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, currentPassword: text }))
            }
          />

          {/* Enter New Password */}
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter new password"
            secureTextEntry
            value={passwordFields.newPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, newPassword: text }))
            }
          />

          {/* Re-enter New Password */}
          <TextInput
            style={styles.passwordInput}
            placeholder="Re-enter new password"
            secureTextEntry
            value={passwordFields.confirmPassword}
            onChangeText={(text) =>
              setPasswordFields((prev) => ({ ...prev, confirmPassword: text }))
            }
          />

          {/* Error Message */}
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Submit Icon */}
            <TouchableOpacity onPress={handlePasswordChange}>
              <Ionicons
                name="checkmark"
                size={24}
                color="#4CAF50"
                style={styles.icon}
              />
            </TouchableOpacity>

            {/* Cancel Icon */}
            <TouchableOpacity
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
              <Ionicons
                name="close"
                size={24}
                color="#FF0000"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditingField("password")}>
          <Ionicons name="pencil" size={21} color="#333" style={styles.icon} />
        </TouchableOpacity>
      )}

      {/* Success Message */}
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
  const primaryEmailAddress = emailAddresses[0]?.emailAddress;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => goHome(user)}
        >
          <Ionicons name="home" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>
      </View>

      {/* Editable Fields */}
      <View style={styles.fieldsContainer}>
        {renderField("Phone Number", "phoneNumber")}
        {renderField("Age", "age")}
        {renderField("Academic Institution", "institution")}
        {renderField("Degree", "degree")}
        {renderField("Year of Study", "yearOfStudy")}
        {renderPasswordField()}
      </View>

      {/* Delete User Button */}
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
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9CE60",
    padding: 20,
    paddingTop: 70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 3,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  fieldsContainer: {
    borderRadius: 15,
    padding: 15,
    paddingHorizontal: 10,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: "#333",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: "#666",
    flex: 3,
  },
  fieldInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  passwordBox: {
    width: "100%",
    borderRadius: 15,
    padding: 5,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  passwordInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  icon: {
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  successText: {
    color: "green",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
