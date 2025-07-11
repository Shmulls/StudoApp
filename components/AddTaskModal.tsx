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
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_LOCATION_API_KEY;

type NewTask = {
  title: string;
  description: string;
  location: { type: "Point"; coordinates: [number, number] } | null;
  locationLabel: string;
  time: string;
  signedUp: boolean;
  pointsReward: number; // New field
  estimatedHours: number; // New field
};

type AddTaskModalProps = {
  visible: boolean;
  creating: boolean;
  newTask: NewTask;
  setNewTask: React.Dispatch<React.SetStateAction<NewTask>>;
  onClose: () => void;
  onCreate: () => void;
  user?: any; // Add user prop
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
  user, // Add user prop
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPointsDropdown, setShowPointsDropdown] = useState(false);
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);

  const pointsOptions = [1, 2, 3, 4];
  const hoursOptions = [1, 2, 3, 4];

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
      } else if (data.status === "ZERO_RESULTS") {
        // This is normal - just means no results found for the search term
        console.log("No results found for:", input);
        return [];
      } else {
        console.error("Places API error:", data.status, data.error_message);
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
      } else if (data.status === "ZERO_RESULTS") {
        console.log("No details found for place:", placeId);
        return null;
      } else {
        console.error(
          "Place details API error:",
          data.status,
          data.error_message
        );
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
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
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
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const taskData = {
      ...newTask,
      createdBy: user.id, // This should be the organization ID
    };

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
      pointsReward: 1, // Default to 1 point
      estimatedHours: 1, // Default to 1 hour
    });
    setQuery("");
    setSuggestions([]);
    setShowPointsDropdown(false);
    setShowHoursDropdown(false);
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

              {/* Reward & Time Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="gift-outline" size={20} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Reward & Time</Text>
                </View>

                {/* Points Reward Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Points Reward *</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setShowPointsDropdown(!showPointsDropdown);
                      setShowHoursDropdown(false);
                    }}
                  >
                    <Ionicons name="star-outline" size={20} color="#666" />
                    <View style={styles.dropdownContent}>
                      <Text style={styles.dropdownText}>
                        {newTask.pointsReward}{" "}
                        {newTask.pointsReward === 1 ? "Point" : "Points"}
                      </Text>
                      <Text style={styles.dropdownSubtext}>
                        How many points earned by this volunteering
                      </Text>
                    </View>
                    <Ionicons
                      name={showPointsDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>

                  {showPointsDropdown && (
                    <View style={styles.dropdownMenu}>
                      {pointsOptions.map((points) => (
                        <TouchableOpacity
                          key={points}
                          style={[
                            styles.dropdownOption,
                            newTask.pointsReward === points &&
                              styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setNewTask((t) => ({ ...t, pointsReward: points }));
                            setShowPointsDropdown(false);
                          }}
                        >
                          <View style={styles.optionContent}>
                            <Ionicons
                              name="star"
                              size={16}
                              color={
                                newTask.pointsReward === points
                                  ? "#FF9800"
                                  : "#999"
                              }
                            />
                            <Text
                              style={[
                                styles.optionText,
                                newTask.pointsReward === points &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              {points} {points === 1 ? "Point" : "Points"}
                            </Text>
                          </View>
                          {newTask.pointsReward === points && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#FF9800"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Estimated Hours Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estimated Time *</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setShowHoursDropdown(!showHoursDropdown);
                      setShowPointsDropdown(false);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <View style={styles.dropdownContent}>
                      <Text style={styles.dropdownText}>
                        {newTask.estimatedHours}{" "}
                        {newTask.estimatedHours === 1 ? "Hour" : "Hours"}
                      </Text>
                      <Text style={styles.dropdownSubtext}>
                        Estimated time for this volunteering
                      </Text>
                    </View>
                    <Ionicons
                      name={showHoursDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>

                  {showHoursDropdown && (
                    <View style={styles.dropdownMenu}>
                      {hoursOptions.map((hours) => (
                        <TouchableOpacity
                          key={hours}
                          style={[
                            styles.dropdownOption,
                            newTask.estimatedHours === hours &&
                              styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setNewTask((t) => ({
                              ...t,
                              estimatedHours: hours,
                            }));
                            setShowHoursDropdown(false);
                          }}
                        >
                          <View style={styles.optionContent}>
                            <Ionicons
                              name="time"
                              size={16}
                              color={
                                newTask.estimatedHours === hours
                                  ? "#FF9800"
                                  : "#999"
                              }
                            />
                            <Text
                              style={[
                                styles.optionText,
                                newTask.estimatedHours === hours &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              {hours} {hours === 1 ? "Hour" : "Hours"}
                            </Text>
                          </View>
                          {newTask.estimatedHours === hours && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#FF9800"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Date & Time Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#FF9800" />
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

                {/* Search status display */}
                {loading && query.length >= 3 && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF9800" />
                    <Text style={styles.loadingText}>
                      Searching locations...
                    </Text>
                  </View>
                )}

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

                {/* No results message - only show if no location is selected */}
                {query.length >= 3 &&
                  suggestions.length === 0 &&
                  !loading &&
                  !newTask.locationLabel && (
                    <View style={styles.noResultsContainer}>
                      <Ionicons name="search" size={20} color="#999" />
                      <Text style={styles.noResultsText}>
                        No locations found for "{query}"
                      </Text>
                      <Text style={styles.noResultsSubtext}>
                        Try a different search term or continue without location
                      </Text>
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
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#FF9800",
    fontWeight: "500",
    marginLeft: 8,
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownContent: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    marginBottom: 2,
  },
  dropdownSubtext: {
    fontSize: 12,
    color: "#666",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownOptionSelected: {
    backgroundColor: "#fff5f0",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 8,
  },
  optionTextSelected: {
    color: "#FF9800",
    fontWeight: "600",
  },
});

export default AddTaskModal;
