import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type ChartStatsProps = {
  open: number;
  closed: number;
  total: number;
  percent: string | number;
  chartData: number[];
  chartLabels: string[];
  tab: string;
  onTab: (tab: string) => void;
};

const ChartStats: React.FC<ChartStatsProps> = ({
  open,
  closed,
  total,
  percent,
  chartData,
  chartLabels,
  tab,
  onTab,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.title}>Tasks</Text>
      <View style={styles.percentBadge}>
        <Text style={styles.percentText}>{percent}</Text>
      </View>
    </View>
    <View style={{ marginVertical: 10, width: "90%", alignSelf: "center" }}>
      <BarChart
        data={chartData.map((v, i) => ({ value: v, label: chartLabels[i] }))}
        barWidth={3}
        barBorderRadius={9}
        frontColor="#FF9800"
        xAxisLabelTextStyle={{ fontSize: 10 }}
        isAnimated
      />
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{open}</Text>
        <Text style={styles.statLabel}>Open</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{closed}</Text>
        <Text style={styles.statLabel}>Closed</Text>
      </View>
      {/* Add more stats if needed */}
    </View>
    <View style={styles.tabRow}>
      <Text
        style={[styles.tab, tab === "year" && styles.tabActive]}
        onPress={() => onTab("year")}
      >
        Year
      </Text>
      <Text
        style={[styles.tab, tab === "month" && styles.tabActive]}
        onPress={() => onTab("month")}
      >
        Month
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  percentBadge: {
    backgroundColor: "#E0F7FA",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: { color: "#26C6DA", fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 13, color: "#888" },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#888",
    fontWeight: "bold",
    marginHorizontal: 4,
    backgroundColor: "#F5F5F5",
  },
  tabActive: {
    backgroundColor: "#FF9800",
    color: "#fff",
  },
});

export default ChartStats;
