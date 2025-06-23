module.exports = {
  expo: {
    name: "Studo",
    slug: "expo-clerk-social-login",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.shmuells.studo",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app needs access to your location to show nearby tasks.",
      },
    },
    android: {
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_CALENDAR",
        "android.permission.WRITE_CALENDAR",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
      ],
      package: "com.shmuells.studo",
      softwareKeyboardLayoutMode: "adjustResize", // ✅ Add this for Android keyboard
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app needs access to your photos to let you choose a profile picture.",
        },
      ],
      [
        "expo-calendar",
        {
          calendarPermission: "Allow $(PRODUCT_NAME) to access your calendar.",
        },
      ],
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#FF9800",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // Add EAS Update configuration
    updates: {
      url: "https://u.expo.dev/6d073ad7-adc0-4c55-9c80-833430242731",
    },
    runtimeVersion: "1.0.0",
    extra: {
      // ✅ Remove sensitive data from config
      router: {
        origin: false,
      },
      eas: {
        projectId: "6d073ad7-adc0-4c55-9c80-833430242731",
      },
    },
    sdkVersion: "53.0.0",
  },
};
