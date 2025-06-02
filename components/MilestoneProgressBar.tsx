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
  const progressWidth = (width - 80) * 0.8; // Responsive width

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
    if (points >= 120) return "🏆 Goal Achieved! You're a champion!";
    if (points >= 90) return "🔥 Almost there! Just 30 more points!";
    if (points >= 60) return "💪 Great progress! Halfway to your goal!";
    if (points >= 30) return "🚀 Good start! Keep building momentum!";
    if (points > 0) return "⭐ You've started your journey!";
    return "🎯 Complete tasks to earn your first points!";
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
            <Text style={styles.title}>Points Progress</Text>
            <Text style={styles.subtitle}>{getProgressMessage()}</Text>
          </View>
        </View>
        <View style={styles.levelContainer}>
          <Text style={[styles.level, { color: getProgressColor() }]}>
            {getCurrentLevel()}
          </Text>
        </View>
      </View>

      {/* Points Display */}
      <View style={styles.pointsDisplay}>
        <View style={styles.currentPoints}>
          <Text style={[styles.pointsNumber, { color: getProgressColor() }]}>
            {points}
          </Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
        <View style={styles.goalPoints}>
          <Text style={styles.goalNumber}>/ {maxPoints}</Text>
          <Text style={styles.goalLabel}>Goal</Text>
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

          {/* Progress Dots for Milestones (30, 60, 90, 120 points) */}
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone / maxPoints) * 100;
            return (
              <View
                key={milestone}
                style={[
                  styles.milestone,
                  {
                    left: (progressWidth * milestonePercentage) / 100 - 6,
                    backgroundColor:
                      points >= milestone ? getProgressColor() : "#e0e0e0",
                    borderColor: points >= milestone ? "#fff" : "#ccc",
                  },
                ]}
              >
                {points >= milestone && (
                  <Ionicons name="checkmark" size={8} color="#fff" />
                )}
                <View style={styles.milestoneLabel}>
                  <Text style={styles.milestoneLabelText}>{milestone}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Next milestone info */}
        {points < maxPoints && (
          <View style={styles.nextMilestone}>
            <Text style={styles.nextMilestoneText}>
              {pointsToNext} points to next milestone ({getNextMilestone()}{" "}
              points)
            </Text>
          </View>
        )}
      </View>

      {/* Achievement Badges */}
      {points > 0 && (
        <View style={styles.achievementContainer}>
          {points >= 30 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="rocket" size={12} color="#9C27B0" />
              <Text style={styles.achievementText}>Beginner</Text>
            </View>
          )}
          {points >= 60 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="star" size={12} color="#2196F3" />
              <Text style={styles.achievementText}>Advanced</Text>
            </View>
          )}
          {points >= 90 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="medal" size={12} color="#FF9800" />
              <Text style={styles.achievementText}>Expert</Text>
            </View>
          )}
          {points >= 120 && (
            <View style={[styles.achievementBadge, styles.masterBadge]}>
              <Ionicons name="trophy" size={12} color="#FFD700" />
              <Text style={[styles.achievementText, styles.masterText]}>
                Champion
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
    marginBottom: 16,
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
  levelContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  level: {
    fontSize: 12,
    fontWeight: "bold",
  },
  pointsDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 20,
  },
  currentPoints: {
    alignItems: "center",
  },
  pointsNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  goalPoints: {
    alignItems: "center",
    marginLeft: 8,
  },
  goalNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#999",
  },
  goalLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    position: "relative",
    marginBottom: 24,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
  milestone: {
    position: "absolute",
    top: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneLabel: {
    position: "absolute",
    top: 22,
    alignItems: "center",
    width: 30,
    left: -6,
  },
  milestoneLabelText: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
  },
  nextMilestone: {
    alignItems: "center",
  },
  nextMilestoneText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  achievementContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 4,
  },
  masterBadge: {
    backgroundColor: "#fff9e6",
    borderColor: "#FFD700",
  },
  achievementText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  masterText: {
    color: "#B8860B",
  },
});
