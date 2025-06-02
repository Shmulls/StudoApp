import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = "AIzaSyAjyYxXChjy1vRsJqanVMJxjieY1cOCHLA";

type NewTask = {
  title: string;
  description: string;
  location: { type: "Point"; coordinates: [number, number] } | null;
  locationLabel: string;
  time: string;
  signedUp: boolean;
};

type AddTaskModalProps = {
  visible: boolean;
  creating: boolean;
  newTask: NewTask;
  setNewTask: React.Dispatch<React.SetStateAction<NewTask>>;
  onClose: () => void;
  onCreate: () => void;
};

type PlaceSuggestion = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  creating,
  newTask,
  setNewTask,
  onClose,
  onCreate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Google Places Autocomplete API
  const searchLocation = async (input: string): Promise<PlaceSuggestion[]> => {
    if (!input || input.length < 3) return [];

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&key=${GOOGLE_PLACES_API_KEY}&types=establishment|geocode&language=en`
      );

      const data = await response.json();

      if (data.status === "OK") {
        return data.predictions || [];
      } else {
        console.error("Places API error:", data.status);
        return [];
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    }
  };

  // Get place details to get coordinates
  const getLocationDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_PLACES_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK") {
        return data.result;
      } else {
        console.error("Place details API error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const handleSearch = async (text: string) => {
    setQuery(text);

    // Update the location label in real-time
    setNewTask((t) => ({ ...t, locationLabel: text }));

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchLocation(text);
      setSuggestions(results);
    } catch (e) {
      console.error("Search error:", e);
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleSelect = async (item: PlaceSuggestion) => {
    setQuery(item.description);
    setSuggestions([]);
    setLoading(true);

    try {
      const details = await getLocationDetails(item.place_id);
      if (details?.geometry?.location) {
        setNewTask((t) => ({
          ...t,
          locationLabel: item.description,
          location: {
            type: "Point",
            coordinates: [
              details.geometry.location.lng,
              details.geometry.location.lat,
            ],
          },
        }));
      } else {
        // If we can't get coordinates, just use the address
        setNewTask((t) => ({
          ...t,
          locationLabel: item.description,
        }));
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      // Fallback to just the address
      setNewTask((t) => ({
        ...t,
        locationLabel: item.description,
      }));
    }

    setLoading(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert("Missing Title", "Please enter a task title");
      return;
    }
    if (!newTask.description.trim()) {
      Alert.alert("Missing Description", "Please enter a task description");
      return;
    }
    if (!newTask.time) {
      Alert.alert("Missing Date", "Please select a date and time");
      return;
    }
    onCreate();
  };

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      location: null,
      locationLabel: "",
      time: "",
      signedUp: false,
    });
    setQuery("");
    setSuggestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearLocation = () => {
    setQuery("");
    setSuggestions([]);
    setNewTask((t) => ({
      ...t,
      locationLabel: "",
      location: null,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="add-circle" size={24} color="#FF9800" />
              </View>
              <Text style={styles.modalTitle}>Create New Task</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Task Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#FF9800"
                  />
                  <Text style={styles.sectionTitle}>Task Details</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Task Title *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="text-outline" size={20} color="#666" />
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Enter task title"
                      placeholderTextColor="#999"
                      value={newTask.title}
                      onChangeText={(text) =>
                        setNewTask((t) => ({ ...t, title: text }))
                      }
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <View
                    style={[styles.inputContainer, styles.textAreaContainer]}
                  >
                    <Ionicons
                      name="document-outline"
                      size={20}
                      color="#666"
                      style={styles.textAreaIcon}
                    />
                    <TextInput
                      style={[styles.modernInput, styles.textArea]}
                      placeholder="Describe the task in detail..."
                      placeholderTextColor="#999"
                      value={newTask.description}
                      onChangeText={(text) =>
                        setNewTask((t) => ({ ...t, description: text }))
                      }
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>

              {/* Date & Time Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Schedule</Text>
                </View>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <View style={styles.dateTimeContent}>
                    <Text style={styles.dateTimeLabel}>Date & Time *</Text>
                    <Text
                      style={[
                        styles.dateTimeText,
                        !newTask.time && styles.placeholderText,
                      ]}
                    >
                      {newTask.time
                        ? new Date(newTask.time).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Select date and time"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Location Section (Optional) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location-outline" size={20} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Location (Optional)</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="search-outline" size={20} color="#666" />
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Search for a location..."
                      placeholderTextColor="#999"
                      value={query}
                      onChangeText={handleSearch}
                    />
                    {loading && (
                      <ActivityIndicator size="small" color="#FF9800" />
                    )}
                    {query.length > 0 && (
                      <TouchableOpacity
                        onPress={clearLocation}
                        style={styles.clearButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Location Suggestions - Now using ScrollView instead of FlatList */}
                {suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView
                      style={styles.suggestionsList}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={false}
                    >
                      {suggestions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          style={styles.suggestionItem}
                          onPress={() => handleSelect(item)}
                        >
                          <Ionicons name="location" size={16} color="#FF9800" />
                          <View style={styles.suggestionContent}>
                            <Text
                              style={styles.suggestionMainText}
                              numberOfLines={1}
                            >
                              {item.structured_formatting?.main_text ||
                                item.description}
                            </Text>
                            <Text
                              style={styles.suggestionSecondaryText}
                              numberOfLines={1}
                            >
                              {item.structured_formatting?.secondary_text || ""}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#999"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Selected Location Display */}
                {newTask.locationLabel && suggestions.length === 0 && (
                  <View style={styles.selectedLocationContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                    <Text style={styles.selectedLocationText} numberOfLines={2}>
                      {newTask.locationLabel}
                    </Text>
                    <TouchableOpacity onPress={clearLocation}>
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={creating}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                creating && styles.createButtonDisabled,
              ]}
              onPress={handleCreateTask}
              disabled={creating}
              activeOpacity={0.8}
            >
              <View style={styles.createButtonContent}>
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="add-circle" size={20} color="#fff" />
                )}
                <Text style={styles.createButtonText}>
                  {creating ? "Creating..." : "Create Task"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Date Time Picker */}
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="datetime"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setNewTask((t) => ({
                ...t,
                time: date.toISOString(),
              }));
            }}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff5f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textAreaIcon: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    marginLeft: 12,
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    marginLeft: 12,
  },
  clearButton: {
    marginLeft: 8,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateTimeContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#222",
  },
  placeholderText: {
    color: "#999",
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 8,
    maxHeight: 180, // Reduced height to prevent overflow
    overflow: "hidden",
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  suggestionSecondaryText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  createButton: {
    flex: 2,
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9800",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default AddTaskModal;
