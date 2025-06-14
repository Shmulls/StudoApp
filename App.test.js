import { fireEvent, render } from "@testing-library/react-native";
import App from "./App";
import HomeScreen from "./app/(tabs)/home";
import React from "react";

// Fix the animated mock - this is the correct path
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })
  ),
}));

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock API and other dependencies
jest.mock("./api", () => ({
  fetchTasks: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          _id: "1",
          title: "Test Task",
          completed: false,
          time: new Date().toISOString(),
        },
      ],
    })
  ),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTask: jest.fn(),
}));

// Mock dependencies
jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({
    user: {
      id: "test-user",
      firstName: "Test",
      lastName: "User",
      imageUrl: "https://example.com/avatar.png",
      publicMetadata: { role: "user" },
    },
  }),
  useAuth: () => ({
    isSignedIn: true,
    userId: "test-user",
  }),
  ClerkProvider: ({ children }) => children,
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Stack: ({ children }) => children,
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback) => callback(),
}));
jest.mock("./hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: [
      {
        _id: "1",
        title: "Task 1",
        completed: false,
        signedUp: false,
        time: new Date().toISOString(),
        pointsReward: 10,
        estimatedHours: 2,
      },
      {
        _id: "2",
        title: "Task 2",
        completed: false,
        signedUp: true,
        time: new Date().toISOString(),
        pointsReward: 15,
        estimatedHours: 3,
      },
      {
        _id: "3",
        title: "Task 3",
        completed: true,
        signedUp: true,
        time: new Date().toISOString(),
        pointsReward: 20,
        estimatedHours: 1,
      },
    ],
    visibleTasks: [
      {
        _id: "1",
        title: "Task 1",
        completed: false,
        signedUp: false,
        time: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Task 2",
        completed: false,
        signedUp: true,
        time: new Date().toISOString(),
      },
    ],
    loading: false,
    refreshing: false,
    handleSignUp: jest.fn(),
    handleComplete: jest.fn(),
    fetchTasks: jest.fn(),
    setTasks: jest.fn(),
    onRefresh: jest.fn(),
  }),
}));
jest.mock("./components/MilestoneProgressBar", () => {
  return function MilestoneProgressBar() {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, "Progress Bar");
  };
});
jest.mock("./components/TaskCard", () => {
  return function TaskCard({ task }) {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, task.title);
  };
});
jest.mock("./components/CompletedTaskCard", () => {
  return function CompletedTaskCard({ task }) {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, task.title);
  };
});

describe("HomeScreen", () => {
  it("renders welcome message", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Welcome Back/i)).toBeTruthy();
  });

  it("renders progress section", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Your Progress/i)).toBeTruthy();
  });

  it("renders tab navigation", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Available/i)).toBeTruthy();
    expect(getByText(/My Tasks/i)).toBeTruthy();
    expect(getByText(/Completed/i)).toBeTruthy();
  });
});

describe("App", () => {
  it("should render without crashing", () => {
    // Simple test to ensure the app can be imported
    expect(App).toBeDefined();
  });
});
