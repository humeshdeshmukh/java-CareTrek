import React from 'react';
import { View, ActivityIndicator, Text as RNText } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createSelector } from '@reduxjs/toolkit';
import { selectIsAuthenticated, selectIsLoading } from '../store/authSlice';
import type { RootState } from '../store/store';
import { Provider as PaperProvider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthProvider from '../contexts/AuthProvider';
import { useAppSelector } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
// ProfileScreen is now defined locally
import HealthScreen from '../screens/HealthScreen';
import AlertsScreen from '../screens/AlertsScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Main: undefined;
  Register: undefined;
  ForgotPassword: { email?: string };
  Profile: undefined; // Add Profile to the stack param list
};

export type MainTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Health: undefined;
  Profile: undefined;
};

// Screen props types for tab screens
type TabScreenProps = {
  navigation: any; // Using any to avoid complex type definitions
  route: any;
};

// Navigation props types
export type AppNavigationProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component
const TabBarIcon = (focused: boolean, iconName: string, label: string) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons 
        name={focused ? iconName : `${iconName}-outline`} 
        size={24} 
        color={focused ? '#2F855A' : '#718096'} 
      />
      <RNText style={{ 
        fontSize: 12, 
        color: focused ? '#2F855A' : '#718096',
        marginTop: 4
      }}>
        {label}
      </RNText>
    </View>
  );
};

// Create screen components with proper typing
const HomeTab = (props: TabScreenProps) => <HomeScreen {...props} />;
const AlertsTab = (props: TabScreenProps) => <AlertsScreen {...props} />;
const HealthTab = (props: TabScreenProps) => <HealthScreen {...props} />;
const ProfileTab = (props: TabScreenProps) => <ProfileScreen {...props} />;

// Add proper typing for the Profile screen component
interface ProfileScreenProps {
  navigation: any;
  route: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RNText>Profile Screen</RNText>
    </View>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeTab} 
        options={{
          tabBarIcon: ({ focused }) => TabBarIcon(focused, 'home', 'Home'),
          tabBarLabel: 'Home',
        }} 
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsTab} 
        options={{
          tabBarIcon: ({ focused }) => TabBarIcon(focused, 'bell', 'Alerts'),
          tabBarLabel: 'Alerts',
          tabBarBadge: 3, // Example badge count
        }} 
      />
      <Tab.Screen 
        name="Health" 
        component={HealthTab} 
        options={{
          tabBarIcon: ({ focused }) => TabBarIcon(focused, 'heart-pulse', 'Health'),
          tabBarLabel: 'Health',
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileTab} 
        options={{
          tabBarIcon: ({ focused }) => TabBarIcon(focused, 'account', 'Profile'),
          tabBarLabel: 'Profile',
        }} 
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Memoized selectors
const selectAuthState = (state: RootState) => state.auth;
const selectAuthStatus = createSelector(
  [selectAuthState],
  (auth) => {
    // Ensure we have valid boolean values
    const isAuthenticated = Boolean(auth?.isAuthenticated);
    const loading = Boolean(auth?.loading);

    if (__DEV__) {
      console.log('Auth Status:', { 
        isAuthenticated, 
        loading, 
        rawAuth: {
          ...auth,
          // Don't log the entire user object if it's large
          user: auth?.user ? '[User Object]' : null,
        }
      });
    }
    
    return {
      isAuthenticated,
      loading,
    };
  }
);

const AppContent = () => {
  const { isAuthenticated, loading } = useAppSelector(selectAuthStatus);

  // Show loading state if we're still determining auth state
  if (loading === undefined || loading === true) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: 'fade' as const,
        // Explicitly set gestureEnabled as boolean to avoid passing string values
        gestureEnabled: false,
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="Profile" 
            component={ProfileTab}
            options={{
              headerShown: true,
              title: 'My Profile',
              headerBackTitle: 'Back'
            }}
          />
        </Stack.Group>
      ) : (
        // Auth screens
        <Stack.Group>
          <Stack.Screen 
            name="Auth" 
            component={AuthStack} 
            options={{ headerShown: false }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
};

export default AppNavigator;
