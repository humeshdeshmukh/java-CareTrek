import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useTheme, Card, Avatar, ActivityIndicator, FAB, Badge, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FamilyContext';
import type { FamilyConnection as ServiceFamilyConnection } from '../../services/family.service';
import { format } from 'date-fns';

// Import the FamilyStackParamList type from AppNavigator
import type { FamilyStackParamList } from '../../navigation/AppNavigator';

// Combined type for navigation props
type HomeScreenNavigationProp = StackNavigationProp<FamilyStackParamList, 'FamilyHome'>;

type FamilyConnection = Omit<ServiceFamilyConnection, 'senior_name' | 'senior_avatar'> & {
  senior_name: string;
  senior_avatar: string;
  unreadAlerts?: number;
};

const FamilyHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { connections, loading, refreshConnections } = useFamily();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Family Connections',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: theme.colors.surface,
      },
      headerTitleStyle: {
        color: theme.colors.onSurface,
        fontSize: 20,
        fontWeight: '600',
      },
    });
  }, [navigation, theme]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshConnections();
    setRefreshing(false);
  }, [refreshConnections]);

  const getHealthStatus = (lastActive: string): 'excellent' | 'good' | 'fair' | 'poor' => {
    const hoursAgo = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 1) return 'excellent';
    if (hoursAgo < 24) return 'good';
    if (hoursAgo < 72) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'fair':
        return '#FFC107';
      case 'poor':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="group" size={64} color={theme.colors.primary} />
      <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        No family members added yet
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddFamilyMember')}
        style={styles.addButton}
      >
        Add Family Member
      </Button>
    </View>
  );

  const renderConnection = ({ item }: { item: FamilyConnection }) => {
    const status = getHealthStatus(item.updated_at);
    const statusColor = getStatusColor(status);
    
    const handleSeniorPress = (seniorId: string) => {
    // Navigate to the SeniorProfile screen in the current stack
    navigation.navigate('SeniorProfile', { seniorId });
  };

    return (
      <TouchableOpacity onPress={() => handleSeniorPress(item.senior_id)}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={60}
                source={{
                  uri: item.senior_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.senior_name || '')}`,
                }}
              />
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.senior_name || 'Unknown User'}</Text>
              <Text style={styles.relationship}>{item.relationship || 'Family Member'}</Text>
              <Text style={styles.lastActive}>
                Last active: {format(new Date(item.updated_at), 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
            {item.unreadAlerts && item.unreadAlerts > 0 && (
              <Badge style={styles.badge}>{item.unreadAlerts}</Badge>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if ((loading || isAuthLoading) && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant, // Use a lighter border color
        elevation: 2, // Add subtle shadow on Android
        shadowColor: theme.colors.shadow, // Add shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }]}>
        <Text style={[styles.title, { 
          // color: theme.colors.onSurface,
          color: theme.colors.primary
        }]}>
          Family Connections
        </Text>
      </View>

      {connections.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={connections as unknown as FamilyConnection[]}
          renderItem={renderConnection}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('AddFamilyMember')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 24, // Increased top padding
    paddingBottom: 12,
    marginBottom: 8, // Add some space below the header
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  statusDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
    bottom: 2,
    right: 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
    width: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FamilyHomeScreen;
