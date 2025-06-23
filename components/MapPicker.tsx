import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

type MapPickerProps = {
  onLocationSelected: (location: {
    type: "Point";
    coordinates: [number, number];
  }) => void;
  marker?: { latitude: number; longitude: number } | null;
};

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelected,
  marker,
}) => {
  const [internalMarker, setInternalMarker] = useState(marker);

  useEffect(() => {
    if (marker) setInternalMarker(marker);
  }, [marker]);

  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setInternalMarker({ latitude, longitude });
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
        {internalMarker && <Marker coordinate={internalMarker} />}
      </MapView>
    </View>
  );
};

export default MapPicker;

const styles = StyleSheet.create({
  container: { width: "100%", height: 220, marginBottom: 12 },
  map: { width: "100%", height: "100%" },
});
