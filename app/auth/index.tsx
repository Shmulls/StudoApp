import SocialLoginButton from "@/components/SocialLoginButton";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router"; // Import router for navigation
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
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
  const router = useRouter(); // Initialize router for navigation
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    setError(""); // Reset error message
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
          await setActive({ session: createdSessionId }); // Set active session
        } else {
          setError("Failed to set active session.");
        }
        // Navigate to the main app (e.g., "/(tabs)")
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom },
      ]}
    >
      {/* Logo and Title */}
      <Image
        source={require("../../assets/images/Studo.jpg")}
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
        <Text style={styles.loginButtonText}>Login in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/reset-password")}>
        <Text style={styles.forgotPasswordText}>
          Forgot your password? Reset it here
        </Text>
      </TouchableOpacity>

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
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9CE60", // Yellow background from Figma design
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
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
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  signUpText: {
    fontSize: 14,
    color: "#333",
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

  forgotPasswordText: {
    color: "blue",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
