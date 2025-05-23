import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FeedbackModal({
  visible,
  onClose,
  feedback,
  setFeedback,
  onSubmit,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  feedback: string;
  setFeedback: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Task Feedback</Text>
          <TextInput
            style={styles.input}
            placeholder="How did it go? Share your experience..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    color: "#222",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
    backgroundColor: "#f2f2f2",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    minHeight: 90,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    backgroundColor: "#fafafa",
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
