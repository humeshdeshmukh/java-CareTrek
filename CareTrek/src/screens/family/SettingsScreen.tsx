import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Linking } from 'react-native';
import { 
  useTheme, 
  Text, 
  List, 
  Divider, 
  Button, 
  IconButton,
  Avatar,
  Title,
  Portal,
  Dialog,
  Paragraph,
  Menu,
  TouchableRipple
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Notifications from 'expo-notifications';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync('https://caretrek.app/privacy');
  };

  const openTermsOfService = () => {
    WebBrowser.openBrowserAsync('https://caretrek.app/terms');
  };

  const openHelpCenter = () => {
    WebBrowser.openBrowserAsync('https://caretrek.app/help');
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@caretrek.app');
  };

  const handleLogout = () => {
    // Implement logout logic here
    setVisible(false);
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        // Handle the case where user denies permission
        return;
      }
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const menuItems = [
    { label: 'English', value: 'English' },
    { label: 'Español', value: 'Spanish' },
    { label: 'Français', value: 'French' },
    { label: 'Deutsch', value: 'German' },
    { label: '中文', value: 'Chinese' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Avatar.Icon 
                size={80} 
                icon="account" 
                style={{ backgroundColor: theme.colors.primary }}
                color="white"
              />
              <IconButton
                icon="camera"
                size={20}
                onPress={() => {}}
                style={[styles.editPhotoButton, { backgroundColor: theme.colors.primary }]}
                iconColor="white"
              />
            </View>
            <Title style={[styles.userName, { color: theme.colors.onPrimaryContainer }]}>
              Sarah Johnson
            </Title>
            <Text style={[styles.userEmail, { color: theme.colors.onPrimaryContainer }]}>
              sarah.johnson@example.com
            </Text>
          </View>
        </View>

        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Account
          </List.Subheader>
          
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
            onPress={() => {}}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" color={theme.colors.primary} />}
            onPress={() => {}}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Payment Methods"
            left={props => <List.Icon {...props} icon="credit-card" color={theme.colors.primary} />}
            onPress={() => {}}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Preferences
          </List.Subheader>
          
          <List.Item
            title="Notifications"
            description="Receive important updates and alerts"
            left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                color={theme.colors.primary}
              />
            )}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Dark Mode"
            description="Enable dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={theme.colors.primary}
              />
            )}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setMenuVisible(true)}>
                <List.Item
                  title="Language"
                  description={selectedLanguage}
                  left={props => <List.Icon {...props} icon="translate" color={theme.colors.primary} />}
                  right={props => <List.Icon {...props} icon="menu-down" />}
                  style={styles.listItem}
                  titleStyle={{ color: theme.colors.onSurface }}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                />
              </TouchableRipple>
            }
          >
            {menuItems.map((item) => (
              <Menu.Item
                key={item.value}
                onPress={() => {
                  setSelectedLanguage(item.label);
                  setMenuVisible(false);
                }}
                title={item.label}
                titleStyle={{
                  color: selectedLanguage === item.label ? theme.colors.primary : theme.colors.onSurface,
                }}
              />
            ))}
          </Menu>
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Biometric Login"
            description="Use fingerprint or face recognition"
            left={props => <List.Icon {...props} icon="fingerprint" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                color={theme.colors.primary}
              />
            )}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Support
          </List.Subheader>
          
          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            onPress={openHelpCenter}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Contact Support"
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
            onPress={contactSupport}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
            onPress={openPrivacyPolicy}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
            onPress={openTermsOfService}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
        </List.Section>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => setVisible(true)}
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            labelStyle={{ color: 'white' }}
            icon="logout"
          >
            Sign Out
          </Button>
        </View>

        <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
          CareTrek v1.0.0
        </Text>
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to sign out?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  listItem: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  divider: {
    height: 1,
    opacity: 0.5,
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    fontSize: 12,
  },
});

export default SettingsScreen;
