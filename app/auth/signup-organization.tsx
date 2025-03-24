import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpOrganization = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    let retries = 3;

    while (retries > 0) {
      try {
        if (!isLoaded) throw new Error("Sign-up service is unavailable.");

        // Create user with organization role
        await signUp.create({
          emailAddress: email,
          password,
          firstName: organizationName, // Use firstName to store organization name
          unsafeMetadata: { role: "organization" },
        });

        // Initiate email verification
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);
        break; // Exit the loop if successful
      } catch (err: any) {
        retries -= 1;
        if (retries === 0) {
          setError(err.errors ? err.errors[0].message : "Sign-up failed.");
        }
      } finally {
        setLoading(false);
      }
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
      router.push("/"); // Navigate to the home page or dashboard
    } catch (err: any) {
      setError(err.errors ? err.errors[0].message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FAD961", "#F76B1C"]} // Gradient background
      style={styles.overlay}
    >
      <View style={styles.container}>
        {/* Input Fields */}
        {!pendingVerification && (
          <>
            <Text style={styles.title}>Sign Up as an Organization</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Organization Name"
                value={organizationName}
                onChangeText={setOrganizationName}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="none"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Re-enter Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="none"
                placeholderTextColor="#aaa"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Verification Step */}
        {pendingVerification && (
          <>
            <Text style={styles.title}>Verify Your Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                placeholderTextColor="#aaa"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerification}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Email</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

export default SignUpOrganization;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
