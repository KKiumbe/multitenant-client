import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const VerifyOTP = () => {
  const { currentUser } = useAuthStore(); // Access the current user from the store
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Access navigation object

  useEffect(() => {
    // Set the title of the screen
    navigation.setOptions({ title: 'Verify OTP' });
  }, [navigation]);

  if (!currentUser) {
    // Ensure currentUser is available before rendering the component
    Alert.alert('Error', 'User not found. Please log in again.');
    router.push('/login'); // Redirect to login if currentUser is not available
    return null;
  }

  const phoneNumber = currentUser.phoneNumber; // Get phone number from currentUser

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is missing.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, phoneNumber }), // Include phone number in the request
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP verified successfully!');
        // Navigate to the Change Password screen
        router.push('/changePassword/changePassword');
      } else {
        Alert.alert('Error', result.message || 'Failed to verify OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      <Button
        mode="contained"
        onPress={handleVerifyOtp}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Verify OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
  },
});

export default VerifyOTP;
