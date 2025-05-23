import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MilestoneProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const segments = 6; // Number of milestone segments
  const filled = Math.round((completed / total) * segments);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your progress now</Text>
      <View style={styles.barRow}>
        {[...Array(segments)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < filled ? styles.segmentFilled : styles.segmentEmpty,
            ]}
          />
        ))}
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.info}>
          {completed}/{total} Task Complete
        </Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    elevation: 2,
  },
  label: { fontWeight: "bold", fontSize: 16, marginBottom: 8, color: "#222" },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  segment: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 2 },
  segmentFilled: { backgroundColor: "#FAD961" },
  segmentEmpty: { backgroundColor: "#eee" },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  info: { color: "#888", fontSize: 13 },
  percent: { color: "#222", fontWeight: "bold", fontSize: 13 },
});
