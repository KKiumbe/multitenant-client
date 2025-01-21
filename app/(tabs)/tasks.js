import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Appbar, Snackbar, Card, Title, Paragraph, Divider, Button } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const FetchTasksScreen = () => {
  const [tasksAssignedToMe, setTasksAssignedToMe] = useState([]);
  const [tasksAssignedByMe, setTasksAssignedByMe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/fetch-task`);
      setTasksAssignedToMe(response.data.assignedToMe || []);
      setTasksAssignedByMe(response.data.assignedByMe || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setSnackbarMessage("Failed to load tasks. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.post(`${BASEURL}/update-task/${taskId}`, { status: newStatus });
      Alert.alert("Success", `Task status updated to ${newStatus}.`);
      fetchTasks(); // Refresh tasks after updating the status
    } catch (error) {
      console.error("Error updating task status:", error);
      Alert.alert("Error", "Failed to update task status.");
    }
  };

  const renderTask = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/tasks/${item.id}`)} // Navigate to task details
    >
      <Card.Content>
        <Title>{item.type}</Title>
        <Paragraph>Status: {item.status}</Paragraph>
        <Paragraph>Declared Bags: {item.declaredBags || "N/A"}</Paragraph>
        <Paragraph>
          Created At: {new Date(item.createdAt).toLocaleString()}
        </Paragraph>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"].map((status) => (
          <Button
            key={status}
            onPress={() => updateTaskStatus(item.id, status)} // Update task status
            mode={item.status === status ? "contained" : "outlined"}
            style={[
              styles.statusButton,
              status === "COMPLETED" && item.status === status && styles.greyedOutButton,
            ]}
            labelStyle={styles.buttonLabel}
            disabled={status === "COMPLETED" && item.status === status} // Disable if task is completed
          >
            {status}
          </Button>
        ))}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="My Tasks" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          <Title style={styles.sectionHeader}>Tasks Assigned to Me</Title>
          <FlatList
            data={tasksAssignedToMe}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            ListEmptyComponent={
              <Paragraph style={styles.noTasksText}>No tasks assigned to you.</Paragraph>
            }
            ItemSeparatorComponent={() => <Divider />}
          />

          <Title style={styles.sectionHeader}>Tasks Assigned by Me</Title>
          <FlatList
            data={tasksAssignedByMe}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            ListEmptyComponent={
              <Paragraph style={styles.noTasksText}>No tasks assigned by you.</Paragraph>
            }
            ItemSeparatorComponent={() => <Divider />}
          />
        </>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loader: {
    marginTop: 20,
  },
  noTasksText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: "#777",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    paddingHorizontal: 16,
    color: "#3f51b5", // Material UI primary color
  },
  card: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    minHeight: 180, // Increased height for better visibility
  },
  cardActions: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
    height: 40,
    paddingHorizontal: 8,
  },
  greyedOutButton: {
    backgroundColor: "#d3d3d3",
    borderColor: "#d3d3d3",
  },
  buttonLabel: {
    fontSize: 12, // Make the text smaller
  },
});

export default FetchTasksScreen;
