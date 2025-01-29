import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import base64 from 'base-64';

import CustomPieChart from './../../components/chart';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [sendingModalVisible, setSendingModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsBalance, setSmsBalance] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);


  const currentUser = useAuthStore(state => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      router.push('login');
    } else {
      fetchDashboardStats();
      fetchSmsBalance();
     
    }
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${BASEURL}/stats`);
      setDashboardStats(response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('user');
        router.push('login');
      } else {
        console.error('Error fetching dashboard stats:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsBalance = async () => {
    try {
      const response = await axios.get(`${BASEURL}/get-sms-balance`);
      setSmsBalance(response.data.credit);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch SMS balance.');
    }
  };

 
  const sendSms = async (endpoint) => {
    setSendingModalVisible(true);
    setSending(true);
    setConfirmModalVisible(false);

    try {
      await axios.post(`${BASEURL}/${endpoint}`, { message: smsMessage });
      Alert.alert('Success', 'SMS sent successfully.');
    } catch (error) {
      Alert.alert('Error', `Failed to send SMS to ${endpoint} customers.`);
    } finally {
      setSending(false);
      setSendingModalVisible(false);
      setSmsMessage('');
    }
  };

  const sendToAll = async () => {
    if (!smsMessage.trim()) {
      Alert.alert('Error', 'Please enter a message to send.');
      return;
    }
  
    setModalVisible(false);
    setSendingModalVisible(true);
    setSending(true);
    try {
      await axios.post(`${BASEURL}/send-to-all`, { message: smsMessage });
      Alert.alert('Success', 'SMS sent to all customers.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send SMS to all customers.');
    } finally {
      setSending(false);
      setSendingModalVisible(false);
      setSmsMessage('');
    }
  };
  

  const confirmSend = (category) => {
    setCurrentCategory(category);
    setConfirmModalVisible(true);
    setModalVisible(false);
  };

  const handleSendConfirmation = () => {
    setConfirmModalVisible(false);
    const endpointMap = {
      all: 'customers',
      unpaid: 'send-sms-unpaid',
      lowBalance: 'send-sms-low-balance',
      highBalance: 'send-sms-high-balance',
    };
    const endpoint = endpointMap[currentCategory];
    if (endpoint) {
      sendSms(endpoint);
    } else {
      Alert.alert('Error', 'Invalid category selected.');
    }
  };

  const handleDownloadReport = async (reportType) => {
    const endpointMap = {
      all: 'customers',
      unpaid: 'customers-debt',
      lowBalance: 'customers-debt-low',
      highBalance: 'customers-debt-high',
    };

    const endpoint = endpointMap[reportType];
    const fullUrl = `${BASEURL}/reports/${endpoint}`;

    try {
      setDownloadingReport((prev) => ({ ...prev, [reportType]: true }));

      const token = await AsyncStorage.getItem('user');
      const downloadPath = FileSystem.documentDirectory + `invoice-${reportType}.pdf`;

      const response = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
      });

      const uint8Array = new Uint8Array(response.data);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }

      const base64Data = base64.encode(binaryString);

      await FileSystem.writeAsStringAsync(downloadPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(downloadPath);
    } catch (error) {
      Alert.alert('Error', 'Failed to download and share the report.');
      console.error('Error downloading report:', error);
    } finally {
      setDownloadingReport((prev) => ({ ...prev, [reportType]: false }));
    }
  };
  const calculatePercentage = (value) => {
    const total = dashboardStats?.totalCustomers || 1;
    return ((value / total) * 100).toFixed(1);
  };
  
  const pieChartData = [
    {
      key: 'All Customers',
      value: dashboardStats?.totalCustomers || 0,
      svg: { fill: '#2196f3' }, // Single color for all customers
    },
    { 
      key: 'Unpaid', 
      value: dashboardStats?.unpaidCustomers || 0, 
      svg: { fill: '#f44336' },
      percentage: calculatePercentage(dashboardStats?.unpaidCustomers || 0)
    },
    { 
      key: 'Low Balance', 
      value: dashboardStats?.lowBalanceCustomers || 0, 
      svg: { fill: '#e1bee7' },
      percentage: calculatePercentage(dashboardStats?.lowBalanceCustomers || 0)
    },
    { 
      key: 'High Balance', 
      value: dashboardStats?.highBalanceCustomers || 0, 
      svg: { fill: '#3f51b5' },
      percentage: calculatePercentage(dashboardStats?.highBalanceCustomers || 0)
    },


  ];



  const pieChartDataForCard = (category) => {
    const total = dashboardStats?.totalCustomers || 1;
    const categoryData = pieChartData.find(item => item.key.toLowerCase() === category.toLowerCase());
    const categoryValue = categoryData?.value || 0;
    const otherValue = total - categoryValue;

    return [
      {
        ...categoryData,
        value: categoryValue,
      },
      {
        key: 'Other',
        value: otherValue,
        svg: { fill: '#e0e0e0' },
        percentage: ((otherValue / total) * 100).toFixed(1)
      },
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeMessage}>
          Welcome {currentUser?.firstName || 'User'}!
        </Text>

        <Button mode="text" onPress={fetchSmsBalance} style={styles.smsBalanceButton}>
          {smsBalance !== null ? `SMS Balance: ${smsBalance}` : 'Check SMS Balance'}
        </Button>

        {/* Total Customers Card */}
<Card style={[styles.card, { borderColor: '#2196f3' }]}>
  <Card.Content>


    {/* Pass the correct data for All Customers */}
 
    <Text style={styles.modalTitle}>
      Customers: {dashboardStats?.totalCustomers}
    </Text>
 

    <CustomPieChart
      data={[
        {
          key: 'All Customers',
          value: dashboardStats?.totalCustomers || 0,
          svg: { fill: '#9C27B0' }, // Single color for all customers
        },
      ]}
      showLegend={true}
      labelRadiusOffset={0.6}
      style={styles.mainChart}
    />

<Button
    mode="outlined"
  icon="message"
  style={styles.smsButton}
 
  onPress={() => { 
    setModalVisible(true);

    sendToAll()

  
  }}
>
  SMS All
</Button>
   
    <View style={styles.statsRow}>
      {/* Additional stats or content can go here */}
    </View>
  </Card.Content>
</Card>

        <Divider style={styles.divider} />


      {/* Other Cards (Unpaid, Low Balance, High Balance) */}  
      {
  [
    { title: 'Unpaid', value: dashboardStats?.unpaidCustomers, color: '#3f51b5', category: 'unpaid' },
    { title: 'Low Balance', value: dashboardStats?.lowBalanceCustomers, color: '#ce93d8', category: 'lowBalance' },
    { title: 'High Balance', value: dashboardStats?.highBalanceCustomers, color: '#f44336', category: 'highBalance' },
  ].map((stat, index) => {
    const totalCustomers = dashboardStats?.totalCustomers || 0;
    const otherCustomers = totalCustomers - stat.value; // Other customers not in this category

    const pieChartData = [
      { key: stat.title, value: stat.value, svg: { fill: stat.color } },
      { key: 'Other', value: otherCustomers, svg: { fill: '#e0e0e0' } }, // Color for the other customers
    ];

    return (
      <View key={index}>
        <Card style={[styles.card, { borderColor: stat.color }]}>
          <Card.Content>
            <View style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{stat.title}</Text>
                <Text style={styles.cardValue}>
                  {stat.value} ({calculatePercentage(stat.value)}%)
                </Text>
              </View>
              <Button
                mode="outlined"
                icon="message"
                onPress={() => {
                  if (stat.category === 'all') {
                    setModalVisible(true);
                  } else {
                    confirmSend(stat.category);
                  }
                }}
                style={styles.smsButton}
              >
                Send SMS
              </Button>
            </View>

            {/* Pass pieChartData for the category */}
            <CustomPieChart data={pieChartData} />
          </Card.Content>
        </Card>
        <Divider style={styles.divider} />
      </View>
    );
  })
}



        
         

    
      </ScrollView>

      <Modal visible={confirmModalVisible} animationType="slide" onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Send SMS</Text>
          <Text>Are you sure you want to send this SMS to the selected customers?</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleSendConfirmation} style={styles.sendButton} disabled={sending}>
              Confirm
            </Button>
            <Button mode="outlined" onPress={() => setConfirmModalVisible(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Send SMS</Text>
          <TextInput
            placeholder="Enter your message here"
            style={styles.textInput}
            value={smsMessage}
            onChangeText={setSmsMessage}
            multiline
            numberOfLines={8}
          />
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={sendToAll} style={styles.sendButton} disabled={sending || !smsMessage.trim()}>
              Send to All
            </Button>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={sendingModalVisible} animationType="slide" onRequestClose={() => setSendingModalVisible(false)}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.sendingText}>Sending SMS...</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeMessage: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, marginTop: 50 },
  smsBalanceButton: { marginBottom: 16 },
  card: { borderWidth: 2, borderRadius: 8, marginBottom: 32 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardValue: { fontSize: 24, fontWeight: 'bold' },
  smsButton: { marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, width: '100%', marginBottom: 16 , numberOfLines:8},
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  sendButton: { backgroundColor: '#007BFF', marginHorizontal: 5 },
  cancelButton: { marginHorizontal: 5 },
  sendingText: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
  chatSection: { marginTop: 20 },
  chatSectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  chatContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  chatText: { fontSize: 16 },
});

export default HomeScreen;