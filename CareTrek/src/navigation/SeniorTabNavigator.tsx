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
import LocationScreen from '../screens/senior/screens/LocationScreen';
import AppointmentsScreen from '../screens/senior/screens/AppointmentsScreen';
import ChatScreen from '../screens/senior/screens/ChatScreen';
import AddFamilyMemberScreen from '../screens/senior/screens/AddFamilyMemberScreen';
import CalendarView from '../screens/senior/screens/CalendarView';
import AddAppointmentScreen from '../screens/senior/screens/AddAppointmentScreen';

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
  Appointments: undefined;
  Profile: undefined;
  Activity: undefined;
  EditProfile: undefined;
  AccountSettings: undefined;
  PrivacyPolicy: undefined;
  MedicalID: undefined;
  Location: undefined;
  Chat: undefined;
  AddFamilyMember: undefined;
  CalendarView: { appointments: any[] };
  AddAppointment: undefined;
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
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Appointments',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat with Care Team',
        }} 
      />
      <Stack.Screen 
        name="AddFamilyMember" 
        component={AddFamilyMemberScreen} 
        options={{ 
          title: 'Add Family Member',
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
        name="CalendarView" 
        component={CalendarView} 
        options={{ 
          title: 'Calendar View',
        }} 
      />
      <Stack.Screen 
        name="AddAppointment" 
        component={AddAppointmentScreen} 
        options={{ 
          title: 'Add Appointment',
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
      initialRouteName="Medication"
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
        name="Medication" 
        component={MedicationScreen} 
        options={{ 
          title: 'Medication',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Health" 
        component={HealthDashboardScreen} 
        options={{ 
          title: 'Health Dashboard',
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

// Stack Navigator for Chat tab
const ChatStack = () => {
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
      initialRouteName="Chat"
    >
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat with Care Team',
          headerShown: true,
        }} 
      />
      {/* Add more chat-related screens here if needed */}
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
      initialRouteName="Profile"
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
        name="Location" 
        component={LocationScreen} 
        options={{ 
          title: 'My Location',
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
        name="MedicalID" 
        component={MedicalIDScreen}
        options={{ 
          title: 'Medical ID',
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
    </Stack.Navigator>
  );
};

const SeniorTabNavigator = () => {
  const theme = useTheme();

  // Update the tab bar icon for Chat tab
  const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
    let iconName: string = 'home';

    if (route.name === 'HomeTab') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'ChatTab') {
      iconName = focused ? 'message-text' : 'message-text-outline';
    } else if (route.name === 'HealthTab') {
      iconName = focused ? 'heart-pulse' : 'heart-pulse';
    } else if (route.name === 'ProfileTab') {
      iconName = focused ? 'account' : 'account-outline';
    }

    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          return getTabBarIcon(route, focused, color, size);
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
        ],
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HealthTab"
        component={HealthStack}
        options={{
          title: 'Medication',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HealthTab', { screen: 'Medication' });
          },
        })}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{
          title: 'Profile',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ProfileTab', { screen: 'Profile' });
          },
        })}
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
