import React from "react";
import { StyleSheet, Text, View } from "react-native";

const NotAuthorized = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        You are not authorized to view this page.
      </Text>
    </View>
  );
};

export default NotAuthorized;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
