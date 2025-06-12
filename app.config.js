export default {
  expo: {
    // ...other config...
    plugins: ["expo-asset"],
    extra: {
      EXPO_PUBLIC_LOCATION_API_KEY: "AIzaSyAjyYxXChjy1vRsJqanVMJxjieY1cOCHLA",
      eas: {
        projectId: "6d073ad7-adc0-4c55-9c80-833430242731",
      },
    },
    ios: {
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app needs access to your location to show nearby tasks.",
      },
    },
    android: {
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
  },
};
