import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { 
  useTheme, 
  Button, 
  Card, 
  Text, 
  Menu, 
  Avatar, 
  IconButton, 
  List, 
  Divider, 
  Snackbar,
  Chip
} from 'react-native-paper';
import { FamilyService } from '../../services/family.service';
import { useAuth } from '../../contexts/AuthContext';
import { FamilyConnection, ConnectionStatus } from '../../types/family';
import { StackNavigationProp } from '@react-navigation/stack';
import { FamilyStackParamList } from '../../navigation/FamilyStack';

type FamilyConnectionsScreenNavigationProp = StackNavigationProp<
  FamilyStackParamList,
  'FamilyConnections'
>;

interface FamilyConnectionsScreenProps {
  navigation: FamilyConnectionsScreenNavigationProp;
}

export const FamilyConnectionsScreen = ({ navigation }: FamilyConnectionsScreenProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await FamilyService.getConnectionRequests();
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections. Please try again.');
      setSnackbarMessage('Failed to load connections');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, []);

  const handleRespond = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      await FamilyService.respondToRequest(connectionId, status);
      setSnackbarMessage(`Request ${status} successfully`);
      setSnackbarVisible(true);
      loadConnections();
    } catch (error) {
      console.error('Error responding to request:', error);
      setSnackbarMessage(`Failed to ${status} request`);
      setSnackbarVisible(true);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      await FamilyService.removeConnection(connectionId);
      setSnackbarMessage('Connection removed successfully');
      setSnackbarVisible(true);
      loadConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      setSnackbarMessage('Failed to remove connection');
      setSnackbarVisible(true);
    }
  };

  const renderConnectionItem = ({ item }: { item: FamilyConnection }) => {
    const otherUser = item.senior_id === user?.id 
      ? { name: item.family_member_name, email: item.family_member_email }
      : { name: item.senior_name, email: item.senior_email };

    return (
      <Card style={styles.connectionCard}>
        <Card.Content>
          <View style={styles.connectionHeader}>
            <Avatar.Text 
              size={50} 
              label={otherUser.name?.charAt(0) || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.connectionInfo}>
              <Text variant="titleMedium">{otherUser.name || 'Unknown User'}</Text>
              <Text variant="bodyMedium" style={styles.emailText}>
                {otherUser.email}
              </Text>
              <View style={styles.chipContainer}>
                <Chip 
                  mode="outlined" 
                  style={[
                    styles.statusChip, 
                    item.status === 'accepted' && styles.statusAccepted,
                    item.status === 'pending' && styles.statusPending,
                    item.status === 'rejected' && styles.statusRejected
                  ]}
                >
                  {item.status}
                </Chip>
              </View>
            </View>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(item.id)}
                />
              }
            >
              {item.status === 'pending' && (
                <Menu.Item
                  leadingIcon="check"
                  onPress={() => {
                    handleRespond(item.id, 'accepted');
                    setMenuVisible(null);
                  }}
                  title="Accept"
                />
              )}
              <Menu.Item
                leadingIcon="delete"
                onPress={() => {
                  handleRemoveConnection(item.id);
                  setMenuVisible(null);
                }}
                title={item.status === 'pending' ? 'Reject' : 'Remove'}
              />
              <Menu.Item
                leadingIcon="cog"
                onPress={() => {
                  navigation.navigate('ConnectionSettings', { connectionId: item.id });
                  setMenuVisible(null);
                }}
                title="Settings"
              />
            </Menu>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="titleMedium" style={styles.emptyStateText}>
        No connections yet
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Add family members to see them here
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('NewConnection')}
        style={styles.addButton}
      >
        Add Family Member
      </Button>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={loadConnections}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          renderItem={renderConnectionItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={loadConnections} 
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={connections.length === 0 && styles.emptyListContainer}
        />
      )}
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('NewConnection')}
        style={styles.addButton}
        icon="account-plus"
        contentStyle={styles.addButtonContent}
      >
        Add Family Member
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  connectionCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  connectionInfo: {
    flex: 1,
  },
  emailText: {
    color: '#666',
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusChip: {
    marginRight: 8,
    height: 24,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFA000',
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  addButton: {
    margin: 16,
  },
  addButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
  },
});
