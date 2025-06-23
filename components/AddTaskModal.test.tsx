import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import AddTaskModal from "./AddTaskModal";

// Mock Ionicons to avoid rendering issues
jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) => <>{props.name}</>,
}));

// Mock DateTimePickerModal
jest.mock(
  "react-native-modal-datetime-picker",
  () => (props: any) => props.isVisible ? <>{"DateTimePickerModal"}</> : null
);

describe("AddTaskModal", () => {
  const baseTask = {
    title: "",
    description: "",
    location: null,
    locationLabel: "",
    time: "",
    signedUp: false,
    pointsReward: 1,
    estimatedHours: 1,
  };

  const setNewTask = jest.fn();
  const onClose = jest.fn();
  const onCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal and header", () => {
    const { getByText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    expect(getByText("Create New Task")).toBeTruthy();
    expect(getByText("Task Details")).toBeTruthy();
    expect(getByText("Reward & Time")).toBeTruthy();
    expect(getByText("Schedule")).toBeTruthy();
    expect(getByText("Location (Optional)")).toBeTruthy();
  });

  it("calls setNewTask when title is changed", () => {
    const { getByPlaceholderText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.changeText(
      getByPlaceholderText("Enter task title"),
      "Test Title"
    );
    expect(setNewTask).toHaveBeenCalled();
  });

  it("calls setNewTask when description is changed", () => {
    const { getByPlaceholderText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.changeText(
      getByPlaceholderText("Describe the task in detail..."),
      "Test Description"
    );
    expect(setNewTask).toHaveBeenCalled();
  });

  it("opens and selects points reward dropdown", async () => {
    const { getByText, queryByText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.press(getByText(/1 Point/));
    await waitFor(() => expect(queryByText("2 Points")).toBeTruthy());
    fireEvent.press(getByText("2 Points"));
    expect(setNewTask).toHaveBeenCalled();
  });

  it("opens and selects estimated hours dropdown", async () => {
    const { getByText, queryByText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.press(getByText(/1 Hour/));
    await waitFor(() => expect(queryByText("2 Hours")).toBeTruthy());
    fireEvent.press(getByText("2 Hours"));
    expect(setNewTask).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is pressed", () => {
    const { getByText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={baseTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onCreate when Create Task is pressed and fields are filled", () => {
    const filledTask = {
      ...baseTask,
      title: "Test",
      description: "Test desc",
      time: new Date().toISOString(),
      locationLabel: "Test Location",
      // Add any other required fields here
    };
    const { getByText } = render(
      <AddTaskModal
        visible={true}
        creating={false}
        newTask={filledTask}
        setNewTask={setNewTask}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    fireEvent.press(getByText("Create Task"));
    expect(onCreate).toHaveBeenCalled();
  });
});
