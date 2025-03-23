import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text, TextInput } from "react-native";
import App from "./App";

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe("StudoApp Component Tests", () => {
  // Check if the welcome message renders
  it("renders welcome message", () => {
    const { getByText } = render(<App />);
    expect(getByText("Welcome to StudoApp")).toBeTruthy();
  });

  // Check if a button renders correctly
  it("renders the Get Started button", () => {
    const { getByText } = render(<App />);
    expect(getByText("Get Started")).toBeTruthy();
  });

  // Simulate a button press and check for action
  it("responds to button press", () => {
    const { getByText } = render(<App />);
    const button = getByText("Get Started");
    fireEvent.press(button);
    // Example assertion (update based on actual action)
    expect(getByText("Sign Up")).toBeTruthy();
  });

  // Check if TextInput field works correctly
  it("updates text input correctly", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <TextInput placeholder="Enter your name" />
    );
    const input = getByPlaceholderText("Enter your name");
    fireEvent.changeText(input, "Shmuel");
    expect(getByDisplayValue("Shmuel")).toBeTruthy();
  });

  // Ensure conditional content renders
  it("renders conditional text based on props", () => {
    const TestComponent = ({ isLoggedIn }) => (
      <Text>{isLoggedIn ? "Welcome back!" : "Please log in."}</Text>
    );
    const { getByText, rerender } = render(
      <TestComponent isLoggedIn={false} />
    );
    expect(getByText("Please log in.")).toBeTruthy();

    // Rerender with updated props
    rerender(<TestComponent isLoggedIn={true} />);
    expect(getByText("Welcome back!")).toBeTruthy();
  });

  // Check if navigation is triggered (if using React Navigation)
  it("navigates to SignUp screen on button press", () => {
    const navigate = jest.fn();
    jest.mock("@react-navigation/native", () => ({
      useNavigation: () => ({
        navigate,
      }),
    }));

    const { getByText } = render(<App />);
    const button = getByText("Sign Up");
    fireEvent.press(button);
    expect(navigate).toHaveBeenCalledWith("SignUp");
  });
});
