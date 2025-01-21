import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  const { signOut, user } = useClerk();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Ionicons name="home" size={24} color="#333" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        <SignedIn>
          <Text>Email: {user?.emailAddresses[0]?.emailAddress}</Text>
          <Text>Full Name: {user?.fullName || "Not Provided"}</Text>
          <Button title="Logout" onPress={() => signOut()} />
        </SignedIn>
      </View>
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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: "#fff",
    borderWidth: 2,
    marginTop: 60,
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
    justifyContent: "center",
    alignItems: "center",
  },
});
