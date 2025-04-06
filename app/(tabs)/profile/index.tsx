import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProfileScreen = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found. Please log in.</Text>
      </View>
    );
  }

  const { firstName, lastName, emailAddresses, imageUrl, publicMetadata } =
    user;
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

      {/* Additional Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Phone Number:</Text>
        <Text style={styles.infoValue}>
          {String(publicMetadata?.phoneNumber || "Not provided")}
        </Text>

        <Text style={styles.infoLabel}>Age:</Text>
        <Text style={styles.infoValue}>
          {String(publicMetadata?.age || "Not provided")}
        </Text>

        <Text style={styles.infoLabel}>Academic Institution:</Text>
        <Text style={styles.infoValue}>
          {String(publicMetadata?.institution || "Not provided")}
        </Text>

        <Text style={styles.infoLabel}>Degree:</Text>
        <Text style={styles.infoValue}>
          {String(publicMetadata?.degree || "Not provided")}
        </Text>
        <Text style={styles.infoLabel}>Year of Study:</Text>
        <Text style={styles.infoValue}>
          {String(publicMetadata?.yearOfStudy || "Not provided")}
        </Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          // Navigate to edit profile page (if implemented)
          console.log("Edit Profile button clicked");
        }}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
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
  infoContainer: {
    width: "100%",
    marginTop: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  editButton: {
    marginTop: 30,
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
