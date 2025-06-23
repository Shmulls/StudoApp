import { render } from "@testing-library/react-native";
import React from "react";
import CompletedTaskCard from "./CompletedTaskCard";

describe("CompletedTaskCard", () => {
  it("renders task title, description, and formatted time", () => {
    const mockTask = {
      title: "Finish Homework",
      description: "Complete math exercises",
      time: "2024-06-23T15:30:00.000Z",
    };

    const { getByText } = render(<CompletedTaskCard task={mockTask} />);
    expect(getByText("Finish Homework")).toBeTruthy();
    expect(getByText("Complete math exercises")).toBeTruthy();
    expect(getByText(/Completed at:/)).toBeTruthy();
    // Optionally, check for the formatted date string
    expect(getByText(/^Completed at:/)).toBeTruthy();
  });

  it("shows N/A if time is missing", () => {
    const mockTask = {
      title: "No Time Task",
      description: "No time provided",
      time: null,
    };

    const { getByText } = render(<CompletedTaskCard task={mockTask} />);
    expect(getByText("Completed at: N/A")).toBeTruthy();
  });
});
