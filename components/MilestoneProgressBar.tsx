import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface MilestoneProgressBarProps {
  completed: number;
  total: number;
}

const MilestoneProgressBar = ({
  completed,
  total,
}: MilestoneProgressBarProps) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const progressWidth = (width - 80) * 0.8; // Responsive width

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: percentage / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    // Animate glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [percentage, progressAnimation, glowAnimation]);

  const getProgressColor = () => {
    if (percentage >= 80) return "#4CAF50"; // Green
    if (percentage >= 50) return "#FF9800"; // Orange
    return "#FFC107"; // Yellow
  };

  const getProgressMessage = () => {
    if (percentage === 100) return "🎉 All tasks completed!";
    if (percentage >= 80) return "🔥 Almost there!";
    if (percentage >= 50) return "💪 Great progress!";
    if (percentage > 0) return "🚀 Keep going!";
    return "📝 Start your first task";
  };

  const getMilestoneIcon = () => {
    if (percentage === 100) return "trophy";
    if (percentage >= 80) return "medal";
    if (percentage >= 50) return "ribbon";
    return "flag";
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getProgressColor() + "20" },
            ]}
          >
            <Ionicons
              name={getMilestoneIcon() as any}
              size={20}
              color={getProgressColor()}
            />
          </View>
          <View>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>{getProgressMessage()}</Text>
          </View>
        </View>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: getProgressColor() }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>

      {/* Modern Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, progressWidth],
                  extrapolate: "clamp",
                }),
                backgroundColor: getProgressColor(),
              },
            ]}
          >
            {/* Animated Glow Effect */}
            <Animated.View
              style={[
                styles.progressGlow,
                {
                  backgroundColor: getProgressColor(),
                  opacity: glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                },
              ]}
            />
          </Animated.View>

          {/* Progress Dots for Milestones */}
          {[25, 50, 75, 100].map((milestone, index) => (
            <View
              key={milestone}
              style={[
                styles.milestone,
                {
                  left: (progressWidth * milestone) / 100 - 6,
                  backgroundColor:
                    percentage >= milestone ? getProgressColor() : "#e0e0e0",
                  borderColor: percentage >= milestone ? "#fff" : "#ccc",
                },
              ]}
            >
              {percentage >= milestone && (
                <Ionicons name="checkmark" size={8} color="#fff" />
              )}
            </View>
          ))}
        </View>

        {/* Task Counter */}
        <View style={styles.taskCounter}>
          <Text style={styles.taskCounterText}>
            {completed} of {total} tasks completed
          </Text>
        </View>
      </View>

      {/* Achievement Badges */}
      {percentage > 0 && (
        <View style={styles.achievementContainer}>
          {percentage >= 25 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.achievementText}>Starter</Text>
            </View>
          )}
          {percentage >= 50 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="flash" size={12} color="#FF6B35" />
              <Text style={styles.achievementText}>Motivated</Text>
            </View>
          )}
          {percentage >= 75 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="rocket" size={12} color="#9C27B0" />
              <Text style={styles.achievementText}>Champion</Text>
            </View>
          )}
          {percentage === 100 && (
            <View style={[styles.achievementBadge, styles.masterBadge]}>
              <Ionicons name="trophy" size={12} color="#FFD700" />
              <Text style={[styles.achievementText, styles.masterText]}>
                Master
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default MilestoneProgressBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  percentageContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  percentage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    position: "relative",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  milestone: {
    position: "absolute",
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCounter: {
    alignItems: "center",
  },
  taskCounterText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  achievementContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 4,
  },
  masterBadge: {
    backgroundColor: "#fff9e6",
    borderColor: "#FFD700",
  },
  achievementText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  masterText: {
    color: "#B8860B",
  },
});
