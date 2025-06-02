import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getLocationDetails, searchLocation } from "../services/locationApi";
import MapPicker from "./MapPicker";

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
  styles: any;
};

type PlaceSuggestion = {
  place_id: string;
  description: string;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  creating,
  newTask,
  setNewTask,
  onClose,
  onCreate,
  styles,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const buildRowsFromResults = useCallback((results: any[], text: string) => {
    if (!Array.isArray(results)) return [];
    // Example: return all results (no filtering)
    return results;
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchLocation(text);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleSelect = async (item: PlaceSuggestion) => {
    setQuery(item.description);
    setSuggestions([]);
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
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask((t) => ({ ...t, title: text }))}
          />
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Description"
            value={newTask.description}
            multiline
            onChangeText={(text) =>
              setNewTask((t) => ({ ...t, description: text }))
            }
          />
          {/* <TextInput
            style={styles.input}
            placeholder="Location Name or Address"
            value={newTask.locationLabel}
            onChangeText={(text) =>
              setNewTask((t) => ({ ...t, locationLabel: text }))
            }
            autoCapitalize="words"
          /> */}
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Pick Location on Map:
          </Text>
          <MapPicker
            onLocationSelected={(loc: any) =>
              setNewTask((t) => ({ ...t, location: loc }))
            }
            marker={
              newTask.location
                ? {
                    latitude: newTask.location.coordinates[1],
                    longitude: newTask.location.coordinates[0],
                  }
                : null
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Search for a location"
            value={query}
            onChangeText={handleSearch}
          />
          {loading && <Text>Loading...</Text>}
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={{ padding: 10 }}>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 120 }}
            keyboardShouldPersistTaps="handled"
          />
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {newTask.time
                ? new Date(newTask.time).toLocaleString()
                : "Select Date & Time"}
            </Text>
          </TouchableOpacity>

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
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#FF9800" }]}
              onPress={onCreate}
              disabled={creating}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {creating ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text style={{ color: "#222" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTaskModal;
