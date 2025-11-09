import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, useTheme, Button, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type AlertsScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock alerts data - will be replaced with actual data from the backend
  const [alerts, setAlerts] = React.useState([
    {
      id: '1',
      type: 'medication',
      title: 'Medication Reminder',
      message: 'Time to take your Lisinopril (10mg)',
      time: '10:30 AM',
      date: '2023-11-10',
      read: false,
      action: 'Dismiss',
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Annual checkup with Dr. Johnson tomorrow at 2:00 PM',
      time: 'Yesterday',
      date: '2023-11-09',
      read: true,
      action: 'View',
    },
    {
      id: '3',
      type: 'health',
      title: 'Abnormal Heart Rate',
      message: 'Your heart rate was elevated (98 bpm) during your afternoon walk',
      time: 'Nov 8',
      date: '2023-11-08',
      read: true,
      action: 'Details',
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'New features available in the latest update',
      time: 'Nov 5',
      date: '2023-11-05',
      read: true,
      action: 'Update',
    },
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'appointment':
        return 'calendar-clock';
      case 'health':
        return 'heart-pulse';
      case 'system':
        return 'alert-circle';
      default:
        return 'bell';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'medication':
        return '#3182CE'; // blue
      case 'appointment':
        return '#805AD5'; // purple
      case 'health':
        return '#E53E3E'; // red
      case 'system':
        return '#38B2AC'; // teal
      default:
        return '#718096'; // gray
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const renderAlertItem = ({ item }: { item: typeof alerts[0] }) => (
    <Card 
      style={[
        styles.alertCard, 
        !item.read && { borderLeftWidth: 4, borderLeftColor: getAlertColor(item.type) }
      ]}
    >
      <Card.Content style={styles.alertContent}>
        <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(item.type)}20` }]}>
          <MaterialCommunityIcons 
            name={getAlertIcon(item.type)} 
            size={20} 
            color={getAlertColor(item.type)} 
          />
        </View>
        
        <View style={styles.alertTextContainer}>
          <View style={styles.alertHeader}>
            <Text style={[styles.alertTitle, !item.read && { fontWeight: 'bold' }]}>
              {item.title}
            </Text>
            <Text style={styles.alertTime}>{item.time}</Text>
          </View>
          
          <Text style={styles.alertMessage}>{item.message}</Text>
          
          <View style={styles.alertFooter}>
            <Button 
              mode="text" 
              onPress={() => console.log(`Action: ${item.action} ${item.id}`)}
              labelStyle={{ fontSize: 14, color: theme.colors.primary }}
              compact
            >
              {item.action}
            </Button>
            
            {!item.read && (
              <Button 
                mode="text" 
                onPress={() => markAsRead(item.id)}
                labelStyle={{ fontSize: 14, color: theme.colors.onSurface }}
                compact
              >
                Mark as read
              </Button>
            )}
          </View>
        </View>
        
        <IconButton
          icon="close"
          size={16}
          onPress={() => deleteAlert(item.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <Button 
          mode="text" 
          onPress={() => setAlerts(alerts.map(alert => ({ ...alert, read: true })))}
          labelStyle={{ color: theme.colors.primary }}
        >
          Mark all as read
        </Button>
      </View>
      
      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="bell-off-outline" 
            size={64} 
            color={theme.colors.onSurface} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Alerts</Text>
          <Text style={styles.emptyText}>You don't have any alerts at the moment.</Text>
          <Button 
            mode="contained" 
            onPress={() => console.log('Refresh')}
            style={styles.refreshButton}
            labelStyle={styles.buttonLabel}
          >
            Refresh
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  alertContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  deleteButton: {
    margin: -8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  refreshButton: {
    borderRadius: 8,
    width: '100%',
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 2,
  },
});

export default AlertsScreen;
