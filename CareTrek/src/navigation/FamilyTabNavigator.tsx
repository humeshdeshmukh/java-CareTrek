import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList, RootStackParamList } from './AppNavigator';
import { FamilyStackParamList } from './FamilyStack';
import { FamilyStackParamList } from './FamilyStack';

// Import family screens
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import SeniorProfileScreen from '../screens/family/SeniorProfileScreen';
import SeniorHealthScreen from '../screens/family/SeniorHealthScreen';
import MedicationScreen from '../screens/family/MedicationScreen';
import EmergencyScreen from '../screens/family/EmergencyScreen';
// Import screens with proper types
const ActivityScreen = () => null; // Temporary placeholder
const ChatScreen = () => null; // Temporary placeholder
const ProfileScreen = () => null; // Temporary placeholder

// Import FamilyStack
import { FamilyStack } from './FamilyStack';

// Main Family Stack Navigator
const FamilyMainStack = createStackNavigator<RootStackParamList>();

// Family Main Stack Navigator
const FamilyMainStackScreen = () => (
  <FamilyMainStack.Navigator screenOptions={{ headerShown: false }}>
    <FamilyMainStack.Screen 
      name="FamilyHome" 
      component={FamilyHomeScreen} 
      options={{ title: 'CareTrek Family' }}
    />
    <FamilyMainStack.Screen 
      name="SeniorProfile" 
      component={SeniorProfileScreen} 
      options={{ headerShown: true, title: 'Senior Profile' }}
    />
    <FamilyMainStack.Screen 
      name="SeniorHealth" 
      component={SeniorHealthScreen} 
      options={{ headerShown: true, title: 'Health Overview' }}
    />
    <FamilyMainStack.Screen 
      name="Medication" 
      component={MedicationScreen} 
      options={{ headerShown: true, title: 'Medications' }}
    />
    <FamilyMainStack.Screen 
      name="Emergency" 
      component={EmergencyScreen} 
      options={{ headerShown: true, title: 'Emergency & Safety' }}
    />
    <FamilyMainStack.Screen 
      name="Activity" 
      component={ActivityScreen} 
      options={{ headerShown: true, title: 'Activity' }}
    />
    <FamilyMainStack.Screen 
      name="Chat" 
      component={ChatScreen} 
      options={{ headerShown: true, title: 'Chat' }}
    />
    <FamilyMainStack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ headerShown: true, title: 'My Profile' }}
    />
  </FamilyMainStack.Navigator>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const FamilyTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'FamilyHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Connections') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return (
            <MaterialCommunityIcons 
              name={iconName} 
              size={size} 
              color={color} 
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen 
        name="FamilyHome" 
        component={FamilyMainStackScreen} 
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Connections" 
        component={FamilyStack} 
        options={{
          title: 'Connections',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{
          title: 'Chat',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default FamilyTabNavigator;
