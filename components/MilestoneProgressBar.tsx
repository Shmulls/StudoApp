import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface MilestoneProgressBarProps {
  points: number; // Current points earned
  maxPoints?: number; // Goal points (default: 120)
}

const MilestoneProgressBar = ({
  points,
  maxPoints = 120,
}: MilestoneProgressBarProps) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const percentage =
    maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0;
  const progressWidth = (width - 80) * 0.85; // Responsive width

  // Milestone points (every 30 points = 25%)
  const milestones = [30, 60, 90, 120];

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
    if (points >= 120) return "#4CAF50"; // Green - Goal achieved
    if (points >= 90) return "#FF9800"; // Orange - Almost there
    if (points >= 60) return "#2196F3"; // Blue - Good progress
    if (points >= 30) return "#9C27B0"; // Purple - Getting started
    return "#FFC107"; // Yellow - Just started
  };

  const getProgressMessage = () => {
    if (points >= 120) return "🏆 Goal Achieved!";
    if (points >= 90) return "🔥 Almost there!";
    if (points >= 60) return "💪 Great progress!";
    if (points >= 30) return "🚀 Good start!";
    if (points > 0) return "⭐ Getting started!";
    return "🎯 Complete tasks to earn points!";
  };

  const getMilestoneIcon = () => {
    if (points >= 120) return "trophy";
    if (points >= 90) return "medal";
    if (points >= 60) return "star";
    if (points >= 30) return "rocket";
    return "flag";
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
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getProgressColor() + "20" },
            ]}
          >
            <Ionicons
              name={getMilestoneIcon() as any}
              size={16}
              color={getProgressColor()}
            />
          </View>
          <View style={styles.titleText}>
            <Text style={styles.title}>Points Progress</Text>
            <Text style={styles.subtitle}>{getProgressMessage()}</Text>
          </View>
        </View>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: getProgressColor() }]}>
            {getCurrentLevel()}
          </Text>
        </View>
      </View>

      {/* Compact Progress Display */}
      <View style={styles.progressDisplay}>
        <View style={styles.pointsRow}>
          <Text style={[styles.currentPoints, { color: getProgressColor() }]}>
            {points}
          </Text>
          <Text style={styles.maxPoints}>/{maxPoints}</Text>
          <Text style={styles.percentage}>
            ({Math.round((points / maxPoints) * 100)}%)
          </Text>
        </View>
        {points < maxPoints && (
          <Text style={styles.nextInfo}>{pointsToNext} to next milestone</Text>
        )}
      </View>

      {/* Compact Progress Bar */}
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

          {/* Milestone Dots */}
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone / maxPoints) * 100;
            return (
              <View
                key={milestone}
                style={[
                  styles.milestone,
                  {
                    left: (progressWidth * milestonePercentage) / 100 - 4,
                    backgroundColor:
                      points >= milestone ? getProgressColor() : "#e0e0e0",
                    borderColor: points >= milestone ? "#fff" : "#ccc",
                  },
                ]}
              >
                {points >= milestone && (
                  <Ionicons name="checkmark" size={6} color="#fff" />
                )}
              </View>
            );
          })}
        </View>

        {/* Compact Milestone Labels */}
        <View style={styles.milestoneLabels}>
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone / maxPoints) * 100;
            return (
              <Text
                key={milestone}
                style={[
                  styles.milestoneLabel,
                  {
                    left:
                      (progressWidth * milestonePercentage) / 100 -
                      (milestone >= 100 ? 12 : 8), // Adjust for 3-digit numbers
                    color: points >= milestone ? getProgressColor() : "#999",
                    fontWeight: points >= milestone ? "600" : "400",
                  },
                ]}
              >
                {milestone}
              </Text>
            );
          })}
        </View>
      </View>

      {/* Compact Achievement Badges - Only show current level */}
      {points > 0 && (
        <View style={styles.currentAchievement}>
          <View
            style={[
              styles.achievementBadge,
              points >= 120 && styles.masterBadge,
            ]}
          >
            <Ionicons
              name={getMilestoneIcon() as any}
              size={12}
              color={points >= 120 ? "#FFD700" : getProgressColor()}
            />
            <Text
              style={[
                styles.achievementText,
                points >= 120 && styles.masterText,
              ]}
            >
              {getCurrentLevel()}
            </Text>
          </View>
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
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
  },
  levelBadge: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  levelText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  progressDisplay: {
    alignItems: "center",
    marginBottom: 12,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  currentPoints: {
    fontSize: 24,
    fontWeight: "bold",
  },
  maxPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginLeft: 2,
  },
  percentage: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  nextInfo: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    position: "relative",
    marginBottom: 12,
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
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneLabels: {
    flexDirection: "row",
    position: "relative",
    height: 20,
  },
  milestoneLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  currentAchievement: {
    alignItems: "center",
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
