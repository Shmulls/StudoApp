import Clipboard from "@react-native-clipboard/clipboard";
import React from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
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
  averageCompletionTime: number;
  overdueTasks: number;
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
  style: { borderRadius: 16 },
  propsForBackgroundLines: { stroke: "#eee" },
  fillShadowGradient: "#FF9800",
  fillShadowGradientOpacity: 0.3,
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
  averageCompletionTime,
  overdueTasks,
}) => {
  // Ensure chart data has at least one value
  const safeChartData = chartData.length > 0 ? chartData : [1, 2, 3, 4, 5];
  const safeChartLabels = chartLabels.length > 0 ? chartLabels : ["No Data"];

  const getChartTitle = () => {
    switch (tab) {
      case "year":
        return "Yearly Task Growth";
      case "month":
        return "Monthly Task Activity";
      case "week":
        return "Weekly Task Distribution";
      case "day":
        return "Daily Activity Pattern";
      default:
        return "Task Activity";
    }
  };

  const getTrendTitle = () => {
    switch (tab) {
      case "year":
        return "Growth Trends";
      case "month":
        return "Monthly Trends";
      case "week":
        return "Weekly Patterns";
      case "day":
        return "Hourly Distribution";
      default:
        return "Activity Trends";
    }
  };

  const exportStatistics = async () => {
    try {
      const statsData = {
        exportDate: new Date().toISOString(),
        period: tab,
        summary: {
          openTasks: open,
          closedTasks: closed,
          completionPercent: percent,
          totalTasks: open + closed,
          overdueTasks: overdueTasks,
          averageCompletionTime: averageCompletionTime,
          successRate:
            open + closed > 0
              ? Math.round((closed / (open + closed)) * 100)
              : 0,
        },
        chartData: {
          labels: chartLabels,
          values: chartData,
        },
        insights: {
          peakActivity: Math.max(...safeChartData),
          averagePerPeriod: (
            safeChartData.reduce((a, b) => a + b, 0) / safeChartData.length
          ).toFixed(1),
          mostActive:
            tab === "day"
              ? "Afternoon"
              : tab === "week"
              ? "Weekdays"
              : tab === "month"
              ? "Mid-month"
              : "Recent Years",
        },
      };

      const csvContent = generateCSV(statsData);
      const jsonContent = JSON.stringify(statsData, null, 2);

      // Show export options
      Alert.alert("Export Statistics", "Choose export format:", [
        {
          text: "Copy CSV",
          onPress: () => copyToClipboard(csvContent, "CSV"),
        },
        {
          text: "Copy JSON",
          onPress: () => copyToClipboard(jsonContent, "JSON"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } catch (error) {
      Alert.alert("Export Error", "Failed to export statistics");
    }
  };

  const generateCSV = (data: any) => {
    const headers = "Metric,Value\n";
    const summaryData = [
      `Export Date,${new Date(data.exportDate).toLocaleDateString()}`,
      `Period,${data.period}`,
      `Open Tasks,${data.summary.openTasks}`,
      `Closed Tasks,${data.summary.closedTasks}`,
      `Completion Percent,${data.summary.completionPercent}%`,
      `Total Tasks,${data.summary.totalTasks}`,
      `Overdue Tasks,${data.summary.overdueTasks}`,
      `Average Completion Time,${data.summary.averageCompletionTime}h`,
      `Success Rate,${data.summary.successRate}%`,
      `Peak Activity,${data.insights.peakActivity}`,
      `Average Per Period,${data.insights.averagePerPeriod}`,
      `Most Active,${data.insights.mostActive}`,
    ].join("\n");

    const chartHeaders = "\n\nChart Data\nLabel,Value\n";
    const chartData = data.chartData.labels
      .map(
        (label: string, index: number) =>
          `${label},${data.chartData.values[index] || 0}`
      )
      .join("\n");

    return headers + summaryData + chartHeaders + chartData;
  };

  const copyToClipboard = async (content: string, format: string) => {
    try {
      await Clipboard.setString(content);
      Alert.alert(
        "Copied!",
        `${format} data has been copied to clipboard. You can paste it into any spreadsheet app, email, or document.`,
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        {/* Export Button */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={exportStatistics}
        >
          <Text style={styles.exportButtonText}>📊 Export Statistics</Text>
        </TouchableOpacity>

        {/* Progress Overview */}
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressRow}>
          {/* Modern Circular Progress */}
          <View style={styles.circularProgressContainer}>
            <AnimatedCircularProgress
              size={120}
              width={8}
              fill={percent}
              tintColor="#FF9800"
              backgroundColor="#f0f0f0"
              rotation={0}
              lineCap="round"
            >
              {(fill: number) => (
                <View style={styles.circularProgressContent}>
                  <Text style={styles.progressText}>{`${Math.round(
                    fill
                  )}%`}</Text>
                  <Text style={styles.progressSubtext}>Complete</Text>
                </View>
              )}
            </AnimatedCircularProgress>

            {/* Modern Mini Circles for Stats */}
            <View style={styles.miniCirclesContainer}>
              <View style={styles.miniCircleRow}>
                <View style={[styles.miniCircle, styles.openCircle]}>
                  <Text style={styles.miniCircleNumber}>{open}</Text>
                </View>
                <Text style={styles.miniCircleLabel}>Open</Text>
              </View>

              <View style={styles.miniCircleRow}>
                <View style={[styles.miniCircle, styles.closedCircle]}>
                  <Text style={styles.miniCircleNumber}>{closed}</Text>
                </View>
                <Text style={styles.miniCircleLabel}>Closed</Text>
              </View>

              <View style={styles.miniCircleRow}>
                <View style={[styles.miniCircle, styles.overdueCircle]}>
                  <Text style={styles.miniCircleNumber}>{overdueTasks}</Text>
                </View>
                <Text style={styles.miniCircleLabel}>Overdue</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Avg Completion</Text>
            <Text style={styles.metricValue}>
              {averageCompletionTime.toFixed(1)}h
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Tasks</Text>
            <Text style={styles.metricValue}>{open + closed}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Success Rate</Text>
            <Text style={styles.metricValue}>
              {open + closed > 0
                ? Math.round((closed / (open + closed)) * 100)
                : 0}
              %
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
        <Text style={styles.sectionTitle}>{getChartTitle()}</Text>
        <BarChart
          data={{
            labels: safeChartLabels,
            datasets: [{ data: safeChartData }],
          }}
          width={CARD_WIDTH - 32}
          height={200}
          fromZero
          chartConfig={chartConfig}
          style={styles.chartStyle}
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
        />

        {/* Historical Trends */}
        <Text style={styles.sectionTitle}>{getTrendTitle()}</Text>
        <LineChart
          data={{
            labels: safeChartLabels,
            datasets: [
              {
                data: safeChartData,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={CARD_WIDTH - 32}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          }}
          style={styles.chartStyle}
          bezier
          withDots={true}
          withInnerLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />

        {/* Additional Insights */}
        <Text style={styles.sectionTitle}>Quick Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Most Active</Text>
            <Text style={styles.insightValue}>
              {tab === "day"
                ? "Afternoon"
                : tab === "week"
                ? "Weekdays"
                : tab === "month"
                ? "Mid-month"
                : "Recent Years"}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Peak Activity</Text>
            <Text style={styles.insightValue}>
              {Math.max(...safeChartData)} tasks
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Avg per Period</Text>
            <Text style={styles.insightValue}>
              {(
                safeChartData.reduce((a, b) => a + b, 0) / safeChartData.length
              ).toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#222",
    marginTop: 16,
  },
  progressRow: {
    alignItems: "center",
    marginBottom: 10,
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  circularProgressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF9800",
    textAlign: "center",
  },
  progressSubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  miniCirclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  miniCircleRow: {
    alignItems: "center",
    flex: 1,
  },
  miniCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  openCircle: {
    backgroundColor: "#FF9800",
  },
  closedCircle: {
    backgroundColor: "#4CAF50",
  },
  overdueCircle: {
    backgroundColor: "#F44336",
  },
  miniCircleNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  miniCircleLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: "#FF9800",
  },
  tabText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#fff",
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: "center",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginVertical: 8,
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
    fontStyle: "italic",
  },
  insightsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightItem: {
    alignItems: "center",
    flex: 1,
  },
  insightLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  insightValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
    textAlign: "center",
  },
  exportButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrgStatistics;
