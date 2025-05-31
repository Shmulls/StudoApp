import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
          <GooglePlacesAutocomplete
            placeholder="Search for a location"
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details && details.geometry && details.geometry.location) {
                const { lat, lng } = details.geometry.location;
                setNewTask((t) => ({
                  ...t,
                  locationLabel: data.description,
                  location: { type: "Point", coordinates: [lng, lat] },
                }));
              }
            }}
            query={{
              key: process.env.EXPO_PUBLIC_LOCATION_API_KEY,
              language: "en",
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0, marginBottom: 10 },
            }}
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
