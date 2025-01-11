import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Subheading, ActivityIndicator } from 'react-native-paper';
import { router, useNavigation } from 'expo-router';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const forgotPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({ title: 'Request OTP' });
  }, [navigation]);


  const handleRequestOTP = async () => {
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

      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your phone.');
router.push({ pathname: '/verifyOTP', params: { phoneNumber } });
      } else {
        const result = await response.json();
        Alert.alert('Error', result.message || 'Failed to send OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Forgot Password</Title>
      <Subheading style={styles.subtitle}>
        Enter your registered phone number, and we’ll send you an OTP to reset your password.
      </Subheading>

      <TextInput
        label="Phone Number"
        mode="outlined"
        style={styles.input}
        placeholder="Enter Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {loading ? (
        <ActivityIndicator animating={true} style={styles.loadingIndicator} />
      ) : (
        <Button
          mode="contained"
          onPress={handleRequestOTP}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Request OTP
        </Button>
      )}

      <Text style={styles.backToLogin} onPress={() => router.push('/login')}>
        Back to Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#121212', // Dark background for a sleek look
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#bbbbbb',
    marginBottom: 32,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#bb86fc',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  backToLogin: {
    marginTop: 20,
    color: '#bb86fc',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default forgotPassword;
