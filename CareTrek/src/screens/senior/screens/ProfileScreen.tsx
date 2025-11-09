import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Button, Card, Text, useTheme, Divider, List, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const theme = useTheme();
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Care St, Health City, HC 12345',
    emergencyContact: 'Jane Doe (Spouse) - (555) 987-6543',
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril, Metformin',
  };

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label="JD" 
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          labelStyle={styles.avatarText}
        />
        <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{user.name}</Text>
        <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user.email}</Text>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{user.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="home" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{user.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="alert-octagon" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{user.emergencyContact}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Health Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="water" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>Blood Type: {user.bloodType}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="alert" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>Allergies: {user.allergies}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="pill" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>Medications: {user.medications}</Text>
          </View>
          
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('MedicalID')}
            style={styles.viewMoreButton}
          >
            View Full Medical ID
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Settings</Text>
          
          <List.Item
            title="Notifications"
            description="Enable or disable notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Location Sharing"
            description="Allow family to see your location"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => (
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Account Settings"
            left={props => <List.Icon {...props} icon="account-cog" />}
            onPress={() => navigation.navigate('AccountSettings')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        onPress={() => {}}
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        labelStyle={styles.logoutButtonText}
      >
        Logout
      </Button>
      
      <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
        CareTrek v1.0.0
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  viewMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: 'white',
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 12,
  },
});

export default ProfileScreen;
