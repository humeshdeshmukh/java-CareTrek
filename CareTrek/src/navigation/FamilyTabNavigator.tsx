import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList, RootStackParamList } from './AppNavigator';

// Import family screens
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import SeniorProfileScreen from '../screens/family/SeniorProfileScreen';
import SeniorHealthScreen from '../screens/family/SeniorHealthScreen';
import MedicationScreen from '../screens/family/MedicationScreen';
import EmergencyScreen from '../screens/family/EmergencyScreen';
import AddFamilyMemberScreen from '../screens/family/AddFamilyMemberScreen';
// Import screens with proper types
const ActivityScreen = () => null; // Temporary placeholder
const ChatScreen = () => null; // Temporary placeholder
const ProfileScreen = () => null; // Temporary placeholder

// Import FamilyStack
import { FamilyStack } from './FamilyStack';

// Main Family Stack Navigator
type FamilyStackParamList = {
  FamilyHome: undefined;
  AddFamilyMember: undefined;
  SeniorProfile: { seniorId: string };
  SeniorHealth: { seniorId: string };
  Medication: { seniorId: string };
  Emergency: { seniorId: string };
  Activity: undefined;
  Chat: undefined;
  ConnectionRequests: undefined;
};

const FamilyMainStack = createStackNavigator<FamilyStackParamList>();

// Family Main Stack Navigator
const FamilyMainStackScreen = () => {
  return (
    <FamilyMainStack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <FamilyMainStack.Screen 
        name="FamilyHome" 
        component={FamilyHomeScreen} 
        options={{ 
          title: 'CareTrek Family',
          headerShown: false
        }}
      />
      <FamilyMainStack.Screen 
        name="SeniorProfile" 
        component={SeniorProfileScreen} 
        options={{ 
          title: 'Senior Profile',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="AddFamilyMember" 
        component={AddFamilyMemberScreen} 
        options={{ 
          title: 'Add Family Member',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="SeniorHealth" 
        component={SeniorHealthScreen} 
        options={{ 
          title: 'Health Overview',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="Medication" 
        component={MedicationScreen} 
        options={{ 
          title: 'Medications',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ 
          title: 'Emergency Contacts',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="Activity" 
        component={ActivityScreen} 
        options={{ 
          title: 'Activity',
          headerBackTitle: 'Back'
        }}
      />
      <FamilyMainStack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat',
          headerBackTitle: 'Back'
        }}
      />
    </FamilyMainStack.Navigator>
  );
};

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
