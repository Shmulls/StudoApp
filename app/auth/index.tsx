import SocialLoginButton from "@/components/SocialLoginButton";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Animated,
  Image,
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

  const handleEmailLogin = async () => {
    setError("");
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
      }

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });

          // Redirect based on role
          if (user?.unsafeMetadata?.role === "organization") {
            router.push("/(tabs)/organization-feed"); // Redirect organization users
          } else {
            router.push("/(tabs)/home"); // Redirect other users
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
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/images/logoV2.png")}
        style={styles.logo}
      />

      {/* Email and Password Inputs */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Animated Forgot Password Link */}
      <Animated.View style={{ opacity: forgotPasswordOpacity }}>
        <TouchableOpacity onPress={() => router.push("/auth/reset-password")}>
          <Text style={styles.forgotPasswordText}>
            Forgot your password? Reset it here
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Login Button */}
      <SocialLoginButton strategy="google" />

      {/* Sign-Up Link */}
      <TouchableOpacity onPress={() => router.push("/auth/signup")}>
        <Text style={styles.signUpText}>
          No registered yet?{" "}
          <Text style={styles.signUpLink}>Create an account</Text>
        </Text>
      </TouchableOpacity>

      {/* Sign-Up as Organization Link */}
      <TouchableOpacity
        onPress={() => router.push("/auth/signup-organization")}
      >
        <Text style={styles.signUpText}>
          Our partner?{" "}
          <Text style={styles.signUpLink}>Create an organization account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9CE60",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 15,
    marginRight: 25,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#999",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#666",
  },
  forgotPasswordText: {
    color: "#0066cc",
    textAlign: "center",
    marginVertical: 10,
    textDecorationLine: "underline",
  },
  signUpText: {
    fontSize: 14,
    color: "#333",
    marginTop: 20,
  },
  signUpLink: {
    color: "#0066cc",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
