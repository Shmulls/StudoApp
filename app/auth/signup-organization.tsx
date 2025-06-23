import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignUpOrganization = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Add avatar states
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Cloudinary configuration (same as student signup)
  const CLOUDINARY_CLOUD_NAME = "dwmb1pxju";
  const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      console.log("☁️ Organization: Uploading to Cloudinary...");

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
          "✅ Organization: Cloudinary upload successful:",
          data.secure_url
        );
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Organization: Cloudinary upload failed:", error);
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
          "We need camera roll permissions to add an organization logo.",
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
          await AsyncStorage.setItem(
            "pendingOrganizationLogoUrl",
            cloudinaryUrl
          );

          Alert.alert("Success", "Organization logo uploaded successfully!");
        } catch (error) {
          Alert.alert(
            "Upload Failed",
            "Could not upload your logo. Please try again."
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
      if (!organizationName.trim() || !email.trim() || !password.trim()) {
        setError("Organization name, email, and password are required.");
        setLoading(false);
        return;
      }

      // Create signup with organization metadata
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          organizationName: organizationName.trim(),
          role: "organization",
          ...(avatar && { avatarUrl: avatar }),
        },
      });

      // Initiate email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Organization signup error:", err);
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

      // Store avatar URL for the organization feed to use
      if (avatar) {
        await AsyncStorage.setItem("organizationAvatarUrl", avatar);
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
          <View style={styles.verificationHeader}>
            <View style={styles.verificationIconContainer}>
              <Ionicons name="mail-outline" size={32} color="#2196F3" />
            </View>
            <Text style={styles.verificationTitle}>Check Your Email</Text>
            <Text style={styles.verificationSubtitle}>
              We've sent a verification code to {email}
            </Text>
          </View>

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
          <Text style={styles.headerTitle}>Organization Signup</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.organizationLogoCircle}>
              <Ionicons name="business" size={32} color="#fff" />
            </View>
            <View style={styles.logoBadge}>
              <Ionicons name="add" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>Partner with Studo</Text>
          <Text style={styles.welcomeSubtitle}>
            Create your organization account to start offering tasks
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Organization Logo Upload Section */}
          <View style={styles.avatarSection}>
            <Text style={styles.inputLabel}>Organization Logo (Optional)</Text>
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
                  <Ionicons name="business-outline" size={32} color="#999" />
                  <Text style={styles.avatarText}>Add Logo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>
              {avatar ? "Tap to change logo" : "Add your organization logo"}
            </Text>
          </View>

          <View style={styles.formHeader}>
            <Ionicons name="business-outline" size={24} color="#2196F3" />
            <Text style={styles.formTitle}>Organization Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Organization Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter organization name"
                placeholderTextColor="#999"
                value={organizationName}
                onChangeText={setOrganizationName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter organization email"
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
              !organizationName.trim()
            }
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="business" size={20} color="#fff" />
                  <Text style={styles.buttonText}>
                    Create Organization Account
                  </Text>
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

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why Partner with Studo?</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#2196F3" />
              <Text style={styles.featureText}>
                Connect with talented students
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                Boost productivity with skilled help
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FF9800" />
              <Text style={styles.featureText}>
                Verified and trusted platform
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUpOrganization;

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
  organizationLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2196F3",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 3,
    borderColor: "#fff",
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
    paddingHorizontal: 20,
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
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
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
    backgroundColor: "#2196F3",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2196F3",
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
    color: "#2196F3",
    fontWeight: "bold",
  },
  featuresSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
    textAlign: "center",
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
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
    backgroundColor: "#E3F2FD",
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
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
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
