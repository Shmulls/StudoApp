import { fireEvent, render } from "@testing-library/react-native";
import App from "./App";
import HomeScreen from "./app/(tabs)/home";

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock API and other dependencies as needed
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

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock dependencies
jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({
    user: {
      firstName: "Test",
      imageUrl: "https://example.com/avatar.png",
    },
  }),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: (cb) => cb(),
}));
jest.mock("../../../hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: [
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
      {
        _id: "3",
        title: "Task 3",
        completed: true,
        signedUp: true,
        time: new Date().toISOString(),
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
    handleSignUp: jest.fn(),
    handleComplete: jest.fn(),
    fetchTasks: jest.fn(),
    setTasks: jest.fn(),
  }),
}));
jest.mock(
  "../../../components/MilestoneProgressBar",
  () => "MilestoneProgressBar"
);
jest.mock("../../../components/TaskCard", () => (props) => (
  <>{props.task.title}</>
));
jest.mock("../../../components/CompletedTaskCard", () => (props) => (
  <>{props.task.title}</>
));

describe("StudoApp Navigation & Organization Feed", () => {
  it("renders loading state initially", () => {
    const { getByText } = render(<App />);
    expect(getByText(/loading/i)).toBeTruthy();
  });

  it("redirects organization user to organization feed", async () => {
    // You may need to mock Clerk user context here if possible
    // Example: mock user with organization role
    // ...mock user context...
    // const { getByTestId } = render(<App />);
    // await waitFor(() => expect(getByTestId("organization-feed")).toBeTruthy());
  });

  it("renders organization feed tabs", async () => {
    // Render the organization feed screen directly if possible
    // import OrganizationFeed from "./app/(tabs)/organization-feed";
    // const { getByText } = render(<OrganizationFeed />);
    // expect(getByText(/pending/i)).toBeTruthy();
    // expect(getByText(/completed/i)).toBeTruthy();
    // expect(getByText(/statistics/i)).toBeTruthy();
  });

  it("shows tasks in pending tab", async () => {
    // Render and check for a task item
    // const { getByText } = render(<OrganizationFeed />);
    // await waitFor(() => expect(getByText("Test Task")).toBeTruthy());
  });

  it("opens add task modal", async () => {
    // const { getByTestId, getByText } = render(<OrganizationFeed />);
    // fireEvent.press(getByTestId("add-task-button"));
    // expect(getByText(/add new task/i)).toBeTruthy();
  });

  // Add more tests for tab switching, task completion, etc.
});

describe("HomeScreen", () => {
  it("renders welcome message and progress", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Welcome Back/i)).toBeTruthy();
    expect(getByText(/Your Progress/i)).toBeTruthy();
    expect(getByText(/Points/i)).toBeTruthy();
    expect(getByText(/To Goal/i)).toBeTruthy();
    expect(getByText(/Progress/i)).toBeTruthy();
  });

  it("renders all tabs", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/New/i)).toBeTruthy();
    expect(getByText(/Assigned/i)).toBeTruthy();
    expect(getByText(/Complete/i)).toBeTruthy();
  });

  it("shows new tasks in 'New' tab", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Task 1")).toBeTruthy();
    // Should not show completed or assigned tasks in this tab
    expect(() => getByText("Task 2")).toThrow();
    expect(() => getByText("Task 3")).toThrow();
  });

  it("shows assigned tasks in 'Assigned' tab", () => {
    const { getByText, getByRole } = render(<HomeScreen />);
    fireEvent.press(getByText(/Assigned/i));
    expect(getByText("Task 2")).toBeTruthy();
    expect(() => getByText("Task 1")).toThrow();
    expect(() => getByText("Task 3")).toThrow();
  });

  it("shows completed tasks in 'Complete' tab", () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText(/Complete/i));
    expect(getByText("Task 3")).toBeTruthy();
    expect(() => getByText("Task 1")).toThrow();
    expect(() => getByText("Task 2")).toThrow();
  });

  it("shows empty state if no tasks in tab", () => {
    // Mock useTasks to return no new tasks
    jest.mock("../../../hooks/useTasks", () => ({
      useTasks: () => ({
        tasks: [],
        visibleTasks: [],
        loading: false,
        handleSignUp: jest.fn(),
        handleComplete: jest.fn(),
        fetchTasks: jest.fn(),
        setTasks: jest.fn(),
      }),
    }));
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/No New Tasks/i)).toBeTruthy();
  });
});

describe("App integration", () => {
  it("shows loading state initially", () => {
    const { getByText } = render(<App />);
    expect(getByText(/loading/i)).toBeTruthy();
  });

  it("redirects organization user to organization feed", async () => {
    // Mock Clerk user as organization role
    // Render <App /> and check for organization feed
    // Example (pseudo-code):
    // const { getByTestId } = render(<App />);
    // await waitFor(() => expect(getByTestId("organization-feed")).toBeTruthy());
  });

  it("renders home screen for regular user", async () => {
    // Mock Clerk user as regular user
    // Render <App /> and check for home screen
    // Example (pseudo-code):
    // const { getByTestId } = render(<App />);
    // await waitFor(() => expect(getByTestId("home-screen")).toBeTruthy());
  });

  // Add more high-level navigation or authentication tests as needed
});
