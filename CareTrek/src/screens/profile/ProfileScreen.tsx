import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const auth = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // Fire logout thunk (signs out and clears auth state)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(logoutUser());
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.primary }]}>Profile</Text>

      <View style={styles.info}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Name</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{auth.user?.full_name || '—'}</Text>

        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Email</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{auth.user?.email || '—'}</Text>

        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Role</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{auth.role || auth.user?.role || '—'}</Text>
      </View>

      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Log out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12,
  },
  info: {
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  button: {
    marginTop: 30,
    width: '100%',
  },
});

export default ProfileScreen;
