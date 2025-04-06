import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { user, isLoaded } = useUser(); // Get user data
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Ensure the Root Layout is mounted before navigating
  useEffect(() => {
    setTimeout(() => setIsReady(true), 100); // Small delay to ensure mounting
  }, []);

  useEffect(() => {
    if (isLoaded && isReady) {
      console.log("🔍 User Loaded:", user);
      console.log("🔍 User role before refetch:", user?.unsafeMetadata?.role);

      // Check user role and redirect
      if (user?.unsafeMetadata?.role === "organization") {
        console.log("✅ Redirecting to Organization Feed...");
        router.replace("/(tabs)/organization-feed");
      } else {
        console.log("✅ Redirecting to Home Feed...");
        router.replace("/(tabs)/home");
      }
    }
  }, [isLoaded, isReady]);

  if (!isLoaded || !isReady) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return null;
}
