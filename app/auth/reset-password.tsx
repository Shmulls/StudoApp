import { useSignIn } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ResetPassword = () => {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  if (!signIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c47ff" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // Send password reset email
  const handleSendResetEmail = async () => {
    try {
      const response = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      console.log("Reset password response:", response);
      setEmailSent(true);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      alert(err.errors ? err.errors[0].message : "Failed to send reset email.");
    }
  };

  // Reset password with code
  const handleResetPassword = async () => {
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      alert("Password reset successfully!");
      await setActive({ session: result.createdSessionId });
    } catch (err: any) {
      alert(err.errors ? err.errors[0].message : "Failed to reset password.");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: !emailSent }} />

      {!emailSent && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.inputField}
          />
          <Button
            onPress={handleSendResetEmail}
            title="Send Reset Email"
            color="#6c47ff"
          />
        </>
      )}

      {emailSent && (
        <>
          <TextInput
            placeholder="Enter the code sent to your email"
            value={code}
            onChangeText={setCode}
            style={styles.inputField}
          />
          <TextInput
            placeholder="Enter your new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputField}
          />
          <Button
            onPress={handleResetPassword}
            title="Set New Password"
            color="#6c47ff"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c47ff",
  },
  inputField: {
    marginVertical: 10,
    height: 50,
    borderWidth: 1,
    borderColor: "#6c47ff",
    borderRadius: 5,
    padding: 10,
  },
});

export default ResetPassword;
