import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const ChangePassword = () => {
  const { currentUser } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: 'Change Password' });
  }, [navigation]);

  if (!currentUser) {
    Alert.alert('Error', 'User not found. Please log in again.');
    router.push('/login');
    return null;
  }

  const phoneNumber = currentUser.phoneNumber;

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, newPassword: password }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        router.replace('/login');
      } else {
        Alert.alert('Error', result.message || 'Failed to change password.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while changing password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Update Password</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Text style={{ color: '#bbb', fontSize: 16 }}>
            {passwordVisible ? '👁️' : '🙈'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!confirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
        >
          <Text style={{ color: '#bbb', fontSize: 16 }}>
            {confirmPasswordVisible ? '👁️' : '🙈'}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        onPress={handleChangePassword}
        style={styles.button}
        loading={loading}
        disabled={loading}
        labelStyle={{ fontSize: 16 }}
      >
        Change Password
      </Button>

      <IconButton
        icon="keyboard-backspace"
        color="#fff"
        size={30}
        onPress={() => router.back()}
        style={styles.backButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // Dark theme background
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#fff',
    paddingRight: 50, // Space for eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '30%',
  },
  button: {
    backgroundColor: '#bb86fc', // Purple accent for dark theme
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default ChangePassword;
