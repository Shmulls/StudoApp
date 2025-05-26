import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function MapPicker({ onLocationSelected }) {
  const [marker, setMarker] = useState(null);

  const handlePress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationSelected({ type: "Point", coordinates: [longitude, latitude] });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 32.0853,
          longitude: 34.7818,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 220, marginBottom: 12 },
  map: { width: "100%", height: "100%" },
});