import React, { useEffect, useState } from "react";
import { ScrollView, Alert, StyleSheet, RefreshControl } from "react-native";
import { View, Text } from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Button, Chip, ActivityIndicator, List, Divider } from "react-native-paper";
import axios from "axios";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const ROLE_PERMISSIONS = {
  customer_manager: {
    customer: ["create", "read", "update"],
    invoice: ["read"],
  },
  accountant: {
    receipt: ["create", "read"],
    payment: ["create", "read"],
  },
  collector: {
    customer: ["read", "update"],
  },
  default: {},
};

const UserPage = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BASEURL}/users/${id}`);
      console.log(response.data);
      setUser(response.data);
      setRoles(response.data.role || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refresh indicator
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user) {
      navigation.setOptions({ title: user.firstName });
    }
  }, [navigation, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUser();
  };

  const handleAddRole = (role) => {
    if (!roles.includes(role)) {
      setRoles([...roles, role]);
    }
  };

  const handleRemoveRole = (role) => {
    setRoles(roles.filter((r) => r !== role));
  };

  const handleSubmitRoles = async () => {
    try {
      const payload = { 
        userId: id, // Ensure the key is `userId` as per the API requirements
        role: roles // Use `role` to match the API schema
      };
      await axios.post(`${BASEURL}/assign-roles`, payload);
      Alert.alert("Success", "Roles assigned successfully!");
    } catch (err) {
      Alert.alert("Error", `Failed to assign roles: ${err.message}`);
    }
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading user details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit User Roles</Text>
      <List.Section>
        <List.Item title="First Name" description={user.firstName} />
        <List.Item title="Last Name" description={user.lastName} />
        <List.Item title="Email" description={user.email} />
        <List.Item title="Phone Number" description={user.phoneNumber || "Not provided"} />
      </List.Section>

      <Divider style={styles.divider} />

      <Text style={styles.subtitle}>Available Roles</Text>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.keys(ROLE_PERMISSIONS).map((role, index) => (
          <Chip
            key={index}
            style={styles.chip}
            mode={roles.includes(role) ? "flat" : "outlined"}
            onPress={() => handleAddRole(role)}
          >
            {role}
          </Chip>
        ))}
      </ScrollView>

      <Divider style={styles.divider} />

      <Text style={styles.subtitle}>Assigned Roles</Text>
      <View style={styles.rolesContainer}>
        {roles.map((role, index) => (
          <Chip
            key={index}
            mode="flat"
            style={styles.assignedRoleChip}
            onClose={() => handleRemoveRole(role)}
          >
            {role}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleSubmitRoles}
        style={styles.submitButton}
        labelStyle={styles.buttonLabel}
      >
        Submit Roles
      </Button>
      <Button
        mode="outlined"
        onPress={() => router.push("/users")}
        style={styles.backButton}
        labelStyle={styles.buttonLabel}
      >
        Back to Users
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scrollView: {
    marginBottom: 16,
  },
  chip: {
    marginVertical: 4,
    alignSelf: "flex-start",
  },
  assignedRoleChip: {
    marginVertical: 4,
    marginRight: 4,
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  divider: {
    marginVertical: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default UserPage;
