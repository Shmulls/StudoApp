import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import { Task } from "../types/task";

interface CalendarProgressProps {
  tasks: Task[];
}

const CalendarProgress: React.FC<CalendarProgressProps> = ({ tasks }) => {
  const progress = tasks.filter((t) => t.signedUp).length / tasks.length || 0;

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Achievement progress</Text>
      <Progress.Bar
        progress={progress}
        width={null}
        height={10}
        color="#333"
        borderColor="#ddd"
        style={styles.progressBar}
      />
    </View>
  );
};

export default CalendarProgress;

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    borderColor: "#00000",
    borderRadius: 5,
    width: "100%",
  },
});
