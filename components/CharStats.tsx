import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  barPercentage: 0.6,
  decimalPlaces: 0,
};

type Props = {
  open: number;
  closed: number;
  total: number;
  percent?: string;
  chartData: number[];
  chartLabels: string[];
  onTab?: (tab: "year" | "month") => void;
  tab?: "year" | "month";
};

export default function ChartStats({
  open,
  closed,
  total,
  percent = "+0%",
  chartData,
  chartLabels,
  onTab,
  tab = "year",
}: Props) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        paddingHorizontal: 24, // Add this for more space
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        overflow: "hidden",
        alignSelf: "center",
        width: screenWidth - 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
          Tasks
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{
              backgroundColor: tab === "year" ? "#222" : "#eee",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginRight: 6,
            }}
            onPress={() => onTab && onTab("year")}
          >
            <Text
              style={{
                color: tab === "year" ? "#fff" : "#333",
                fontWeight: "bold",
              }}
            >
              Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: tab === "month" ? "#222" : "#eee",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
            onPress={() => onTab && onTab("month")}
          >
            <Text
              style={{
                color: tab === "month" ? "#fff" : "#333",
                fontWeight: "bold",
              }}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text
        style={{
          fontSize: 36,
          fontWeight: "bold",
          color: "#222",
          marginTop: 8,
        }}
      >
        {total}
      </Text>
      <Text
        style={{
          color: "#4CAF50",
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 4,
        }}
      >
        {percent}
      </Text>
      <Text
        style={{
          color: "#888",
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        Tasks Created per {tab === "year" ? "Month" : "Day"}
      </Text>
      <BarChart
        data={{
          labels: chartLabels,
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 90} // Make chart narrower
        height={140}
        chartConfig={chartConfig}
        fromZero
        withInnerLines={false}
        showValuesOnTopOfBars={false}
        yAxisLabel=""
        yAxisSuffix=""
        style={{
          borderRadius: 16,
          alignSelf: "center",
          marginLeft: 15, // Center the chart in the card
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#222" }}>
            {open}
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>
            Open
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#222" }}>
            {closed}
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>
            Closed
          </Text>
        </View>
      </View>
    </View>
  );
}
