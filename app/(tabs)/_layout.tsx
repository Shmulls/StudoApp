import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (user?.unsafeMetadata?.role === "organization") {
        router.replace("/organization-feed");
      } else {
        router.replace("/home");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isSignedIn) {
    return <Redirect href="/auth" />;
  }

  // Optionally, show a loading indicator while user is loading
  if (!isLoaded) {
    return null;
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
