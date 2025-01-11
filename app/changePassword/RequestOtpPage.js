import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const RequestOtpPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser); // Get the logged-in user from the store
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  console.log(`current user ${currentUser}`);

  useEffect(() => {
    if (currentUser?.phoneNumber) {
      setPhoneNumber(currentUser.phoneNumber); // Pre-fill phone number if the user is logged in
    }
  }, [currentUser]);

  const handleRequestOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP has been sent to your phone.');
        // Navigate to the Verify OTP screen with the phone number

        router.replace('/VerifyOTP');

      } else {
        Alert.alert('Error', result.message || 'Failed to request OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Request OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        editable={!currentUser} // Make the input editable only if the user is not logged in
      />
      <Button
        mode="contained"
        onPress={handleRequestOtp}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Request OTP
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

export default RequestOtpPage;
