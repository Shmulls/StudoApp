import { useSignUp } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpScreen = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ID, setID] = useState("");
  const [code, setCode] = useState("");
  const [institution, setInstitution] = useState("");
  const [showPicker, setShowPicker] = useState(false); // For controlling the modal
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
    try {
      if (!isLoaded) throw new Error("Sign-up service is unavailable.");

      // Create user
      await signUp.create({ emailAddress: email, password });

      // Initiate email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
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
      router.push("/auth"); // Navigate to login
    } catch (err: any) {
      setError(err.errors ? err.errors[0].message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input Fields */}
      {!pendingVerification && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
            textContentType="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
            textContentType="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter ID number"
            value={ID}
            onChangeText={setID}
            placeholderTextColor="#888"
          />

          {/* Picker with Modal from @React-Native library */}
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.pickerText}>
              {institution || "Select educational institution"}
            </Text>
          </TouchableOpacity>

          <Modal visible={showPicker} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Institution</Text>
                <Picker
                  selectedValue={institution}
                  onValueChange={(itemValue) => {
                    setInstitution(itemValue);
                    setShowPicker(false); // Close the modal on selection
                  }}
                  style={styles.modalPicker} // Add styles for better visibility
                >
                  <Picker.Item
                    label="Select educational institution"
                    value=""
                  />
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Verification Step */}
      {pendingVerification && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#888"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleVerification}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAD961",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  pickerText: {
    color: "#888",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dimmed background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18, // Larger font size
    fontWeight: "bold", // Bold text
    marginBottom: 10, // Space between title and picker
  },
  modalPicker: {
    width: "100%", // Full width
    height: 150, // height of the picker
    marginBottom: 20, // Space between picker and close button
  },
  closeButton: {
    width: "100%", // Full width
    padding: 10, // Padding around the text
    backgroundColor: "#333", // Background color
    borderRadius: 10, // Rounded corners
    alignItems: "center", // Center the text horizontally
  },
  closeButtonText: {
    color: "#fff", // White text color
    fontSize: 16, // Larger font size
    fontWeight: "bold", // Bold text
  },
});
