import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Import screens
import SeniorHomeScreen from '../screens/senior/SeniorHomeScreen';
import HealthDashboardScreen from '../screens/senior/screens/HealthDashboardScreen';
import MedicationScreen from '../screens/senior/screens/MedicationScreen';
import EmergencyScreen from '../screens/senior/screens/EmergencyScreen';
import ShareIDScreen from '../screens/senior/screens/ShareIDScreen';
import ConnectionRequestScreen from '../screens/senior/screens/ConnectionRequestScreen';
import FallDetectionScreen from '../screens/senior/screens/FallDetectionScreen';
import ProfileScreen from '../screens/senior/screens/ProfileScreen';
import ActivityScreen from '../screens/senior/screens/ActivityScreen';
import MedicalIDScreen from '../screens/senior/screens/MedicalIDScreen';

export type SeniorTabParamList = {
  // Bottom Tab Navigation
  HomeTab: undefined;
  ActivityTab: undefined;
  HealthTab: undefined;
  ProfileTab: undefined;
  
  // Nested Stack Navigation
  SeniorHome: undefined;
  Health: undefined;
  Medication: undefined;
  Emergency: undefined;
  ShareID: undefined;
  ConnectionRequest: {
    familyMemberId: string;
    familyMemberName: string;
    familyMemberAvatar?: string;
    relationship?: string;
    timestamp: string;
  };
  FallDetection: undefined;
  Profile: undefined;
  Activity: undefined;
  EditProfile: undefined;
  AccountSettings: undefined;
  PrivacyPolicy: undefined;
  MedicalID: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<SeniorTabParamList>();

// Stack Navigator for Home tab
const HomeStack = () => {
  const theme = useTheme();
  
  const screenOptions: StackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.colors.surface,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      fontWeight: '600',
    },
    headerBackTitle: 'Back',
  };

  return (
    <Stack.Navigator 
      screenOptions={screenOptions}
      initialRouteName="SeniorHome"
    >
      <Stack.Screen 
        name="SeniorHome" 
        component={SeniorHomeScreen} 
        options={{ 
          title: 'Home',
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold',
                color: theme.colors.onSurface
              }}>
                CareTrek
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 16 }}
              onPress={() => {/* Handle notification press */}}
            >
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={24} 
                color={theme.colors.onSurface} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="ShareID" 
        component={ShareIDScreen} 
        options={{ 
          title: 'Share My ID',
        }} 
      />
      <Stack.Screen 
        name="ConnectionRequest" 
        component={ConnectionRequestScreen} 
        options={{ 
          title: 'Connection Request',
        }} 
      />
      <Stack.Screen 
        name="FallDetection" 
        component={FallDetectionScreen} 
        options={{ 
          title: 'Fall Detection',
        }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'My Profile',
        }} 
      />
      <Stack.Screen 
        name="Activity" 
        component={ActivityScreen} 
        options={{ 
          title: 'Activity',
        }} 
      />
      <Stack.Screen 
        name="MedicalID" 
        component={MedicalIDScreen} 
        options={{ 
          title: 'Medical ID',
        }} 
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Health tab
const HealthStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="Health" 
        component={HealthDashboardScreen} 
        options={{ 
          title: 'Health Dashboard',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Medication" 
        component={MedicationScreen} 
        options={{ 
          title: 'Medication',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ 
          title: 'Emergency',
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Profile tab
const ProfileStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'My Profile',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={ProfileScreen} // Replace with actual EditProfileScreen
        options={{ 
          title: 'Edit Profile',
        }} 
      />
      <Stack.Screen 
        name="AccountSettings" 
        component={ProfileScreen} // Replace with actual AccountSettingsScreen
        options={{ 
          title: 'Account Settings',
        }} 
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={ProfileScreen} // Replace with actual PrivacyPolicyScreen
        options={{ 
          title: 'Privacy Policy',
        }} 
      />
      <Stack.Screen 
        name="MedicalID" 
        component={MedicalIDScreen}
        options={{ 
          title: 'Medical ID',
        }} 
      />
    </Stack.Navigator>
  );
};

const SeniorTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 0,
          marginBottom: 4,
          fontFamily: 'sans-serif-medium',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityScreen}
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HealthTab"
        component={HealthStack}
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    marginRight: 16,
  },
});

export default SeniorTabNavigator;
        options={{ title: 'Health' }}
      />
      <Tab.Screen 
        name="Medication" 
        component={MedicationScreen} 
        options={{ title: 'Medication' }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{
          title: 'Emergency',
          tabBarLabelStyle: {
            color: '#ff3b30',
            fontSize: 12,
            marginBottom: 5,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="alert"
              size={size}
              color="#ff3b30"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SeniorTabNavigator;
