import 'react-native-get-random-values';
import React from 'react';
import { StatusBar, View, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store, persistor } from './src/store/store';
import { lightTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={lightTheme.colors.primary} />
  </View>
);

const AppContent = () => {
  const { theme, isDarkMode } = useAppTheme();
  
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.onSurface,
            border: theme.colors.outline,
            notification: theme.colors.error,
          },
        }}
      >
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  // Development helpers: clear persisted state and capture global errors.
  React.useEffect(() => {
    const clearPersistedState = async () => {
      try {
        // For debugging, remove the persisted store and any purge flag so we
        // start with a completely fresh state. Do NOT enable this in
        // production.
        await AsyncStorage.removeItem('persist:root');
        await AsyncStorage.removeItem('persist:purged_v2');
        console.log('Persisted state cleared (dev purge).');
      } catch (error) {
        console.error('Error clearing persisted state:', error);
      }
    };

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      clearPersistedState();

      try {
        // @ts-ignore
        const globalAny: any = global || globalThis;
        if (globalAny.ErrorUtils && typeof globalAny.ErrorUtils.setGlobalHandler === 'function') {
          const defaultHandler = globalAny.ErrorUtils.getGlobalHandler && globalAny.ErrorUtils.getGlobalHandler();
          globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
            console.error('Global JS Error captured:', { error, isFatal, stack: error?.stack });
            if (defaultHandler) defaultHandler(error, isFatal);
          });
        }

        // Capture unhandled promise rejections in environments that support `process`.
        // @ts-ignore
        if (globalAny.process && typeof globalAny.process.on === 'function') {
          // @ts-ignore
          globalAny.process.on('unhandledRejection', (reason: any) => {
            console.error('Unhandled Rejection:', reason);
          });
        }
      } catch (err) {
        console.warn('Could not set global error handlers:', err);
      }
    } else {
      console.log('Skipping dev-only persisted purge.');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <AuthProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </PersistGate>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.background,
  },
});