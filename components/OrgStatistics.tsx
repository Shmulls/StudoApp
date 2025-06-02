import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth - 40; // 20px margin on each side

export type OrgStatisticsProps = {
  open: number;
  closed: number;
  percent: number;
  chartData: number[];
  chartLabels: string[];
  tab: "day" | "week" | "month" | "year";
  onTab: (tab: "day" | "week" | "month" | "year") => void;
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
  style: { borderRadius: 16 },
  propsForBackgroundLines: { stroke: "#eee" },
};

const TABS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const OrgStatistics: React.FC<OrgStatisticsProps> = ({
  open,
  closed,
  percent,
  chartData,
  chartLabels,
  tab,
  onTab,
}) => {
  return (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      {/* Progress Donut */}
      <Text style={styles.sectionTitle}>Progress</Text>
      <View style={styles.progressRow}>
        <AnimatedCircularProgress
          size={110}
          width={14}
          fill={percent}
          tintColor="#FF9800"
          backgroundColor="#eee"
          rotation={0}
          lineCap="round"
        >
          {(fill: number) => (
            <Text style={styles.progressText}>{`${Math.round(fill)}%`}</Text>
          )}
        </AnimatedCircularProgress>
        <View style={{ marginLeft: 24 }}>
          <Text style={styles.progressLabel}>Open</Text>
          <Text style={[styles.progressValue, { color: "#FF9800" }]}>
            {open}
          </Text>
          <Text style={styles.progressLabel}>Closed</Text>
          <Text style={[styles.progressValue, { color: "#4CAF50" }]}>
            {closed}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => onTab(t.key as any)}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <Text style={styles.sectionTitle}>Tasks Opened By Me</Text>
      <BarChart
        data={{
          labels: chartLabels,
          datasets: [{ data: chartData }],
        }}
        width={CARD_WIDTH - 32} // 16px padding on each side inside the card
        height={180}
        fromZero
        chartConfig={chartConfig}
        style={{ borderRadius: 16, marginVertical: 8, overflow: "hidden" }}
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden", // Prevent chart overflow
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#222",
    marginTop: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  progressText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF9800",
    textAlign: "center",
  },
  progressLabel: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#f5f5f5",
  },
  tabActive: {
    backgroundColor: "#FF9800",
  },
  tabText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#fff",
  },
});

export default OrgStatistics;
