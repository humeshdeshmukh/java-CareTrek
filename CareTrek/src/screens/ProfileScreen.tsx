import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock user data - will be replaced with actual data from the backend
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    emergencyContact: 'Jane Doe (Wife) - +1 (555) 987-6543',
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril, Metformin',
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout');
    // navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={100} 
            color={theme.colors.primary} 
          />
        </View>
        <Text style={[styles.userName, { color: theme.colors.primary }]}>{user.name}</Text>
        <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user.email}</Text>
        
        <Button 
          mode="contained" 
          onPress={handleEditProfile}
          style={styles.editButton}
          labelStyle={styles.buttonLabel}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{user.address}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Emergency Contact:</Text>
              <Text style={styles.infoValue}>{user.emergencyContact}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Information</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type:</Text>
              <Text style={styles.infoValue}>{user.bloodType}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Allergies:</Text>
              <Text style={styles.infoValue}>{user.allergies}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Medications:</Text>
              <Text style={styles.infoValue}>{user.medications}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={[styles.buttonLabel, { color: theme.colors.error }]}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: 'rgba(47, 133, 90, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
  },
  editButton: {
    width: '100%',
    marginTop: 8,
    borderRadius: 8,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 2,
  },
  logoutButton: {
    borderColor: '#E53E3E',
    borderRadius: 8,
    borderWidth: 1.5,
  },
});

export default ProfileScreen;
