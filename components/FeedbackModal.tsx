import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
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
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.celebrationIcon}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Fantastic Work! 🎉</Text>
            <Text style={styles.subtitle}>
              You've earned +1 point! Share your experience with us.
            </Text>
          </View>

          {/* Points earned indicator */}
          <View style={styles.pointsContainer}>
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>+1 Point Earned</Text>
            </View>
          </View>

          {/* Feedback input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>How did it go?</Text>
            <TextInput
              style={styles.input}
              placeholder="Share your experience, challenges, or highlights..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              placeholderTextColor="#999"
              numberOfLines={4}
            />
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setFeedback("");
                onSubmit();
              }}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={styles.loadingDot} />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressHint}>
            <Ionicons name="trending-up" size={14} color="#4CAF50" />
            <Text style={styles.progressHintText}>
              Keep going! Every task brings you closer to 120 points!
            </Text>
          </View>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  celebrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  pointsContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57F17",
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  input: {
    minHeight: 100,
    borderColor: "#e0e0e0",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
    fontFamily: "System",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  progressHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  progressHintText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 4,
  },
});
