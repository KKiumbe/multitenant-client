
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Appbar, Snackbar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const TaskDetails = () => {
  const { id } = useLocalSearchParams(); // Get the task ID from the route params
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [issuedCount, setIssuedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/fetch-task-details/${id}`);
      const customers = response.data.customers;
      setTaskDetails(response.data);

      // Calculate issued and pending counts
      const issued = customers.filter((customer) => customer.bagsIssued).length;
      const pending = customers.length - issued;
      setIssuedCount(issued);
      setPendingCount(pending);
    } catch (error) {
      console.error("Error fetching task details:", error);
      setSnackbarMessage("Failed to load task details. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refresh control
    }
  };

  const onRefresh = () => {
    setRefreshing(true); // Show the refresh control indicator
    fetchTaskDetails();
  };

  const markAsIssued = async (customerId) => {
    try {
      // Call the API with the task ID in the URL and customerId in the body
      const response = await axios.post(
        `${BASEURL}/trashbag-issed/${id}`, // Assuming `id` is the taskId
        {
          customerId, // Request body as per API expectation
        }
      );
  
      Alert.alert("Success", "Customer has been marked as issued.");
      fetchTaskDetails(); // Refresh task details after marking as issued
    } catch (error) {
      console.error("Error marking customer as issued:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to mark customer as issued.");
    }
  };
  
  const renderCustomer = (customer) => (
    <View
      key={customer.customerId}
      style={[
        styles.customerCard,
        customer.bagsIssued && styles.greyedOutCustomer,
      ]}
    >
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text>Phone: {customer.phoneNumber}</Text>
      {customer.trashBagsIssued ? (
        <Text style={styles.issuedText}>Bags Issued</Text>
      ) : (
        <TouchableOpacity
          style={styles.issueButton}
          onPress={() => markAsIssued(customer.customerId)}
        >
          <Text style={styles.issueButtonText}>Mark as Issued</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!taskDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Task not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Task Details" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.taskInfo}>
          <Text style={styles.taskType}>{taskDetails.taskDetails.type}</Text>
          <Text>Status: {taskDetails.taskDetails.status}</Text>
          <Text>Declared Bags: {taskDetails.taskDetails.declaredBags}</Text>
          <Text>Created At: {new Date(taskDetails.taskDetails.createdAt).toLocaleString()}</Text>
          <Text>Updated At: {new Date(taskDetails.taskDetails.updatedAt).toLocaleString()}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsText}>
            Issued: {issuedCount} / Total: {taskDetails.customers.length}
          </Text>
          <Text style={styles.statsText}>Pending: {pendingCount}</Text>
        </View>

        <View style={styles.customersSection}>
          <Text style={styles.sectionTitle}>Assigned Customers</Text>
          {taskDetails.customers.map(renderCustomer)}
        </View>
      </ScrollView>

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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
  },
  taskInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  taskType: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsSection: {
    marginBottom: 16,
  },
  statsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  customersSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  customerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  greyedOutCustomer: {
    backgroundColor: "#e0e0e0",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  issuedText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 8,
  },
  issueButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  issueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
});

export default TaskDetails;
