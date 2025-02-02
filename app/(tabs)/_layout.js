import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer'; // Importing Drawer from expo-router
import { Provider as PaperProvider } from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for drawer toggle
import { size } from '@shopify/react-native-skia';
import Fontisto from '@expo/vector-icons/Fontisto';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import AntDesign from '@expo/vector-icons/AntDesign';

import Octicons from '@expo/vector-icons/Octicons';



export default function Layout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);


  const navigation = useNavigation(); // Get navigation instance for drawer toggle

  useEffect(() => {
    const loadUser = async () => {
      await useAuthStore.getState().loadUser();
      setIsInitialized(true);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (isInitialized && !isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isLoading, isInitialized, router]);
  

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Drawer>
          {/* Home */}
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel:'Home',
              headerTitle:'Home',
              headerShown: true,
              drawerIcon:({
                size,color
              })=>(
                <Ionicons 
                name='home-outline' size={size} color={color}
                />

              ),
              
            }}
          />

          {/* Customers */}
          <Drawer.Screen
            name="customers"
            options={{
              headerShown: true,
              drawerLabel:'Customers',
              headerTitle:'Customers',
              headerShown: true,
              drawerIcon:({
                size,color
              })=>(
               
                <Fontisto name="persons" size={24} color="black" />
                //name='persons' size={size} color={color}
                

              ),
              
            }}
          />

          {/* Collection */}
          <Drawer.Screen
            name="collection"
            options={{
              headerShown: true,
              drawerLabel:'Collection',
              headerTitle:'Collection',
              drawerIcon:({
                size,color
              })=>(
                <Entypo name="trash" size={24} color="black" />

              ),
              
            }}
          />

          {/* Invoices */}
          <Drawer.Screen
            name="invoices"
            options={{
              headerShown: true,
              drawerLabel:'Invoices',
              headerTitle:'Invoices',
              drawerIcon:({
                size,color
              })=>(
                <FontAwesome6 name="file-invoice-dollar" size={24} color="black" />

              ),
              
            }}
          />
          
          {/* Payments */}
          <Drawer.Screen
            name="payments"
            options={{
              headerShown: true,
              drawerLabel:'Payments',
              headerTitle:'Payments',
              drawerIcon:({
                size,color
              })=>(
                <MaterialIcons name="payments" size={24} color="black" />

              ),
              
            }}
          />

          {/* Receipting */}
          <Drawer.Screen
            name="receipting"
            options={{
              headerShown: true,
              drawerLabel:'Receipts',
              headerTitle:'Receipts',
              drawerIcon:({
                size,color
              })=>(
                <MaterialIcons name="receipt" size={24} color="black" />

              ),
              
            }}
          />


              <Drawer.Screen
            name="delivery"
            options={{
              headerShown: true,
              drawerLabel:'Sent SMS',
              headerTitle:'sent SMS',
              drawerIcon:({
                size,color
              })=>(
                
                <AntDesign name="message1" size={24} color="black" />

              ),
              
            }}
          />

          {/* Reports */}
          <Drawer.Screen
            name="reports"
            options={{
              headerShown: true,
              drawerLabel:'Reports',
              headerTitle:'Reports',
              drawerIcon:({
                size,color
              })=>(
                <Ionicons name="documents" size={24} color="black" />

              ),
              
            }}
          />

          {/* Tasks */}
          <Drawer.Screen
            name="tasks"
            options={{
              headerShown: true,
              drawerLabel:'Tasks',
              headerTitle:'Tasks',
              drawerIcon:({
                size,color
              })=>(
                <FontAwesome5 name="tasks" size={24} color="black" />

              ),
              
            }}
          />


           <Drawer.Screen
            name="assignTasks"
            options={{
              headerShown: true,
              drawerLabel:'Assigned Tasks',
              headerTitle:'Assigned Tasks',

              drawerIcon:({
                size,color
              })=>(
                <MaterialIcons name="assignment" size={24} color="black" />

              ),
              
            }}

            




          />
  
          {/* Users */}
          <Drawer.Screen
            name="users"
            options={{
              headerShown: true,
              drawerLabel:'Users',
              headerTitle:'Users',

              drawerIcon:({
                size,color
              })=>(
                <Entypo name="users" size={24} color="black" />

              ),
              
            }}

            //<MaterialIcons name="assignment" size={24} color="black" />




          />




           <Drawer.Screen
            name="profile"
            options={{
              headerShown: true,
              drawerLabel:'Profile',
              headerTitle:'Profile',

              drawerIcon:({
                size,color
              })=>(
                <AntDesign name="login" size={24} color="black" />

              ),
              
            }}

            //<MaterialIcons name="assignment" size={24} color="black" />

            


          />


            <Drawer.Screen
            name="CompanyProfile"
            options={{
              headerShown: true,
              drawerLabel:'Company Profile',
              headerTitle:'Company Profile',

              drawerIcon:({
                size,color
              })=>(
                <Octicons name="organization" size={24} color="black" />

              ),
              
            }}

            //<MaterialIcons name="assignment" size={24} color="black" />

            


          />





        </Drawer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: -8,
  },
  drawerLabel: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: 'black', // Default color
  },
  focusedDrawerLabel: {
    fontWeight: 'bold', // Highlight focused item
    color: 'blue', // Customize focus color
  },
});