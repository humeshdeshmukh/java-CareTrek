import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { 
  useTheme, 
  Text, 
  Card, 
  IconButton, 
  FAB as PaperFAB, 
  Badge, 
  Searchbar,
  Menu,
  Divider,
  Chip,
  Avatar,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NotificationType = 'medication' | 'appointment' | 'alert' | 'activity' | 'message';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: NotificationType;
  read: boolean;
  sender?: {
    name: string;
    avatar?: string;
  };
  action?: () => void;
};

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Medication Reminder',
      message: 'Time to take your morning medication',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      type: 'medication',
      read: false,
      action: () => console.log('View medication'),
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      message: 'Appointment with Dr. Smith in 1 hour',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      type: 'appointment',
      read: false,
      sender: {
        name: 'Dr. Smith',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      },
    },
    {
      id: '3',
      title: 'Health Alert',
      message: 'Irregular heart rate detected',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      type: 'alert',
      read: true,
      action: () => console.log('View health alert'),
    },
    {
      id: '4',
      title: 'New Message',
      message: 'Mom sent you a message',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      type: 'message',
      read: true,
      sender: {
        name: 'Mom',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
    },
    {
      id: '5',
      title: 'Activity Detected',
      message: 'Unusual activity detected in the living room',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'activity',
      read: true,
      action: () => console.log('View activity'),
    },
  ]);

  const filteredNotifications = notifications
    .filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || notification.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationTypes: NotificationType[] = ['medication', 'appointment', 'alert', 'activity', 'message'];

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true,
    })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'appointment':
        return 'calendar-clock';
      case 'alert':
        return 'alert-circle';
      case 'activity':
        return 'motion-sensor';
      case 'message':
        return 'message-text';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'alert':
        return '#F44336'; // Red
      case 'medication':
        return '#4CAF50'; // Green
      case 'appointment':
        return '#2196F3'; // Blue
      case 'activity':
        return '#FF9800'; // Orange
      case 'message':
        return '#9C27B0'; // Purple
      default:
        return theme.colors.primary;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card 
      style={[styles.notificationCard, { 
        backgroundColor: item.read ? theme.colors.surface : theme.colors.surfaceVariant 
      }]}
      onPress={() => {
        markAsRead(item.id);
        item.action?.();
      }}
    >
      <Card.Content style={styles.notificationContent}>
        <View style={styles.notificationIconContainer}>
          <View 
            style={[
              styles.notificationIcon, 
              { backgroundColor: `${getNotificationColor(item.type)}20` }
            ]}
          >
            <MaterialCommunityIcons 
              name={getNotificationIcon(item.type)} 
              size={20} 
              color={getNotificationColor(item.type)} 
            />
          </View>
          {!item.read && (
            <View style={styles.unreadBadge} />
          )}
        </View>
        
        <View style={styles.notificationTextContainer}>
          <View style={styles.notificationHeader}>
            <Text 
              variant="titleSmall" 
              style={[
                styles.notificationTitle, 
                { fontWeight: item.read ? 'normal' : 'bold' }
              ]}
            >
              {item.title}
            </Text>
            <Text variant="labelSmall" style={styles.notificationTime}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
          
          <Text 
            variant="bodyMedium" 
            style={[
              styles.notificationMessage,
              { color: item.read ? theme.colors.onSurfaceVariant : theme.colors.onSurface }
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          
          {item.sender && (
            <View style={styles.senderContainer}>
              <Avatar.Image 
                size={24} 
                source={{ uri: item.sender.avatar }} 
                style={styles.avatar}
              />
              <Text variant="bodySmall" style={styles.senderName}>
                {item.sender.name}
              </Text>
            </View>
          )}
        </View>
        
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => {
            // Show action menu
          }}
          style={styles.menuButton}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={styles.title}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text variant="bodySmall" style={styles.subtitle}>
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </Text>
          )}
        </View>
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              markAllAsRead();
              setMenuVisible(false);
            }} 
            title="Mark all as read" 
            leadingIcon="check-all"
          />
          <Menu.Item 
            onPress={() => {
              // Clear all notifications
              setNotifications([]);
              setMenuVisible(false);
            }} 
            title="Clear all" 
            leadingIcon="delete-outline"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              // Notification settings
              setMenuVisible(false);
            }} 
            title="Notification settings" 
            leadingIcon="cog"
          />
        </Menu>
      </View>
      
      <Searchbar
        placeholder="Search notifications..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={theme.colors.onSurfaceVariant}
        placeholderTextColor={theme.colors.onSurfaceVariant}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
          showSelectedOverlay
        >
          All
        </Chip>
        {notificationTypes.map(type => (
          <Chip
            key={type}
            selected={filter === type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterChip,
              { 
                backgroundColor: filter === type ? 
                  `${getNotificationColor(type)}20` : 
                  theme.colors.surfaceVariant 
              }
            ]}
            textStyle={{ 
              color: filter === type ? 
                getNotificationColor(type) : 
                theme.colors.onSurfaceVariant 
            }}
            showSelectedOverlay={false}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Chip>
        ))}
      </ScrollView>
      
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="bell-off-outline" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text variant="titleMedium" style={styles.emptyText}>
            No notifications found
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {searchQuery ? 'Try a different search term' : 'All caught up!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <PaperFAB
        icon="bell-plus"
        style={styles.fab}
        onPress={() => {
          // Add new notification or reminder
        }}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    minHeight: 36,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 16,
  },
  notificationsList: {
    padding: 16,
    paddingTop: 8,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
  },
  notificationTime: {
    color: '#9E9E9E',
    marginLeft: 8,
  },
  notificationMessage: {
    opacity: 0.9,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    marginRight: 8,
  },
  senderName: {
    color: '#757575',
  },
  menuButton: {
    margin: -8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default NotificationsScreen;
