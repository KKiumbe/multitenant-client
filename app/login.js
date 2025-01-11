import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Appbar, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import useAuthStore from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setLoading(true);

    // Basic validation
    if (!formData.phoneNumber || !formData.password) {
      setErrorMessage('Phone number and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASEURL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the request content type
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Login failed. Please try again.');
      }

      const data = await response.json();
      console.log('User logged in successfully:', data);

      // Store the token in AsyncStorage
      //await AsyncStorage.setItem('token', data.token);

      // Update the current user in the auth store
      useAuthStore.getState().updateCurrentUser(data.user);

      // Navigate to the main page
      router.push('/');
      setFormData({ phoneNumber: '', password: '' }); // Reset form after successful login
    } catch (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Login to Your Account" />
      </Appbar.Header>

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TextInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(value) => handleChange('phoneNumber', value)}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(value) => handleChange('password', value)}
        style={styles.input}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator animating={true} style={styles.loadingIndicator} />
      ) : (
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Login
        </Button>
      )}

      <Text style={styles.linkText} onPress={() => router.push('/signup')}>
        Don't have an account? Sign Up
      </Text>

      <Text style={styles.linkText} onPress={() => router.push('/changePassword/forgotPassword')}>
        Forgot Password?
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#6200ee',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  linkText: {
    marginTop: 16,
    color: '#6200ee',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingIndicator: {
    marginTop: 16,
  },
});

export default LoginScreen;
