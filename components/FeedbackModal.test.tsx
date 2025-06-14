import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import FeedbackModal from "./FeedbackModal";

// Mock Ionicons to avoid rendering issues
jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) => <>{props.name}</>,
}));

describe("FeedbackModal", () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    feedback: "Great job!",
    setFeedback: jest.fn(),
    onSubmit: jest.fn(),
    loading: false,
    pointsReward: 3,
  };

  it("renders modal with correct title and points", () => {
    const { getByText } = render(<FeedbackModal {...baseProps} />);
    expect(getByText("Fantastic Work! 🎉")).toBeTruthy();
    // Use a regex or partial match for the dynamic points string
    expect(
      getByText(/earned \+3\s+points! Share your experience with us\./i)
    ).toBeTruthy();
    expect(getByText(/\+3\s+Points\s+Earned/i)).toBeTruthy();
    expect(getByText("How did it go?")).toBeTruthy();
  });

  it("calls onClose when close button is pressed", () => {
    const { getByTestId } = render(<FeedbackModal {...baseProps} />);
    fireEvent.press(getByTestId("close-modal-btn"));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls setFeedback on input change", () => {
    const { getByPlaceholderText } = render(<FeedbackModal {...baseProps} />);
    fireEvent.changeText(
      getByPlaceholderText(
        "Share your experience, challenges, or highlights..."
      ),
      "New feedback"
    );
    expect(baseProps.setFeedback).toHaveBeenCalledWith("New feedback");
  });

  it("calls onSubmit when Skip is pressed", () => {
    const { getByText } = render(<FeedbackModal {...baseProps} />);
    fireEvent.press(getByText("Skip"));
    expect(baseProps.onSubmit).toHaveBeenCalled();
  });

  it("calls onSubmit when Submit Feedback is pressed", () => {
    const { getByText } = render(<FeedbackModal {...baseProps} />);
    fireEvent.press(getByText("Submit Feedback"));
    expect(baseProps.onSubmit).toHaveBeenCalled();
  });

  it("shows loading state when loading is true", () => {
    const { getByText } = render(
      <FeedbackModal {...baseProps} loading={true} />
    );
    expect(getByText("Submitting...")).toBeTruthy();
  });
});
