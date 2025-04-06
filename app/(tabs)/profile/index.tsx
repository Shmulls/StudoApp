import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

const ProfileScreen = () => {
  const { user } = useUser();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState({
    phoneNumber: user?.unsafeMetadata?.phoneNumber || "",
    age: user?.unsafeMetadata?.age || "",
    institution: user?.unsafeMetadata?.institution || "",
    degree: user?.unsafeMetadata?.degree || "",
    yearOfStudy: user?.unsafeMetadata?.yearOfStudy || "",
  });
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  const handleSave = async (field: string) => {
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
      await user?.updatePassword({ password: passwordFields.newPassword });
      setPasswordError(null);
      setPasswordSuccess(true);
      setPasswordFields({ newPassword: "", confirmPassword: "" });
      setEditingField(null);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Failed to change password. Please try again.");
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
          color="#4CAF50"
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
                setPasswordFields({ newPassword: "", confirmPassword: "" });
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
          <Ionicons
            name="pencil"
            size={24}
            color="#4CAF50"
            style={styles.icon}
          />
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
          onPress={() => router.push("/(tabs)/home")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editIcon}>
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
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAD961",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    marginBottom: 30,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
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
    marginTop: 10,
  },
  fieldsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  passwordBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
});
