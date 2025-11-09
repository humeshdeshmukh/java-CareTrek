import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';

const SeniorHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      // Dispatch logout thunk which signs out from Supabase and clears auth state
      // We don't rely on the returned value here; just ensure sign-out is attempted.
      // If you prefer direct supabase call, we can call supabase.auth.signOut() instead.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(logoutUser());
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      // Reset navigation to the Auth flow so user lands on the login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    }
  };

  const handleSwitchToFamily = () => {
    // For testing: navigate to the FamilyTabs. This will only render if the
    // navigator contains `FamilyTabs` (MainStack does). This is a convenience
    // helper for testing the family UI without changing roles on the server.
    navigation.navigate('FamilyTabs' as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Welcome, Senior!</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>Your personalized dashboard is here.</Text>

      <View style={styles.actions}>
        <Button mode="contained" onPress={handleLogout} style={styles.button}>
          Log out
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});

export default SeniorHomeScreen;
