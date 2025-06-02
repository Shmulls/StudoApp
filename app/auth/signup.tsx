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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [code, setCode] = useState("");
  const [showPicker, setShowPicker] = useState(false);
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

      // Create user with public metadata
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          phoneNumber,
          age,
          institution,
          degree,
          yearOfStudy,
        },
      });

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
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
            textContentType="oneTimeCode"
          />
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#888"
            textContentType="oneTimeCode"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your degree"
            value={degree}
            onChangeText={setDegree}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your year of study"
            value={yearOfStudy}
            onChangeText={setYearOfStudy}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />

          {/* Picker for Institution */}
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
                    setShowPicker(false);
                  }}
                  style={styles.modalPicker}
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
    backgroundColor: "#F9CE60",
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalPicker: {
    width: "100%",
    height: 150,
    marginBottom: 20,
  },
  closeButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
