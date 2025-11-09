import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme, Card, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';

// Define the parameter list for the root stack
// Define the parameter list for the root stack
type RootStackParamList = {
  // Bottom Tabs
  HomeTab: undefined;
  ActivityTab: undefined;
  HealthTab: undefined;
  ProfileTab: undefined;
  
  // Screens that can be navigated to directly
  SeniorHome: undefined;
  Health: undefined;
  Medication: undefined;
  Emergency: undefined;
  ShareID: undefined;
  ConnectionRequest: {
    familyMemberId: string;
    familyMemberName: string;
    familyMemberAvatar?: string;
    relationship?: string;
    timestamp: string;
  };
  FallDetection: undefined;
  Profile: undefined;
  Activity: undefined;
  Appointments: undefined;
  MedicalID: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorHome'>;

const SeniorHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    hydration: 5,
    steps: 0,
    sleep: 7.5,
  });

  const fetchHealthData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, fetch actual health data here
      setHealthData({
        heartRate: 72 + Math.floor(Math.random() * 10),
        hydration: Math.min(8, Math.max(0, healthData.hydration + (Math.random() > 0.5 ? 1 : -1))),
        steps: healthData.steps + Math.floor(Math.random() * 100),
        sleep: 7.5,
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHealthData();
  };

  const quickActions = [
    { 
      id: 'health', 
      title: 'Health', 
      icon: 'heart-pulse' as const,
      screen: 'Health' as const,
      color: '#F44336'
    },
    { 
      id: 'medication', 
      title: 'Medication', 
      icon: 'pill' as const,
      screen: 'Medication' as const,
      color: '#4CAF50'
    },
    { 
      id: 'activity', 
      title: 'Activity', 
      icon: 'run' as const,
      screen: 'Activity' as const,
      color: '#2196F3'
    },
    { 
      id: 'appointments', 
      title: 'Appointments', 
      icon: 'calendar' as const,
      screen: 'Appointments' as const,
      color: '#673AB7'
    },
    { 
      id: 'fallDetection', 
      title: 'Fall Detection', 
      icon: 'alert-octagon' as const,
      screen: 'FallDetection' as const,
      color: '#FF9800'
    },
    { 
      id: 'medicalId', 
      title: 'Medical ID', 
      icon: 'card-account-details' as const,
      screen: 'MedicalID' as const,
      color: '#9C27B0'
    },
    { 
      id: 'shareId', 
      title: 'Share ID', 
      icon: 'account-plus' as const,
      screen: 'ShareID' as const,
      color: '#00BCD4'
    },
    { 
      id: 'profile', 
      title: 'Profile', 
      icon: 'account' as const,
      screen: 'Profile' as const,
      color: '#607D8B'
    }
  ];

  const recentActivities = [
    { 
      id: '1', 
      title: `Heart rate: ${healthData.heartRate} BPM`, 
      time: '10:30 AM', 
      icon: 'heart-pulse' as const,
      color: '#F44336'
    },
    { 
      id: '2', 
      title: `Steps: ${healthData.steps}`, 
      time: '03:45 PM', 
      icon: 'walk' as const,
      color: '#2196F3'
    },
    { 
      id: '3', 
      title: `Hydration: ${healthData.hydration}/8 glasses`, 
      time: '05:20 PM', 
      icon: 'cup-water' as const,
      color: '#00BCD4'
    },
    { 
      id: '4', 
      title: 'Medication taken', 
      time: '08:00 AM', 
      icon: 'check-circle' as const,
      color: '#4CAF50'
    },
  ];

  const navigateTo = (screen: keyof RootStackParamList) => {
    try {
      // Map screen names to their corresponding tab names
      const tabMap: Record<string, string> = {
        'Health': 'HealthTab',
        'Medication': 'HealthTab',
        'Emergency': 'HealthTab',
        'Appointments': 'HomeTab',
        'Activity': 'ActivityTab',
        'Profile': 'ProfileTab',
        'MedicalID': 'ProfileTab',
        'ShareID': 'ProfileTab',
        'ConnectionRequest': 'ProfileTab'
      };

      const tabName = tabMap[screen as string];

      // If this screen belongs to a tab, navigate via the parent Tab navigator
      if (tabName) {
          // Walk up the parent chain to find a navigator that knows about the tab route
          let parent = (navigation as any).getParent ? (navigation as any).getParent() : null;
          let targetParent = null as any;

          while (parent) {
            try {
              const state = parent.getState ? parent.getState() : null;
              const routeNames = state?.routeNames || state?.routes?.map((r: any) => r.name) || [];
              if (routeNames && routeNames.includes(tabName)) {
                targetParent = parent;
                break;
              }
            } catch (e) {
              // ignore and continue climbing
            }
            parent = parent.getParent ? parent.getParent() : null;
          }

          if (targetParent && typeof targetParent.navigate === 'function') {
            // If we also want to open a specific nested screen within the tab,
            // pass the `screen` param to the tab navigator (supported by nested navigators)
            if (['Health', 'Medication', 'Emergency', 'MedicalID', 'ShareID', 'ConnectionRequest', 'Activity', 'Profile', 'Appointments'].includes(screen as string)) {
              // Navigate to the tab, then to the specific screen inside that tab's stack
              // e.g. parent.navigate('HealthTab', { screen: 'Medication' })
              // @ts-ignore - dynamic nested navigation
              targetParent.navigate(tabName, { screen });
            } else {
              // Just navigate to the tab's default screen
              // @ts-ignore - tabName is a valid route on the parent navigator
              targetParent.navigate(tabName);
            }
          } else {
            // Fallback: try to navigate locally (may fail if route isn't in this navigator)
            // @ts-ignore
            navigation.navigate(tabName as any);
          }
      } else {
        // Not a tab route — navigate locally
        // @ts-ignore
        navigation.navigate(screen as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>
              Welcome,
            </Text>
            <Text style={[styles.name, { color: theme.colors.primary }]} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigateTo('Profile')}
            style={styles.avatarContainer}
          >
            <Avatar.Text 
              size={56} 
              label={getUserInitials(user?.name)} 
              style={{ 
                backgroundColor: theme.colors.primary,
                elevation: 2,
              }}
              labelStyle={{ 
                color: 'white', 
                fontSize: 20,
                fontFamily: 'sans-serif-medium'
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => navigateTo(action.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <MaterialCommunityIcons 
                name={action.icon} 
                size={28} 
                color="white" 
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText} numberOfLines={2}>
                {action.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Health Summary */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Health Summary
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.healthSummaryContainer}
      >
        <Card 
          style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateTo('Health')}
        >
          <Card.Content style={styles.healthCardContent}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#F44336" />
            <View style={styles.healthCardText}>
              <Text style={[styles.healthCardTitle, { color: theme.colors.onSurfaceVariant }]}>
                Heart Rate
              </Text>
              <Text style={[styles.healthCardValue, { color: theme.colors.onSurface }]}>
                {healthData.heartRate} <Text style={styles.healthCardUnit}>BPM</Text>
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card 
          style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateTo('Health')}
        >
          <Card.Content style={styles.healthCardContent}>
            <MaterialCommunityIcons name="water" size={24} color="#2196F3" />
            <View style={styles.healthCardText}>
              <Text style={[styles.healthCardTitle, { color: theme.colors.onSurfaceVariant }]}>
                Hydration
              </Text>
              <Text style={[styles.healthCardValue, { color: theme.colors.onSurface }]}>
                {healthData.hydration} <Text style={styles.healthCardUnit}>glasses</Text>
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card 
          style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateTo('Activity')}
        >
          <Card.Content style={styles.healthCardContent}>
            <MaterialCommunityIcons name="walk" size={24} color="#4CAF50" />
            <View style={styles.healthCardText}>
              <Text style={[styles.healthCardTitle, { color: theme.colors.onSurfaceVariant }]}>
                Steps
              </Text>
              <Text style={[styles.healthCardValue, { color: theme.colors.onSurface }]}>
                {healthData.steps.toLocaleString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card 
          style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateTo('Health')}
        >
          <Card.Content style={styles.healthCardContent}>
            <MaterialCommunityIcons name="sleep" size={24} color="#9C27B0" />
            <View style={styles.healthCardText}>
              <Text style={[styles.healthCardTitle, { color: theme.colors.onSurfaceVariant }]}>
                Sleep
              </Text>
              <Text style={[styles.healthCardValue, { color: theme.colors.onSurface }]}>
                {healthData.sleep}h <Text style={styles.healthCardUnit}>last night</Text>
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Recent Activity
        </Text>
        <Button 
          mode="text" 
          onPress={() => {}}
          labelStyle={{ fontSize: 12 }}
          textColor={theme.colors.primary}
        >
          View All
        </Button>
      </View>
      <View style={styles.activityList}>
        {recentActivities.map((activity) => (
          <Card 
            key={activity.id} 
            style={[styles.activityItem, { 
              backgroundColor: theme.colors.surface,
              elevation: 1,
            }]}
            onPress={() => {}}
          >
            <Card.Content style={styles.activityContent}>
              <View style={[styles.activityIconContainer, { backgroundColor: `${activity.color}20` }]}>
                <MaterialCommunityIcons 
                  name={activity.icon} 
                  size={20} 
                  color={activity.color}
                />
              </View>
              <View style={styles.activityText}>
                <Text 
                  style={[
                    styles.activityTitle, 
                    { color: theme.colors.onSurface }
                  ]}
                  numberOfLines={1}
                >
                  {activity.title}
                </Text>
                <Text 
                  style={[
                    styles.activityTime, 
                    { color: theme.colors.onSurfaceVariant }
                  ]}
                >
                  {activity.time}
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color={theme.colors.onSurfaceVariant}
              />
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Emergency Button */}
      <View style={styles.emergencyButtonContainer}>
        <TouchableOpacity 
          style={[styles.emergencyButton, { 
            backgroundColor: '#FF3B30',
            shadowColor: '#FF3B30',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }]}
          onPress={() => navigateTo('Emergency')}
          activeOpacity={0.9}
        >
          <View style={styles.emergencyButtonContent}>
            <MaterialCommunityIcons 
              name="alert" 
              size={24} 
              color="white" 
              style={styles.emergencyButtonIcon}
            />
            <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Helper function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32, // Increased top padding even more
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 50, // Increased top padding even more
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    marginLeft: 8,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
    opacity: 0.8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    width: '48%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  actionButtonContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButtonIcon: {
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  healthSummaryContainer: {
    paddingBottom: 8,
  },
  healthSummary: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  healthCard: {
    width: 150,
    borderRadius: 12,
    marginRight: 12,
    elevation: 1,
  },
  healthCardLast: {
    marginRight: 0,
  },
  healthCardContent: {
    padding: 12,
  },
  healthCardText: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthCardTitle: {
    fontSize: 14,
    color: '#666',
  },
  healthCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  healthCardUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  activityList: {
    marginBottom: 16,
  },
  activityItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    marginRight: 16,
  },
  activityText: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  emergencyButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  emergencyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyButtonIcon: {
    marginRight: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SeniorHomeScreen;
