import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignUpScreen = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [code, setCode] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Add avatar states
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "dwmb1pxju";
  const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      console.log("☁️ Uploading to Cloudinary...");

      // Create FormData
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
        console.log("✅ Cloudinary upload successful:", data.secure_url);
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Cloudinary upload failed:", error);
      throw error;
    }
  };

  const pickAvatar = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera roll permissions to add a profile picture.",
          [{ text: "OK" }]
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

          // Set the avatar URL
          setAvatar(cloudinaryUrl);

          // Store the URL for later use
          await AsyncStorage.setItem("pendingAvatarUrl", cloudinaryUrl);

          Alert.alert("Success", "Profile picture uploaded successfully!");
        } catch (error) {
          Alert.alert(
            "Upload Failed",
            "Could not upload your picture. Please try again."
          );
        } finally {
          setAvatarUploading(false);
        }
      }
    } catch (error) {
      console.log("Avatar picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setAvatarUploading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (!isLoaded) throw new Error("Sign-up service is unavailable.");

      // Make sure all required fields are present
      if (!firstName.trim() || !lastName.trim()) {
        setError("First name and last name are required.");
        setLoading(false);
        return;
      }

      // Create signup with only valid Clerk parameters
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          age: age.trim(),
          institution: institution.trim(),
          degree: degree.trim(),
          yearOfStudy: yearOfStudy.trim(),
          role: "student",
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          // Add avatar URL if available
          ...(avatar && { avatarUrl: avatar }),
        },
      });

      // Initiate email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.errors ? err.errors[0].message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    setError("");
    setLoading(true);

    try {
      if (!isLoaded) throw new Error("Verification service is unavailable.");

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setActive({ session: completeSignUp.createdSessionId });

      // Store avatar URL for the home screen to use
      if (avatar) {
        await AsyncStorage.setItem("userAvatarUrl", avatar);
      }

      router.push("/auth");
    } catch (err: any) {
      setError(err.errors ? err.errors[0].message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.verificationContainer}>
          {/* Verification Header */}
          <View style={styles.verificationHeader}>
            <View style={styles.verificationIconContainer}>
              <Ionicons name="mail-outline" size={32} color="#FF9800" />
            </View>
            <Text style={styles.verificationTitle}>Check Your Email</Text>
            <Text style={styles.verificationSubtitle}>
              We've sent a verification code to {email}
            </Text>
          </View>

          {/* Verification Form */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#666" />
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#F44336"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.modernButton, loading && styles.buttonDisabled]}
              onPress={handleVerification}
              disabled={loading || !code.trim()}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Verify Email</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <View style={styles.logoBadge}>
              <Ionicons name="person-add" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>Join Studo</Text>
          <Text style={styles.welcomeSubtitle}>
            Create your student account to get started
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Avatar Upload Section - Add this before Personal Information */}
          <View style={styles.avatarSection}>
            <Text style={styles.inputLabel}>Profile Picture (Optional)</Text>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickAvatar}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="large" color="#FF9800" />
                  <Text style={styles.avatarLoadingText}>Uploading...</Text>
                </View>
              ) : avatar ? (
                <>
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  <View style={styles.avatarOverlay}>
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                  </View>
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color="#999" />
                  <Text style={styles.avatarText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>
              {avatar ? "Tap to change photo" : "Add a profile picture"}
            </Text>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Create a password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Academic Information */}
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Academic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Educational Institution</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="business-outline" size={20} color="#666" />
              <Text
                style={[
                  styles.pickerText,
                  institution && styles.pickerTextSelected,
                ]}
              >
                {institution || "Select your institution"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Degree Program</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="ribbon-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="e.g., Computer Science"
                placeholderTextColor="#999"
                value={degree}
                onChangeText={setDegree}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Year of Study</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="layers-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="e.g., 1, 2, 3, 4"
                placeholderTextColor="#999"
                value={yearOfStudy}
                onChangeText={setYearOfStudy}
                keyboardType="numeric"
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.modernButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={
              loading ||
              !email.trim() ||
              !password.trim() ||
              !firstName.trim() ||
              !lastName.trim()
            }
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Create Account</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Institution Picker Modal */}
        <Modal visible={showPicker} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Institution</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={institution}
                onValueChange={(itemValue) => {
                  setInstitution(itemValue);
                  setShowPicker(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select educational institution" value="" />
                <Picker.Item
                  label="Sami Shamoon College of Engineering"
                  value="Sami Shamoon College of Engineering"
                />
                <Picker.Item label="Afeka" value="Afeka" />
                <Picker.Item
                  label="Ashkelon Academic College"
                  value="Ashkelon Academic College"
                />
              </Picker>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  headerSpacer: {
    width: 40,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 3,
    borderColor: "#fff",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  logoBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 52,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    marginLeft: 12,
  },
  passwordToggle: {
    padding: 4,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 52,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: "#999",
    marginLeft: 12,
  },
  pickerTextSelected: {
    color: "#222",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  modernButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#666",
  },
  loginLinkBold: {
    color: "#FF9800",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: 200,
  },
  verificationContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  verificationHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  verificationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff5f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 0,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  avatarHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  avatarLoading: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLoadingText: {
    fontSize: 12,
    color: "#FF9800",
    marginTop: 8,
  },
});
