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
      <Stack.Screen name="home/index" /> {/* Home Screen */}
      <Stack.Screen name="settings/index" /> {/* Settings Screen */}
    </Stack>
  );
}
