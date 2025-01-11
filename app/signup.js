import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Appbar, ActivityIndicator, RadioButton } from 'react-native-paper';
import { router } from 'expo-router';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    county: '',
    town: '',
    gender: 'male', // Default gender
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateFields = () => {
    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'email', 'county', 'town', 'gender', 'password'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`${field.replace(/([A-Z])/g, ' $1')} is required.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Frontend validation for mandatory fields and password match
    if (!validateFields()) return;

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...payload } = formData;

    try {
      const response = await fetch(`${BASEURL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const data = await response.json();
      setSuccessMessage('Account created successfully! Please log in with your credentials.');
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        county: '',
        town: '',
        gender: 'male',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Appbar.Header style={styles.title}>
        <Appbar.Content title="Welcome To TaQa" />
      </Appbar.Header>

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      {successMessage && (
        <View style={styles.successContainer}>
          <Text style={styles.success}>{successMessage}</Text>
          <Button
            mode="outlined"
            onPress={() => router.push('/login')}
            style={styles.successButton}
          >
            Login
          </Button>
        </View>
      )}

      <TextInput
        label="First Name *"
        value={formData.firstName}
        onChangeText={(value) => handleChange('firstName', value)}
        style={styles.input}
      />
      <TextInput
        label="Last Name *"
        value={formData.lastName}
        onChangeText={(value) => handleChange('lastName', value)}
        style={styles.input}
      />
      <TextInput
        label="Email *"
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        style={styles.input}
      />
      <TextInput
        label="County *"
        value={formData.county}
        onChangeText={(value) => handleChange('county', value)}
        style={styles.input}
      />
      <TextInput
        label="Town *"
        value={formData.town}
        onChangeText={(value) => handleChange('town', value)}
        style={styles.input}
      />

      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>Gender *</Text>
        <View style={styles.radioGroup}>
          <RadioButton
            value="male"
            status={formData.gender === 'male' ? 'checked' : 'unchecked'}
            onPress={() => handleChange('gender', 'male')}
          />
          <Text style={styles.radioText}>Male</Text>
          <RadioButton
            value="female"
            status={formData.gender === 'female' ? 'checked' : 'unchecked'}
            onPress={() => handleChange('gender', 'female')}
          />
          <Text style={styles.radioText}>Female</Text>
        </View>
      </View>

      <TextInput
        label="Phone Number *"
        value={formData.phoneNumber}
        onChangeText={(value) => handleChange('phoneNumber', value)}
        style={styles.input}
        keyboardType="phone-pad"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          label="Password *"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          style={styles.input}
          secureTextEntry={!showPassword}
          right={<TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />}
        />
        <TextInput
          label="Confirm Password *"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          right={<TextInput.Icon
            icon={showConfirmPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />}
        />
      </View>

      {loading ? (
        <ActivityIndicator animating={true} style={styles.loadingIndicator} />
      ) : (
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Sign Up
        </Button>
      )}

      <Button
        mode="text"
        onPress={() => router.push('/login')}
        style={styles.linkButton}
      >
        Already have an account? Login
      </Button>
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
  title: {
    backgroundColor: 'grey',
    justifyContent: 'center',
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
  successContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    textAlign: 'center',
  },
  successButton: {
    marginTop: 8,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginRight: 16,
  },
  passwordContainer: {
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});

export default SignUpScreen;
