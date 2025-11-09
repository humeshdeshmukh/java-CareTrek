import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';

const SeniorProfileScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const auth = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(logoutUser());
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.primary }]}>Senior Profile</Text>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{auth.user?.full_name || '—'}</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{auth.user?.email || '—'}</Text>

      <View style={{ width: '100%' }}>
        <Button mode="contained" onPress={handleLogout} style={styles.button}>
          Log out
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginVertical: 12 },
  label: { fontSize: 12, color: '#666', marginTop: 12 },
  value: { fontSize: 16, marginTop: 4 },
  button: { marginTop: 30, width: '100%' },
});

export default SeniorProfileScreen;
