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

  const percentage =
    maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0;
  const milestones = [30, 60, 90, 120];

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: percentage / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage, progressAnimation]);

  const getProgressColor = () => {
    if (points >= 120) return "#4CAF50";
    if (points >= 90) return "#FF9800";
    if (points >= 60) return "#2196F3";
    if (points >= 30) return "#9C27B0";
    return "#FFC107";
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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Your Progress</Text>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelText, { color: getProgressColor() }]}>
              {getCurrentLevel()}
            </Text>
          </View>
        </View>
        <View style={styles.pointsDisplay}>
          <Text style={[styles.currentPoints, { color: getProgressColor() }]}>
            {points}
          </Text>
          <Text style={styles.maxPoints}>/{maxPoints}</Text>
        </View>
      </View>

      {/* Compact Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
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

          {/* Compact Milestone Dots */}
          {milestones.map((milestone) => {
            const milestonePercentage = (milestone / maxPoints) * 100;
            const isAchieved = points >= milestone;

            return (
              <View
                key={milestone}
                style={[
                  styles.milestone,
                  {
                    left: `${milestonePercentage}%`,
                    backgroundColor: isAchieved ? getProgressColor() : "#fff",
                    borderColor: isAchieved ? getProgressColor() : "#ddd",
                    transform: [{ translateX: -4 }],
                  },
                ]}
              >
                {isAchieved && (
                  <Ionicons name="checkmark" size={6} color="#fff" />
                )}
              </View>
            );
          })}
        </View>

        {/* Compact Stats Row */}
        <View style={styles.statsRow}>
          <Text style={styles.progressText}>
            {Math.round(percentage)}% Complete
          </Text>
          {points < maxPoints && (
            <Text style={styles.nextMilestoneText}>
              {pointsToNext} to next milestone
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default MilestoneProgressBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 12,
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
    fontWeight: "600",
  },
  pointsDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentPoints: {
    fontSize: 20,
    fontWeight: "800",
  },
  maxPoints: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  progressSection: {
    gap: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    position: "relative",
    overflow: "visible",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    position: "relative",
  },
  milestone: {
    position: "absolute",
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  nextMilestoneText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
