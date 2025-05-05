import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

interface CalendarEvent {
  id: string;
  summary: string;
}

WebBrowser.maybeCompleteAuthSession();

const CalendarScreen = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "456220226493-6grkmcec80b87r982jltf0k5hrfj12um.apps.googleusercontent.com",
    iosClientId:
      "456220226493-tgeeaclmr14n7926oc4m5pab1p56ha61.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@shmuells/expo-clerk-social-login", // Replace with your actual redirect URI
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      setAccessToken(authentication?.accessToken || null);
      AsyncStorage.setItem("accessToken", authentication?.accessToken || "");
    }
  }, [response]);

  const fetchEvents = async () => {
    if (!accessToken) return;

    try {
      const res = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setEvents(res.data.items);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {!accessToken ? (
        <Button
          title="Connect Google Calendar"
          onPress={() => promptAsync()}
          disabled={!request}
        />
      ) : (
        <Button title="Fetch Events" onPress={fetchEvents} />
      )}
      {events.length > 0 && (
        <View>
          <Text>Upcoming Events:</Text>
          {events.map((event) => (
            <Text key={event.id}>{event.summary}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default CalendarScreen;
