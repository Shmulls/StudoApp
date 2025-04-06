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

const ProfileScreen = () => {
  const { user, isLoaded } = useUser();
  const [editingField, setEditingField] = useState<string | null>(null);
  type FieldValues = {
    phoneNumber: string;
    age: string;
    institution: string;
    degree: string;
    yearOfStudy: string;
  };

  const [fieldValues, setFieldValues] = useState<FieldValues>({
    phoneNumber: (user?.unsafeMetadata?.phoneNumber as string) || "",
    age: (user?.unsafeMetadata?.age as string) || "",
    institution: (user?.unsafeMetadata?.institution as string) || "",
    degree: (user?.unsafeMetadata?.degree as string) || "",
    yearOfStudy: (user?.unsafeMetadata?.yearOfStudy as string) || "",
  });

  const handleSave = async (field: keyof FieldValues) => {
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

  const renderField = (label: string, field: keyof typeof fieldValues) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {editingField === field ? (
        <TextInput
          style={styles.input}
          value={fieldValues[field]}
          onChangeText={(text) =>
            setFieldValues((prev) => ({ ...prev, [field]: text }))
          }
          keyboardType={
            field === "age" || field === "yearOfStudy" ? "numeric" : "default"
          }
        />
      ) : (
        <Text style={styles.infoValue}>
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
      {/* Profile Picture */}
      <Image source={{ uri: imageUrl }} style={styles.profileImage} />

      {/* User Information */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.email}>{primaryEmailAddress}</Text>

      {/* Editable Fields */}
      {renderField("Phone Number", "phoneNumber")}
      {renderField("Age", "age")}
      {renderField("Academic Institution", "institution")}
      {renderField("Degree", "degree")}
      {renderField("Year of Study", "yearOfStudy")}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FAD961",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    flex: 2,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#fff",
  },
  icon: {
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
