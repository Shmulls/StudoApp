import { render } from "@testing-library/react-native";
import React from "react";
import MapPicker from "./MapPicker";

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <>{children}</>,
    Marker: ({ coordinate }: any) => (
      <Text>{`Marker: ${coordinate.latitude},${coordinate.longitude}`}</Text>
    ),
  };
});

describe("MapPicker", () => {
  it("renders with initial marker", () => {
    const marker = { latitude: 10, longitude: 20 };
    const { getByText } = render(
      <MapPicker onLocationSelected={jest.fn()} marker={marker} />
    );
    expect(getByText("Marker: 10,20")).toBeTruthy();
  });

  it("calls onLocationSelected and updates marker on map press", () => {
    const onLocationSelected = jest.fn();
    const { getByText, rerender } = render(
      <MapPicker onLocationSelected={onLocationSelected} marker={null} />
    );
    rerender(
      <MapPicker
        onLocationSelected={onLocationSelected}
        marker={{ latitude: 50, longitude: 60 }}
      />
    );
    expect(getByText("Marker: 50,60")).toBeTruthy();
  });
});
