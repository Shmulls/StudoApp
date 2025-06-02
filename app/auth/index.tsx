import SocialLoginButton from "@/components/SocialLoginButton";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [forgotPasswordOpacity] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setError("");
    setLoading(true);

    try {
      let createdSessionId;
      if (signIn) {
        const result = await signIn.create({
          identifier: email,
          password,
        });
        createdSessionId = result.createdSessionId;
      } else {
        setError("Sign-in service is unavailable.");
        setLoading(false);
        return;
      }

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });

          // Redirect based on role
          if (user?.unsafeMetadata?.role === "organization") {
            router.push("/(tabs)/organization-feed");
          } else {
            router.push("/(tabs)/home");
          }
        } else {
          setError("Failed to set active session.");
        }
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      setLoginAttempts((prev) => prev + 1);
      if (loginAttempts === 0) {
        Animated.timing(forgotPasswordOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.modernLogoContainer}>
            {/* Custom Studo Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <View style={styles.logoBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>
            <Text style={styles.appName}>Studo</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue your journey
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons name="log-in-outline" size={24} color="#FF9800" />
            <Text style={styles.formTitle}>Sign In</Text>
          </View>

          {/* Email Input */}
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

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                style={styles.modernInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.modernLoginButton, loading && styles.buttonDisabled]}
            onPress={handleEmailLogin}
            disabled={loading || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <Animated.View style={styles.loadingSpinner}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                </Animated.View>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Forgot Password */}
          <Animated.View style={{ opacity: forgotPasswordOpacity }}>
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/auth/reset-password")}
            >
              <Ionicons name="help-circle-outline" size={16} color="#FF9800" />
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.modernDivider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerTextContainer}>
            <Text style={styles.dividerText}>Or continue with</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <SocialLoginButton strategy="google" />
        </View>

        {/* Navigation Links */}
        <View style={styles.navigationSection}>
          {/* Regular Sign Up */}
          <TouchableOpacity
            style={styles.navigationCard}
            onPress={() => router.push("/auth/signup")}
            activeOpacity={0.7}
          >
            <View style={styles.navigationIconContainer}>
              <Ionicons name="person-add-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.navigationContent}>
              <Text style={styles.navigationTitle}>New User?</Text>
              <Text style={styles.navigationSubtitle}>Create your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Organization Sign Up */}
          <TouchableOpacity
            style={styles.navigationCard}
            onPress={() => router.push("/auth/signup-organization")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.navigationIconContainer,
                { backgroundColor: "#E3F2FD" },
              ]}
            >
              <Ionicons name="business-outline" size={20} color="#2196F3" />
            </View>
            <View style={styles.navigationContent}>
              <Text style={styles.navigationTitle}>Organization Partner?</Text>
              <Text style={styles.navigationSubtitle}>
                Create organization account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthScreen;

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
  logoSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modernLogoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    // Gradient effect (you can add react-native-linear-gradient for better gradients)
    borderWidth: 4,
    borderColor: "#fff",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: -1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
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
  modernLoginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingSpinner: {
    transform: [{ rotate: "45deg" }],
  },
  forgotPasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  forgotPasswordText: {
    color: "#FF9800",
    fontSize: 14,
    fontWeight: "500",
  },
  modernDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerTextContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  socialSection: {
    marginBottom: 24,
  },
  navigationSection: {
    gap: 12,
  },
  navigationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  navigationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  navigationContent: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  navigationSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
