import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme, Card, Avatar, ActivityIndicator, FAB, Badge } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@contexts/AuthContext';

type RootStackParamList = {
  FamilyHome: undefined;
  SeniorProfile: { seniorId: string };
  ConnectionRequest: undefined;
  // Add other screens as needed
};

type Senior = {
  id: string;
  name: string;
  relationship: string;
  lastActive: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  profileImage?: string;
  unreadAlerts: number;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FamilyHome'>;

const FamilyHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seniors, setSeniors] = useState<Senior[]>([]);

  // Mock data - replace with actual API call
  const mockSeniors: Senior[] = [
    {
      id: '1',
      name: 'John Smith',
      relationship: 'Father',
      lastActive: '2h ago',
      healthStatus: 'good',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      unreadAlerts: 2,
    },
    {
      id: '2',
      name: 'Mary Johnson',
      relationship: 'Mother',
      lastActive: '5h ago',
      healthStatus: 'excellent',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      unreadAlerts: 0,
    },
  ];

  const loadSeniors = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSeniors(mockSeniors);
    } catch (error) {
      console.error('Error loading seniors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSeniors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSeniors();
  };

  const renderSeniorItem = ({ item }: { item: Senior }) => {
    const getStatusColor = () => {
      switch (item.healthStatus) {
        case 'excellent': return '#4CAF50';
        case 'good': return '#8BC34A';
        case 'fair': return '#FFC107';
        case 'poor': return '#F44336';
        default: return '#9E9E9E';
      }
    };

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('SeniorProfile', { seniorId: item.id })}
        activeOpacity={0.8}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                source={{ uri: item.profileImage }} 
                size={60}
                style={styles.avatar}
              />
              {item.unreadAlerts > 0 && (
                <Badge style={styles.badge} size={24}>
                  {item.unreadAlerts}
                </Badge>
              )}
            </View>
            <View style={styles.seniorInfo}>
              <Text style={[styles.seniorName, { color: theme.colors.onSurface }]}>
                {item.name}
              </Text>
              <Text style={[styles.relationship, { color: theme.colors.onSurfaceVariant }]}>
                {item.relationship}
              </Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[styles.statusDot, { backgroundColor: getStatusColor() }]} 
                />
                <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.healthStatus.charAt(0).toUpperCase() + item.healthStatus.slice(1)}
                </Text>
              </View>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant} 
            />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Family Connections
        </Text>
      </View>

      <FlatList
        data={seniors}
        renderItem={renderSeniorItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="elderly" 
              size={48} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No seniors connected yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Add a senior to get started
            </Text>
          </View>
        }
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('ConnectionRequest')}
        color="white"
      />
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  avatar: {
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
  },
  seniorInfo: {
    flex: 1,
  },
  seniorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    textTransform: 'capitalize',
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FamilyHomeScreen;
