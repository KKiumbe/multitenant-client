import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { Portal, FAB, Snackbar, Modal, TextInput,Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import useAuthStore from "../../store/authStore";

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // User form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [password, setPassword] = useState("");

  // Modal & Snackbar states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const currentUser = useAuthStore(state => state.currentUser);


  console.log(`this is the user  ${JSON.stringify(currentUser)}`);

const tenantId = currentUser?.tenantId;
console.log("Tenant ID:", tenantId);



    useEffect(() => {
      if (!currentUser) {
        router.push('login');
      } else {
        setLoading(true);
        fetchUsers();
        setLoading(false);
      }
    }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASEURL}/users`);
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUserClick = (userId) => {
    router.push(`/users/${userId}`);
  };

  const openAddModal = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setGender("");
    setCounty("");
    setTown("");
    setPassword("");
    setEditModalVisible(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const handleSaveUser = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !gender || !county || !town || !password) {
      setSnackbarMessage("Please fill in all fields");
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${BASEURL}/adduser`, {
        tenantId,
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        county,
        town,
        password,
      });
  
      if (response.status === 201) {
        setSnackbarMessage("User added successfully!");
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the users list
        setEditModalVisible(false); // Close the modal
      } else {
        setSnackbarMessage("Failed to add user.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || "Error saving user");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>User Management</Text>

      {users.map((user) => (
        <TouchableOpacity key={user.id} onPress={() => handleUserClick(user.id)} style={styles.userItem}>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRoles}>Roles: {user.role?.join(", ") || "No roles assigned"}</Text>
        </TouchableOpacity>
      ))}

      <FAB style={styles.fab} icon="plus" onPress={openAddModal} />

      <Snackbar visible={snackbarOpen} onDismiss={handleSnackbarClose} duration={3000}>
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Text style={styles.modalTitle}>Add User</Text>

            <TextInput label="First Name" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} />
            <TextInput label="Last Name" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} />
            <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
            <TextInput label="Phone Number" mode="outlined" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="numeric" style={styles.input} />

            <Text>Gender</Text>
            <Picker selectedValue={gender} style={styles.picker} onValueChange={setGender}>
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>

            <TextInput label="County" mode="outlined" value={county} onChangeText={setCounty} style={styles.input} />
            <TextInput label="Town" mode="outlined" value={town} onChangeText={setTown} style={styles.input} />

            <TextInput label="Password" mode="outlined" value={password} onChangeText={setPassword} secureTextEntry={true} style={styles.input} />

            <Button mode="contained" onPress={handleSaveUser} loading={loading} style={styles.saveCancel} >
              Save
            </Button>

            <Button mode="text" onPress={() => setEditModalVisible(false)}>
            Cancel
          </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({


  container: { flexGrow: 1,
                padding: 16, 
                 backgroundColor: "#fff" 
              },


  title: { fontSize: 24, 
    
    fontWeight: "bold", 
    textAlign: "center",
     marginBottom: 16 
    },
  userItem: { padding: 16,
     marginVertical: 8, 
     backgroundColor: "#f9f9f9", 
     borderRadius: 8, 
     borderWidth: 1, 
     borderColor: "#ddd" 
    },
  fab: { position: "absolute",
     margin: 16, 
     right: 0, 
     bottom: 0 
    },
  modal: { backgroundColor: "white", 
    padding: 20,
     margin: 20, 
     borderRadius: 10, 
     width: "90%", 
     alignSelf: "center" 
    },
  input: { marginBottom: 16 


  },

  saveCancel:{

  }
});

export default UserManagement;
