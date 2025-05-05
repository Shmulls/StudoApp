import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ensure headers are hidden if needed
      }}
    >
      {/* Home Screen */}
      <Stack.Screen name="home/index" />
      {/* Organization Feed Screen */}
      <Stack.Screen name="organization-feed/index" />
      {/* Organization Settings Screen */}
      <Stack.Screen name="organization-settings/index" />
      {/* Organization notification */}
      <Stack.Screen name="organization-notification/index" />
      {/* Settings Screen */}
      <Stack.Screen name="settings/index" />
      {/* Profile Screen */}
      <Stack.Screen name="profile/index" />
      {/* Notification Screen */}
      <Stack.Screen name="notification/index" />
      {/* Calendar Screen */}
      <Stack.Screen name="calendar/index" />
    </Stack>
  );
}
