import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Appbar, Snackbar, Button, Menu, TextInput } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const GarbageCollectionDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const AssignTaskScreen = () => {
  const [assigneeId, setAssigneeId] = useState("");
  const [collectionDay, setCollectionDay] = useState("");
  const [declaredBags, setDeclaredBags] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // For collection day dropdown
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASEURL}/users`);
      const collectors = response.data.users.filter((user) =>
        user.role.includes("collector")
      );
      setUsers(collectors);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch users.";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    }
  };
  
  const assignTask = async () => {
    if (!assigneeId || !collectionDay || !declaredBags) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        assigneeId,
        collectionDay,
        declaredBags: parseInt(declaredBags),
      };

      await axios.post(`${BASEURL}/create-trashbag-task`, payload);
      Alert.alert("Success", "Task assigned successfully.");
      router.push("/tasks"); // Navigate back to the tasks screen
    } catch (error) {
      console.error("Error assigning task:", error);
      Alert.alert("Error", "Failed to assign task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Assign Task" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.label}>Select Assignee</Text>
          <View style={styles.dropdown}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => setAssigneeId(user.id)}
                style={[
                  styles.userOption,
                  assigneeId === user.id && styles.selectedUser,
                ]}
              >
                <Text style={styles.userText}>
                  {user.firstName} {user.lastName} 
                </Text>
                <Text style={styles.userText}>
                  {user.phoneNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Collection Day</Text>
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={styles.menuTrigger}
            >
              <Text style={styles.menuTriggerText}>
                {collectionDay || "Select a day"}
              </Text>
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menu}>
                {GarbageCollectionDays.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      setCollectionDay(day);
                      setShowMenu(false);
                    }}
                    style={[
                      styles.menuItem,
                      collectionDay === day && styles.selectedMenuItem,
                    ]}
                  >
                    <Text>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.label}>Declared Bags</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of declared bags"
            keyboardType="numeric"
            value={declaredBags}
            onChangeText={setDeclaredBags}
          />

          <Button mode="contained" onPress={assignTask} style={styles.assignButton}>
            Assign Task
          </Button>
        </ScrollView>
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
  contentContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
  },
  userOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedUser: {
    backgroundColor: "#007BFF",
  },
  userText: {
    color: "#333",
  },
  assignButton: {
    marginTop: 16,
  },
  menuTrigger: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  menuTriggerText: {
    color: "#333",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedMenuItem: {
    backgroundColor: "#007BFF",
  },
});

export default AssignTaskScreen;
