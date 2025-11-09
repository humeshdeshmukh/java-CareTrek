import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text as RNText } from 'react-native';
import { useTheme } from 'react-native-paper';
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
import ProfileEntry from '../screens/profile/ProfileEntry';
import SeniorTabNavigator from './SeniorTabNavigator';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// Dev screens
import NetworkDebugScreen from '../screens/dev/NetworkDebugScreen';

// Main App Screens
import SeniorHomeScreen from '../screens/senior/SeniorHomeScreen';
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Main: undefined;
  Register: undefined;
  ForgotPassword: { email?: string };
  NetworkDebug?: undefined;
  Profile: undefined;
  SeniorHome: undefined;
  FamilyHome: undefined;
  SeniorTabs: undefined;
  FamilyTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Health: undefined;
  Profile: undefined;
  SeniorHome: undefined;
  FamilyHome: undefined;
};

// Screen props types for tab screens
type TabScreenProps = {
  navigation: any;
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

// Create screen components with proper typing (ProfileScreen imported)

// Main Tab Navigator
const SeniorTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'SeniorHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Health') {
            iconName = focused ? 'heart-pulse' : 'heart-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
  <Tab.Screen name="SeniorHome" component={SeniorHomeScreen} />
  <Tab.Screen name="Profile" component={ProfileEntry} />
    </Tab.Navigator>
  );
};

const FamilyTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'FamilyHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Health') {
            iconName = focused ? 'heart-pulse' : 'heart-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
  <Tab.Screen name="FamilyHome" component={FamilyHomeScreen} />
  <Tab.Screen name="Profile" component={ProfileEntry} />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{
        headerShown: false,
        gestureEnabled: false
      }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{
        headerShown: true,
        title: 'Create Account',
        headerBackTitle: 'Back'
      }}
    />
    <Stack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen}
      options={{
        headerShown: true,
        title: 'Reset Password',
        headerBackTitle: 'Back'
      }}
    />
    {__DEV__ && (
      <Stack.Screen
        name="NetworkDebug"
        component={NetworkDebugScreen}
        options={{ headerShown: true, title: 'Network Debug' }}
      />
    )}
  </Stack.Navigator>
);

// Main App Stack
const MainStack = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.user_metadata?.role || 'senior'; // Default to senior if role not found

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'senior' ? (
        // Use the richer SeniorTabNavigator which defines HealthTab, ActivityTab, ProfileTab, etc.
        <Stack.Screen name="SeniorTabs" component={SeniorTabNavigator} />
      ) : (
        <Stack.Screen name="FamilyHome" component={FamilyTabs} />
      )}
      <Stack.Screen name="Profile" component={ProfileEntry} />
    </Stack.Navigator>
  );
};

// Memoized selectors
const selectAuthState = (state: RootState) => state.auth;
const selectAuthStatus = createSelector(
  [selectAuthState],
  (auth) => {
    // Ensure we have valid boolean values
      const isAuthenticated = Boolean(auth?.isAuthenticated);
      // auth slice uses `loading` (not `isLoading`) — coerce to boolean safely
      const isLoading = Boolean(auth?.loading);
      const role = auth?.role;

    if (__DEV__) {
      console.log('Auth Status:', { 
        isAuthenticated, 
        isLoading, 
        rawAuth: {
          ...auth,
          // Don't log the entire user object if it's large
          user: auth?.user 
        }
      });
    }
    
    return {
      isAuthenticated,
      // Return as `loading` because callers (AppContent) expect that name
      loading: isLoading,
      role,
    };
  }
);

const AppContent = () => {
  const { isAuthenticated, loading } = useAppSelector(selectAuthStatus);
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const role = user?.user_metadata?.role || 'senior';

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: 'fade' as const,
        gestureEnabled: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen 
          name={role === 'senior' ? 'SeniorTabs' : 'FamilyTabs'} 
          component={role === 'senior' ? SeniorTabNavigator : FamilyTabs}
        />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthStack}
        />
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
