import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Components for each page
import HomePage from './index';
import CollectionPage from './collection';
import CustomersPage from './customers';
import InvoicesPage from './invoices';
import PaymentsPage from './payments';
import ReceiptingPage from './receipting';
import ProfilePage from '../profile';
import SMSoutbox from '../smsDelivery/delivery';
import UserManagement from './users';
import Tasks from './tasks';
import AssignTasks from './assignTasks';
import ReportsPage from './reports';
import TenantDetailsScreen from '../companyprofile/CompanyProfile'

// Define role-based access to menu items
const MENU_ITEMS = [
  {
    name: 'Home',
    component: HomePage,
    label: 'Home',
    icon: 'home-outline',
    roles: [], // Accessible by all roles
  },
  {
    name: 'Collection',
    component: CollectionPage,
    label: 'Collection',
    icon: 'trash-outline',
    roles: ['collector', 'ADMIN', 'customer_manager'],
  },
  {
    name: 'Customers',
    component: CustomersPage,
    label: 'Customers',
    icon: 'people-outline',
    roles: ['ADMIN', 'customer_manager'],
  },
  {
    name: 'Invoices',
    component: InvoicesPage,
    label: 'Invoices',
    icon: 'document-text-outline',
    roles: ['ADMIN', 'accountant', 'customer_manager'],
  },
  {
    name: 'Payments',
    component: PaymentsPage,
    label: 'Payments',
    icon: 'card-outline',
    roles: ['ADMIN', 'accountant', 'customer_manager'],
  },
  {
    name: 'Receipting',
    component: ReceiptingPage,
    label: 'Receipts',
    icon: 'receipt-outline',
    roles: ['ADMIN', 'accountant', 'customer_manager'],
  },
  {
    name: 'Messages',
    component: SMSoutbox,
    label: 'Sent SMS',
    icon: 'chatbubble-outline',
    roles: ['ADMIN', 'customer_manager'],
  },
  {
    name: 'Management',
    component: UserManagement,
    label: 'Users',
    icon: 'person-outline',
    roles: ['ADMIN'],
  },


  {
    name: 'Reports',
    component: ReportsPage,
    label: 'Reports',
    icon: 'document-attach',
    roles: ['ADMIN'], // Accessible by all roles
  },
  {
    name: 'Tasks',
    component: Tasks,
    label: 'Tasks',
    icon: 'checkmark-done-outline',
    roles: [], // Accessible by all roles
  },
  {
    name: 'Assign Tasks',
    component: AssignTasks,
    label: 'Assign Trash Bag Tasks',
    icon: 'person-add-outline',
    roles: ['ADMIN'], // Accessible by all roles
  },

  {
    name: 'Company Profile',
    component: TenantDetailsScreen,
    label: 'Company Profile',
    icon: 'business',
    roles: ['ADMIN'],
  },
  {
    name: 'Profile',
    component: ProfilePage,
    label: 'Profile',
    icon: 'person-outline',
    roles: [], // Accessible by all roles
  },
];

const DrawerNavigator = createDrawerNavigator();

export default function DrawerLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Filter menu items based on the user's roles
  const accessibleMenuItems = MENU_ITEMS.filter(
    (item) =>
      item.roles.length === 0 || // Accessible by all roles
      (currentUser?.role && currentUser.role.some((role) => item.roles.includes(role)))
  );

  return (
    
      <NavigationContainer>
        <PaperProvider>
        <DrawerNavigator.Navigator
          initialRouteName="Home"
          screenOptions={({ navigation }) => ({
            drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: true,
            headerLeft: () => (
              <Ionicons
                name="menu"
                size={30}
                color={Colors[colorScheme ?? 'light'].text}
                style={{ marginLeft: 10 }}
                onPress={() => navigation.toggleDrawer()}
              />
            ),
          })}
        >
          {accessibleMenuItems.map((item) => (
            <DrawerNavigator.Screen
              key={item.name}
              name={item.name}
              component={item.component}
              options={{
                drawerLabel: item.label,
                drawerIcon: ({ color, size }) => <Ionicons name={item.icon} color={color} size={size} />,
              }}
            />
          ))}
        </DrawerNavigator.Navigator>
      </PaperProvider>
      </NavigationContainer>
    
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
