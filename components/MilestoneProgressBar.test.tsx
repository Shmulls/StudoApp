import { render } from "@testing-library/react-native";
import React from "react";
import MilestoneProgressBar from "./MilestoneProgressBar";

// Mock Ionicons to avoid rendering issues
jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) => <>{props.name}</>,
}));

describe("MilestoneProgressBar", () => {
  it("renders correct level and stats for points", () => {
    const { getByText } = render(<MilestoneProgressBar points={65} />);
    // Should show "Advanced" level
    expect(getByText("Advanced")).toBeTruthy();
    // Should show current points and max points
    expect(getByText("65")).toBeTruthy();
    expect(getByText("/120")).toBeTruthy();
    // Should show correct percentage
    expect(getByText("54%")).toBeTruthy();
    // Should show points to next milestone
    expect(getByText("25")).toBeTruthy(); // 90 - 65 = 25
    // Should show "to next milestone" label
    expect(getByText("to next milestone")).toBeTruthy();
    // Should show "complete" label
    expect(getByText("complete")).toBeTruthy();
  });

  it("renders Champion level at max points", () => {
    const { getByText } = render(<MilestoneProgressBar points={120} />);
    expect(getByText("Champion")).toBeTruthy();
    expect(getByText("120")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
    expect(getByText("0")).toBeTruthy(); // No points to next milestone
  });

  it("renders Starter level at 0 points", () => {
    const { getByText } = render(<MilestoneProgressBar points={0} />);
    expect(getByText("Starter")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
    expect(getByText("0%")).toBeTruthy();
    expect(getByText("30")).toBeTruthy(); // 30 - 0 = 30
  });
});
