import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface MilestoneProgressBarProps {
  points: number;
  maxPoints?: number;
}

const MilestoneProgressBar = ({
  points,
  maxPoints = 120,
}: MilestoneProgressBarProps) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const percentage =
    maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0;
  const milestones = [30, 60, 90, 120];

  useEffect(() => {
    // Smooth progress animation
    Animated.timing(progressAnimation, {
      toValue: percentage / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [percentage, progressAnimation, fadeAnimation]);

  const getProgressColor = () => {
    if (points >= 120) return "#10B981"; // Emerald
    if (points >= 90) return "#F59E0B"; // Amber
    if (points >= 60) return "#3B82F6"; // Blue
    if (points >= 30) return "#8B5CF6"; // Purple
    return "#6B7280"; // Gray
  };

  const getCurrentLevel = () => {
    if (points >= 120) return "Champion";
    if (points >= 90) return "Expert";
    if (points >= 60) return "Advanced";
    if (points >= 30) return "Intermediate";
    if (points > 0) return "Beginner";
    return "Starter";
  };

  const getNextMilestone = () => {
    return milestones.find((milestone) => milestone > points) || maxPoints;
  };

  const pointsToNext = getNextMilestone() - points;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <View
            style={[styles.levelDot, { backgroundColor: getProgressColor() }]}
          />
          <Text style={[styles.levelText, { color: getProgressColor() }]}>
            {getCurrentLevel()}
          </Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={[styles.currentPoints, { color: getProgressColor() }]}>
            {points}
          </Text>
          <Text style={styles.maxPointsText}>/{maxPoints}</Text>
        </View>
      </View>

      {/* Modern Progress Track */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                  extrapolate: "clamp",
                }),
                backgroundColor: getProgressColor(),
              },
            ]}
          />

          {/* Modern Milestone Indicators */}
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone / maxPoints) * 100;
            const isCompleted = points >= milestone;

            return (
              <View
                key={milestone}
                style={[
                  styles.milestoneIndicator,
                  {
                    left: `${milestonePercentage}%`,
                    backgroundColor: isCompleted
                      ? getProgressColor()
                      : "#E5E7EB",
                  },
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={10} color="#fff" />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Clean Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pointsToNext}</Text>
          <Text style={styles.statLabel}>to next milestone</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(percentage)}%</Text>
          <Text style={styles.statLabel}>complete</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default MilestoneProgressBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentPoints: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  maxPointsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#9CA3AF",
    marginLeft: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    position: "relative",
    overflow: "visible",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    position: "absolute",
    top: 0,
    left: 0,
  },
  milestoneIndicator: {
    position: "absolute",
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -6 }],
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
