import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import TaskCard from "./TaskCard";

// Mock useUser from Clerk
jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({
    user: {
      id: "user123",
      fullName: "Test User",
      firstName: "Test",
      imageUrl: "http://example.com/avatar.png",
    },
  }),
}));

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) => <>{props.name}</>,
}));

// Mock FeedbackModal
jest.mock("./FeedbackModal", () => (props: any) => {
  return props.visible ? <>{`FeedbackModal`}</> : null;
});

const mockTask = {
  _id: "task1",
  title: "Test Task",
  description: "This is a test task.",
  time: new Date().toISOString(),
  pointsReward: 5,
  signedUp: false,
  estimatedHours: 2,
  locationLabel: "Test Location",
  location: {
    type: "Point" as "Point",
    coordinates: [-74.006, 40.7128] as [number, number],
  }, // mock location object
  completed: false, // mock completed status
  createdBy: "user123", // mock createdBy user id
};

describe("TaskCard", () => {
  it("renders task title, description, and reward", () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    expect(getByText("Test Task")).toBeTruthy();
    expect(getByText("This is a test task.")).toBeTruthy();
    expect(getByText("+5")).toBeTruthy();
    expect(getByText("2h")).toBeTruthy();
    expect(getByText("Test Location")).toBeTruthy();
  });

  it("calls onSignUp when Register is pressed", () => {
    const onSignUp = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTask} onSignUp={onSignUp} />
    );
    fireEvent.press(getByText("Join Task"));
    expect(onSignUp).toHaveBeenCalledWith("task1");
  });

  it("shows Complete and Cancel buttons when signedUp is true", () => {
    const task = { ...mockTask, signedUp: true };
    const { getByText } = render(<TaskCard task={task} />);
    expect(getByText("Complete")).toBeTruthy();
  });
});
