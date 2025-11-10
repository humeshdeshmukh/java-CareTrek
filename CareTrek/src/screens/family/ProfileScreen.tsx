import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { 
  useTheme, 
  Avatar, 
  Title, 
  Text, 
  Button, 
  List, 
  Divider,
  IconButton,
  Card
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();

  // Mock user data - replace with actual user data from your auth context
  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    relationship: 'Daughter',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    connectedSeniors: [
      { id: '1', name: 'John Smith', relationship: 'Father' },
      { id: '2', name: 'Mary Johnson', relationship: 'Mother' },
    ],
  };

  const menuItems = [
    { icon: 'notifications', title: 'Notifications', onPress: () => {} },
    { icon: 'security', title: 'Privacy & Security', onPress: () => {} },
    { icon: 'help', title: 'Help & Support', onPress: () => {} },
    { icon: 'info', title: 'About CareTrek', onPress: () => {} },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar.Image 
            size={100} 
            source={{ uri: user.profileImage }} 
            style={styles.avatar}
          />
          <IconButton
            icon="camera"
            size={24}
            onPress={() => {}}
            style={styles.editPhotoButton}
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
          />
        </View>
        
        <Title style={[styles.name, { color: theme.colors.onSurface }]}>
          {user.name}
        </Title>
        <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
          {user.email}
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Account Information
          </Title>
          
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Phone
            </Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {user.phone}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Relationship
            </Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {user.relationship}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Connected Seniors
          </Title>
          
          {user.connectedSeniors.map((senior, index) => (
            <React.Fragment key={senior.id}>
              <View style={styles.seniorItem}>
                <View style={styles.seniorInfo}>
                  <Text style={[styles.seniorName, { color: theme.colors.onSurface }]}>
                    {senior.name}
                  </Text>
                  <Text style={[styles.seniorRelationship, { color: theme.colors.onSurfaceVariant }]}>
                    {senior.relationship}
                  </Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  onPress={() => {}}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              </View>
              
              {index < user.connectedSeniors.length - 1 && (
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
              )}
            </React.Fragment>
          ))}
          
          <Button 
            mode="text" 
            onPress={() => {}}
            textColor={theme.colors.primary}
            style={styles.addButton}
            icon="plus"
          >
            Add Senior
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <List.Item
                title={item.title}
                left={props => <List.Icon {...props} icon={item.icon} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={item.onPress}
                titleStyle={{ color: theme.colors.onSurface }}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && (
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
              )}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        onPress={() => {}}
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        labelStyle={{ color: 'white' }}
        icon="logout"
      >
        Sign Out
      </Button>

      <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
        CareTrek v1.0.0
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  seniorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  seniorInfo: {
    flex: 1,
  },
  seniorName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  seniorRelationship: {
    fontSize: 14,
  },
  addButton: {
    marginTop: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    opacity: 0.5,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 6,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});

export default ProfileScreen;
