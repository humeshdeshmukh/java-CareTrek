import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { 
  useTheme, 
  Text, 
  Button, 
  Card, 
  Avatar, 
  IconButton, 
  Divider,
  ActivityIndicator,
  Searchbar
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface Senior {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  profileImage?: string;
  status: 'pending' | 'connected' | 'not_connected';
}

const ConnectionRequestScreen: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const [seniors, setSeniors] = useState<Senior[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      relationship: 'Father',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Mary Johnson',
      email: 'mary.johnson@example.com',
      phone: '+1 (555) 987-6543',
      relationship: 'Mother',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      status: 'not_connected',
    },
    {
      id: '3',
      name: 'Robert Davis',
      email: 'robert.davis@example.com',
      phone: '+1 (555) 456-7890',
      relationship: 'Grandfather',
      status: 'not_connected',
    },
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you would filter the list from your API
  };

  const handleConnect = async (seniorId: string) => {
    try {
      setConnectingId(seniorId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSeniors(seniors.map(senior => 
        senior.id === seniorId 
          ? { ...senior, status: 'pending' as const } 
          : senior
      ));
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setConnectingId(null);
    }
  };

  const handleCancelRequest = async (seniorId: string) => {
    try {
      setConnectingId(seniorId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setSeniors(seniors.map(senior => 
        senior.id === seniorId 
          ? { ...senior, status: 'not_connected' as const } 
          : senior
      ));
    } catch (error) {
      console.error('Error canceling connection request:', error);
    } finally {
      setConnectingId(null);
    }
  };

  const filteredSeniors = seniors.filter(senior => 
    senior.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    senior.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    senior.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = filteredSeniors.filter(s => s.status === 'pending');
  const suggestedConnections = filteredSeniors.filter(s => s.status === 'not_connected');

  const renderSeniorCard = (senior: Senior) => (
    <Card key={senior.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.seniorInfo}>
          {senior.profileImage ? (
            <Avatar.Image 
              source={{ uri: senior.profileImage }} 
              size={60}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text 
              size={60}
              label={senior.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
              color={theme.colors.onPrimaryContainer}
              labelStyle={styles.avatarText}
            />
          )}
          <View style={styles.seniorDetails}>
            <Text style={[styles.seniorName, { color: theme.colors.onSurface }]}>
              {senior.name}
            </Text>
            <Text style={[styles.seniorRelationship, { color: theme.colors.primary }]}>
              {senior.relationship}
            </Text>
            <Text style={[styles.seniorContact, { color: theme.colors.onSurfaceVariant }]}>
              {senior.email}
            </Text>
          </View>
        </View>
        
        {senior.status === 'pending' ? (
          <Button 
            mode="outlined" 
            onPress={() => handleCancelRequest(senior.id)}
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            loading={connectingId === senior.id}
            disabled={!!connectingId}
          >
            Cancel Request
          </Button>
        ) : (
          <Button 
            mode="contained" 
            onPress={() => handleConnect(senior.id)}
            style={styles.actionButton}
            loading={connectingId === senior.id}
            disabled={!!connectingId}
          >
            Connect
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Searchbar
          placeholder="Search by name, email, or relationship"
          onChangeText={handleSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          iconColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {pendingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Pending Requests
                </Text>
                {pendingRequests.map(renderSeniorCard)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {suggestedConnections.length > 0 ? 'Suggested Connections' : 'No results found'}
              </Text>
              {suggestedConnections.map(renderSeniorCard)}
            </View>
          </>
        )}

        <View style={styles.addManuallyContainer}>
          <Text style={[styles.addManuallyText, { color: theme.colors.onSurfaceVariant }]}>
            Can't find who you're looking for?
          </Text>
          <Button 
            mode="text" 
            onPress={() => {}}
            textColor={theme.colors.primary}
            icon="account-plus"
            style={styles.addManuallyButton}
          >
            Add Manually
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  seniorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seniorDetails: {
    flex: 1,
  },
  seniorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  seniorRelationship: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  seniorContact: {
    fontSize: 13,
  },
  actionButton: {
    minWidth: 120,
    borderRadius: 8,
  },
  addManuallyContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
  },
  addManuallyText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  addManuallyButton: {
    marginTop: 4,
  },
});

export default ConnectionRequestScreen;
