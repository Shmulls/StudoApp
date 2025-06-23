import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import OrgStatistics from "./OrgStatistics";

// Mock chart and circular progress libraries
jest.mock("react-native-chart-kit", () => ({
  BarChart: (props: any) => <>{`BarChart`}</>,
  LineChart: (props: any) => <>{`LineChart`}</>,
}));
jest.mock("react-native-circular-progress", () => ({
  AnimatedCircularProgress: (props: any) => (
    <>{props.children ? props.children(props.fill) : null}</>
  ),
}));
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

import { Alert } from "react-native";
jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

describe("OrgStatistics", () => {
  const baseProps = {
    open: 5,
    closed: 10,
    percent: 67,
    chartData: [1, 2, 3, 4, 5],
    chartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    tab: "week" as const,
    onTab: jest.fn(),
    averageCompletionTime: 3.2,
    overdueTasks: 2,
  };

  it("renders main statistics and charts", () => {
    const { getByText } = render(<OrgStatistics {...baseProps} />);
    expect(getByText("📊 Export Statistics")).toBeTruthy();
    expect(getByText("Progress Overview")).toBeTruthy();
    expect(getByText("Performance Metrics")).toBeTruthy();
    expect(getByText("Weekly Task Distribution")).toBeTruthy();
    expect(getByText("Weekly Patterns")).toBeTruthy(); // <-- updated
    expect(getByText("Quick Insights")).toBeTruthy();
    expect(getByText("Open")).toBeTruthy();
    expect(getByText("Closed")).toBeTruthy();
    expect(getByText("Overdue")).toBeTruthy();
    expect(getByText("Avg Completion")).toBeTruthy();
    expect(getByText("Total Tasks")).toBeTruthy();
    expect(getByText("Success Rate")).toBeTruthy();
    expect(getByText("Most Active")).toBeTruthy();
    expect(getByText("Peak Activity")).toBeTruthy();
    expect(getByText("Avg per Period")).toBeTruthy();
  });

  it("calls onTab when a tab is pressed", () => {
    const onTab = jest.fn();
    const { getByText } = render(
      <OrgStatistics {...baseProps} onTab={onTab} />
    );
    fireEvent.press(getByText("Month"));
    expect(onTab).toHaveBeenCalledWith("month");
  });

  it("shows export alert when export button is pressed", () => {
    const { getByText } = render(<OrgStatistics {...baseProps} />);
    fireEvent.press(getByText("📊 Export Statistics"));
    expect(require("react-native").Alert.alert).toHaveBeenCalled();
  });
});
