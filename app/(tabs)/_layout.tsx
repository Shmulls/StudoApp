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
        headerShown: false,
      }}
    >
      <Stack.Screen name="home/index" />
      <Stack.Screen name="organization-feed/index" />
      <Stack.Screen name="organization-settings/index" />
      <Stack.Screen name="organization-notification/index" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="notification/index" />
    </Stack>
  );
}
