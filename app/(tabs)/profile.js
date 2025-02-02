import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const ProfilePage = () => {
  const { currentUser, updateCurrentUser, loadUser, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUser(); // Load user data when the component mounts
  }, []);

  const handleChangePassword = async () => {
    if (!currentUser?.phoneNumber) {
      Alert.alert('Error', 'Phone number is not available.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: currentUser.phoneNumber }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP has been sent to your phone.');
        router.push('/changePassword/verifyOTP');
      } else {
        Alert.alert('Error', result.message || 'Failed to request OTP.');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Alert.alert('Error', 'An error occurred while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text>First Name: {currentUser.firstName}</Text>
      <Text>Last Name: {currentUser.lastName}</Text>
      <Text>Email: {currentUser.email}</Text>
      <Text>Phone: {currentUser.phoneNumber}</Text>

      <Button
        mode="contained"
        onPress={handleChangePassword}
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Requesting OTP...' : 'Change Password'}
      </Button>

      <Button
        mode="contained"
        onPress={() => {
          updateCurrentUser(null);
          router.replace('/login');
        }}
        style={[styles.button, styles.logoutButton]}
      >
        Logout
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
  button: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336', // Red color for logout
  },
});

export default ProfilePage;
