



import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, TouchableOpacity, Linking, TextInput, ActivityIndicator } from 'react-native';
import { Button, Menu, Divider, Snackbar } from 'react-native-paper';
import axios from 'axios';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const CustomerCollectionScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [bulkSmsModalVisible, setBulkSmsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASEURL}/collections`);
      setCustomers(response.data);
      setFilteredCustomers(response.data);
      setHasPermission(true); // If the request is successful, assume permission is granted
    } catch (error) {
      if (error.response?.status === 403) {
        setHasPermission(false); // Denied by API
        setSnackbarMessage('Access denied. Please contact the admin.');
      } else {
        setSnackbarMessage('Failed to fetch customer data. Please try again.');
      }
      setSnackbarVisible(true);
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const handleFilterDay = (day) => {
    const dayEnumFormat = day.toUpperCase();
    setSelectedDay(day);
    const filtered = customers.filter((customer) => customer.garbageCollectionDay === dayEnumFormat);
    setFilteredCustomers(filtered);
    setMenuVisible(false);
  };

  const handleCustomerPress = (customer) => {
    setSelectedCustomer(customer);
    setSmsMessage('');
    setModalVisible(true);
  };

  const handleMarkCollected = async (customerId) => {
    try {
      await axios.patch(`${BASEURL}/collections/${customerId}`, { collected: true });
      const updatedCustomers = customers.map((customer) =>
        customer.id === customerId ? { ...customer, collected: true } : customer
      );
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
      setSnackbarMessage('Customer marked as collected!');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error marking as collected:', error);
      setSnackbarMessage('Failed to mark customer as collected.');
      setSnackbarVisible(true);
    }
  };

  const handleSendSMS = async (selectedCustomer) => {
    if (!selectedCustomer.phoneNumber || !smsMessage) {
      setSnackbarMessage('Phone number or message missing.');
      setSnackbarVisible(true);
      return;
    }

    try {
      await axios.post(`${BASEURL}/send-sms`, {
        mobile: selectedCustomer.phoneNumber,
        message: smsMessage,
      });
      setSnackbarMessage('SMS sent successfully!');
      setSnackbarVisible(true);
      setModalVisible(false);
      setSmsMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error.response?.data || error.message);
      setSnackbarMessage('Failed to send SMS.');
      setSnackbarVisible(true);
    }
  };

  const handleSendBulkSMS = async () => {
    if (!selectedDay || !smsMessage) {
      setSnackbarMessage('Please select a day and enter a message.');
      setSnackbarVisible(true);
      return;
    }

    try {
      await axios.post(`${BASEURL}/send-to-group`, { day: selectedDay, message: smsMessage });
      setSnackbarMessage('Bulk SMS sent successfully!');
      setSnackbarVisible(true);
      setBulkSmsModalVisible(false);
      setSmsMessage('');
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      setSnackbarMessage('Failed to send bulk SMS.');
      setSnackbarVisible(true);
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${selectedCustomer.phoneNumber}`);
  };

  if (!hasPermission) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Button mode="contained" onPress={fetchCustomers}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.title}>{selectedDay || 'All Days'} collection</Text>

          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={() => setMenuVisible(true)} style={styles.filterbutton}>
              {selectedDay ? ` Filtered: ${selectedDay}` : 'Filter by Day'}
            </Button>
            <Button
              style={[styles.Button, styles.smallButton]}
              mode="contained"
              onPress={() => setBulkSmsModalVisible(true)}
              disabled={!selectedDay || filteredCustomers.length === 0}
            >
              <Text style={styles.smallButtonText}>SMS {selectedDay} customers</Text>
            </Button>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<Button onPress={() => setMenuVisible(true)}>Choose Day</Button>}
          >
            {daysOfWeek.map((day) => (
              <Menu.Item key={day} onPress={() => handleFilterDay(day)} title={day} />
            ))}
          </Menu>

          <Divider style={styles.divider} />
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, item.collected ? styles.collected : styles.uncollected]}
                onPress={() => handleCustomerPress(item)}
              >
                <View style={styles.customerInfo}>
                  <Text style={styles.customerText}>{`${item.firstName} ${item.lastName}`}</Text>
                  <Text style={styles.customerText}>{item.phoneNumber}</Text>
                  <Text style={styles.customerText}>{item.location}</Text>
                  <Text style={styles.customerText}>{item.town}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={() => handleMarkCollected(item.id)}
                    style={styles.markCollectedButton}
                  >
                    {item.collected ? 'Collected' : 'Collect'}
                  </Button>
                </View>
              </TouchableOpacity>
            )}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />



{selectedCustomer && modalVisible && (
            <Modal
              visible={modalVisible}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Contact {selectedCustomer.firstName}</Text>
                <TextInput
                  style={styles.smsInput}
                  placeholder="Enter your message here..."
                  value={smsMessage}
                  onChangeText={setSmsMessage}
                />
                <View style={styles.buttonContainer}>
                  <Button 
                    mode="contained" 
                    onPress={() => handleSendSMS(selectedCustomer)} 
                    style={styles.Button}
                  >
                    Send SMS
                  </Button>
                  <Button mode="contained" onPress={handleCall} style={styles.Button}>
                    Call
                  </Button>
                </View>
                <Button mode="outlined" onPress={() => setModalVisible(false)}>
                  Close
                </Button>
              </View>
            </Modal>

          )}

<Modal
            visible={bulkSmsModalVisible}
            animationType="slide"
            onRequestClose={() => setBulkSmsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Send Bulk SMS for {selectedDay}</Text>
              <TextInput
                style={styles.smsInput}
                placeholder="Enter your message for all..."
                value={smsMessage}
                onChangeText={setSmsMessage}
              />
              <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleSendBulkSMS}>
                  Send Bulk SMS
                </Button>
                <Button mode="outlined" onPress={() => setBulkSmsModalVisible(false)}>
                  Close
                </Button>
              </View>
            </View>
          </Modal>

        </>





      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingTop: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchButton: {
    marginLeft: 10,
  },
  bulkSmsButton: {
    marginVertical: 10,
    fontSize: 5,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flex: 1,
  },
  customerText: {
    fontSize: 16,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  markCollectedButton: {
    marginLeft: 10,
  },
  collected: {
    backgroundColor: '#d3d3d3',
  },
  uncollected: {
    backgroundColor: '#f0f0f0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  smsInput: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  divider: {
    height: 10,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  Button: {
    padding: 5,
    marginBottom: 10,
    marginLeft: 5,
  },
  smallButton: {
    paddingVertical: 5,
  },
  smallButtonText: {
    fontSize: 10,
  },
  filterbutton: {
    padding: 5,
    marginBottom: 10,
    marginLeft: 5,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default CustomerCollectionScreen;
