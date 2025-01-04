import SocialLoginButton from "@/components/SocialLoginButton";
import { useSignIn } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const { signIn, setActive } = useSignIn(); // Use `useSignIn` instead of `useAuth`
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
      <View style={styles.headingContainer}>
        <Text style={styles.label}>Login on Dev Inteprid</Text>
        <Text style={styles.description}>
          Start your journey with thousands of developers around the world.
        </Text>
      </View>

      {/* Email and Password Inputs */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
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
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Social Login Button (Google Only) */}
      <View style={styles.socialButtonsContainer}>
        <SocialLoginButton strategy="google" />
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  socialButtonsContainer: {
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
});
