import { UserResource } from "@clerk/types";
import { router } from "expo-router";

export function goHome(user: UserResource | null | undefined) {
  if (user?.unsafeMetadata?.role === "organization") {
    router.push("/(tabs)/organization-feed");
  } else {
    router.push("/(tabs)/home");
  }
}
