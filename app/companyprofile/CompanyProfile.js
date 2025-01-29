import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet, Alert, View, Image } from 'react-native';
import { TextInput, Button, Title, Subheading, Divider } from 'react-native-paper';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

import * as ImagePicker from 'expo-image-picker';


const TenantDetailsScreen = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [logoUri, setLogoUri] = useState(null); // Track logo URI

  const BASEURL = process.env.EXPO_PUBLIC_API_URL;
  const currentUser = useAuthStore(state => state.currentUser);
  const tenantId = currentUser?.tenantId;

  useEffect(() => {
    if (!currentUser) {
          router.push('login');}
    fetchTenantDetails();
  }, [currentUser]);

  // Fetch tenant details (GET request)
  const fetchTenantDetails = async () => {
    try {
      const response = await axios.get(`${BASEURL}/tenants/${tenantId}`);
      const tenantData = response.data.tenant;

      console.log(`data is here ${tenantData}`);
      setTenant(tenantData);
      
      // If tenant has a logoUrl, prepend BASEURL to form the full path
     
      setLogoUri(tenantData.logoUrl)
      console.log('Fetched tenant:', tenantData);
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update tenant details (PUT request)
  const handleUpdateTenant = async () => {
    if (!tenant) return;
    setUpdating(true);
    try {
      const updatedDetails = {
        name: tenant.name,
        status: tenant.status,
        numberOfBags: tenant.numberOfBags,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
        alternativePhoneNumber: tenant.alternativePhoneNumber,
        website: tenant.website,
        address: tenant.address,
        town: tenant.town,
        county: tenant.county,
        building: tenant.building,
        street: tenant.street,
      };
  
      const response = await axios.put(`${BASEURL}/tenants/${tenantId}`, updatedDetails);
  
      if (response.data) {
        Alert.alert('Success', 'Tenant details updated successfully!');
        setTenant(response.data);
      }
    } catch (error) {
      console.error('Error updating tenant details:', error);
      Alert.alert('Error', 'Failed to update tenant details.');
    } finally {
      setUpdating(false);
      fetchTenantDetails();
    }
  };
  
 // Assuming you're using Axios for API calls
  
 const handlePickLogo = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri); // Correct way to access URI
      await handleUpdateTenantLogo(result.assets[0].uri);
    } else {
      Alert.alert('No image selected', 'You did not select any image.');
    }
  } catch (error) {
    console.error('Error picking logo:', error);
    Alert.alert('Error', 'An error occurred while picking the logo.');
  }
};
  
const handleUpdateTenantLogo = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('logo', {
      uri: imageUri,
      name: `logo_${tenantId}.jpg`,
      type: 'image/jpeg',
    });

    await axios.put(`${BASEURL}/logo-upload/${tenantId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Fetch updated tenant details to get the new logo
    await fetchTenantDetails();

  } catch (error) {
    console.error('Error updating tenant logo:', error);
    Alert.alert('Error', 'An error occurred while updating the tenant logo.');
  }
};




  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Edit Tenant Details</Title>
      <Divider style={styles.divider} />

      {/* Logo Upload Section */}
      <Subheading style={styles.subheading}>Upload Logo</Subheading>
      <View style={styles.logoContainer}>
      {logoUri ? (
        // Display the selected image as a preview
        <Image source={{ uri: logoUri }} style={styles.logo} />
      ) : (
        // Default image before any selection
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
      )}
        <Button mode="outlined" onPress={handlePickLogo} style={styles.logoButton}>
          Choose Logo
        </Button>
      </View>

      {/* Editable fields */}
      <Subheading style={styles.subheading}>General Information</Subheading>

      <EditableField label="Status" value={tenant?.status} editable={false} />
      <EditableField label="Name" value={tenant?.name} onChangeText={text => setTenant({ ...tenant, name: text })} />
      <Subheading style={styles.subheading}>Service Details</Subheading>
      <EditableField label="Garbage Bags per Customer" value={String(tenant?.numberOfBags)} onChangeText={text => setTenant({ ...tenant, numberOfBags: Number(text) || 0 })} keyboardType="numeric" />

      <Subheading style={styles.subheading}>Contact Information</Subheading>
      <EditableField label="Email" value={tenant?.email} onChangeText={text => setTenant({ ...tenant, email: text })} keyboardType="email-address" />
      <EditableField label="Phone" value={tenant?.phoneNumber} onChangeText={text => setTenant({ ...tenant, phoneNumber: text })} keyboardType="phone-pad" />
      <EditableField label="Alternative Phone" value={tenant?.alternativePhoneNumber} onChangeText={text => setTenant({ ...tenant, alternativePhoneNumber: text })} keyboardType="phone-pad" />
      <EditableField label="Website" value={tenant?.website} onChangeText={text => setTenant({ ...tenant, website: text })} keyboardType="url" />

      <Subheading style={styles.subheading}>Address</Subheading>
      <EditableField label="Address (Box Number)" value={tenant?.adress} onChangeText={text => setTenant({ ...tenant, adress: text })} />
      <EditableField label="Town" value={tenant?.town} onChangeText={text => setTenant({ ...tenant, town: text })} />
      <EditableField label="County" value={tenant?.county} onChangeText={text => setTenant({ ...tenant, county: text })} />
      <EditableField label="Building" value={tenant?.building} onChangeText={text => setTenant({ ...tenant, building: text })} />
      <EditableField label="Street" value={tenant?.street} onChangeText={text => setTenant({ ...tenant, street: text })} />

      <Button mode="contained" onPress={handleUpdateTenant} loading={updating} style={styles.button}>
        Update Tenant
      </Button>
    </ScrollView>
  );
};

// Custom editable input field component
const EditableField = ({ label, value, onChangeText, keyboardType = 'default', editable = true }) => (
  <TextInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    mode="outlined"
    keyboardType={keyboardType}
    editable={editable}
    style={[styles.input, !editable && styles.disabledInput]}
  />
);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  divider: {
    marginVertical: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  logoButton: {
    marginTop: 10,
    width: '50%',
  },
});

export default TenantDetailsScreen;
