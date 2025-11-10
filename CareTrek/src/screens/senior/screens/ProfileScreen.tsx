import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatar, Button, Card, Text, useTheme, List, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../src/services/supabase';

interface ExtendedUserProfile {
  id: string;
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchUserAndProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!currentUser) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        return;
      }
      
      setUser(currentUser);
      
      // Try to get existing profile with only fields that exist in the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, created_at')
        .eq('id', currentUser.id)
        .single();

      // If profile doesn't exist, create one with default values
      if (profileError && profileError.code === 'PGRST116') {
        const newProfile = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          role: currentUser.user_metadata?.role || 'senior',
          phone: currentUser.phone || currentUser.user_metadata?.phone || '',
        };

        const { data: newProfileData, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfileData);
      } else if (profileError) {
        throw profileError;
      } else {
        setProfile(profileData);
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      } else if (session?.user) {
        await fetchUserAndProfile();
      }
    });

    // Handle profile updates from EditProfile screen
    const unsubscribe = navigation.addListener('focus', async () => {
      if (user?.id) {
        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, phone, created_at')
          .eq('id', user.id)
          .single();
          
        if (!error && updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    });

    // Initial fetch
    fetchUserAndProfile();

    return () => {
      subscription?.unsubscribe();
      unsubscribe();
    };
  }, [fetchUserAndProfile, navigation, user?.id]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleUpdateProfile = async (updates: Partial<ExtendedUserProfile>) => {
    if (!user?.id) return false;
    
    try {
      setLoading(true);
      // Only include fields that exist in our schema
      const { id, full_name, role, phone } = updates;
      const cleanUpdates = { id, full_name, role, phone };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', user.id)
        .select('id, full_name, role, phone, created_at')
        .single();

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    return name && name.trim() 
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text 
          size={100} 
          label={getInitials(profile?.full_name || user?.email)}
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          labelStyle={styles.avatarText}
        />
        
        <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
          {profile?.full_name || user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
          {user?.email || ''}
        </Text>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('EditProfile', { 
            profile,
            // Only pass serializable data
            userId: user?.id,
            initialValues: {
              full_name: profile?.full_name || '',
              phone: profile?.phone || '',
              role: profile?.role || 'senior'
            }
          })}
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
            <MaterialCommunityIcons name="account" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {profile?.full_name || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {profile?.phone || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              Role: {profile?.role || 'Not set'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="update" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}
            </Text>
          </View>
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
          
          <List.Item
            title="Location Sharing"
            description="Share your location with family members"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => (
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                color={theme.colors.primary}
              />
            )}
          />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          labelStyle={styles.logoutButtonText}
        >
          Logout
        </Button>
      </View>
      
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  editButton: {
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
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
  buttonContainer: {
    margin: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 12,
    opacity: 0.6,
  },
});

export default ProfileScreen;
// trailing duplicate/stray code removed. Single export kept above.