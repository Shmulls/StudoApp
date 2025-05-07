import * as Calendar from "expo-calendar";
import { Task } from "../types/task";

export const addTaskToCalendar = async (task: Task) => {
  try {
    // Request calendar permissions
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    console.log("Calendar permission status:", status);
    if (status !== "granted") {
      console.error("Calendar permissions not granted");
      return;
    }

    // Get default calendar
    const calendars = await Calendar.getCalendarsAsync();
    console.log("Available calendars:", calendars);
    const defaultCalendar = calendars.find(
      (cal) => cal.isPrimary || cal.source.name === "Default"
    );

    if (!defaultCalendar) {
      console.error("No default calendar found");
      return;
    }

    // Validate task time
    console.log("Task time:", task.time);
    const startDate = new Date(task.time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Create a new event
    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: task.title,
      startDate,
      endDate,
      timeZone: "GMT",
      location: task.location,
      notes: task.description,
    });

    console.log("Event created successfully with ID:", eventId);
  } catch (error) {
    console.error("Error adding task to calendar:", error);
  }
};
