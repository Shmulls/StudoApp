import Constants from "expo-constants";

const LOCATION_API_KEY =
  Constants.manifest?.extra?.EXPO_PUBLIC_LOCATION_API_KEY ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_LOCATION_API_KEY;

export async function searchLocation(query: string) {
  if (!LOCATION_API_KEY) throw new Error("Location API key is not defined.");
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    query
  )}&key=${LOCATION_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch locations.");
  const data = await response.json();
  console.log("Places API result:", data);
  if (data.status !== "OK") {
    console.warn("Places API error:", data.status, data.error_message);
    return [];
  }
  return data.predictions || [];
}

export async function getLocationDetails(placeId: string) {
  if (!LOCATION_API_KEY) throw new Error("Location API key is not defined.");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${LOCATION_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch location details.");
  const data = await response.json();
  return data.result;
}
