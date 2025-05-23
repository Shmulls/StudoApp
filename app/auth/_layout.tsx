import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack, usePathname } from "expo-router";

export default function AuthLayout() {
  const { user } = useUser();
  const pathName = usePathname();
  const { isSignedIn } = useAuth();

  if (isSignedIn && pathName === "/auth") {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // This hides the header for the login screen
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false, // This hides the header for the signup screen
        }}
      />
      <Stack.Screen
        name="signup-organization"
        options={{
          headerShown: false, // This hides the header for the organization signup screen
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
