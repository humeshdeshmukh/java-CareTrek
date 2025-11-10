import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Linking } from 'react-native';
import { Text, Card, Button, useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../contexts/AuthContext';
import { getAppointments, updateAppointment } from '../../../services/appointmentService';
import { Appointment } from '../../../types/appointment';
import { SeniorTabParamList } from '../../../navigation/SeniorTabNavigator';

type AppointmentsScreenNavigationProp = NativeStackNavigationProp<SeniorTabParamList, 'Appointments'>;

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

const AppointmentsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AppointmentsScreenNavigationProp>();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setError(null);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const markAsDone = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { status: 'completed' });
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'completed' } 
            : apt
        )
      );
    } catch (err) {
      console.error('Error updating appointment:', err);
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    // @ts-ignore - We'll handle this screen later
    navigation.navigate('EditAppointment', { appointment });
  };

  const handleAddAppointment = () => {
    // @ts-ignore - We'll handle this screen later
    navigation.navigate('AddAppointment');
  };
  
  const handleViewCalendar = () => {
    navigation.navigate('CalendarView', { appointments });
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'doctor';
      case 'therapy':
        return 'arm-flex';
      case 'vaccination':
        return 'needle';
      case 'family':
        return 'account-group';
      default:
        return 'calendar';
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'doctor':
        return '#FF7043';
      case 'therapy':
        return '#7E57C2';
      case 'vaccination':
        return '#66BB6A';
      case 'family':
        return '#42A5F5';
      default:
        return '#9E9E9E';
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const isCompleted = item.status === 'completed';
    const isCancelled = item.status === 'cancelled';
    
    return (
      <Card 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.surface,
            opacity: isCompleted || isCancelled ? 0.7 : 1
          }
        ]}
      >
        <Card.Content>
          <View style={styles.appointmentHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getAppointmentColor(item.type) + '20' }]}>
              <MaterialCommunityIcons
                name={getAppointmentIcon(item.type) as any}
                size={24}
                color={getAppointmentColor(item.type)}
              />
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.titleRow}>
                <Text 
                  style={[
                    styles.appointmentTitle, 
                    { 
                      color: theme.colors.onSurface,
                      textDecorationLine: isCompleted ? 'line-through' : 'none'
                    }
                  ]}
                >
                  {item.title}
                </Text>
                {isCompleted && (
                  <Text style={[styles.statusBadge, { backgroundColor: theme.colors.primary }]}>
                    Completed
                  </Text>
                )}
                {isCancelled && (
                  <Text style={[styles.statusBadge, { backgroundColor: theme.colors.error }]}>
                    Cancelled
                  </Text>
                )}
              </View>
              
              <View style={styles.appointmentInfo}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.appointmentText, { color: theme.colors.onSurfaceVariant }]}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' at '}
                  {item.time}
                </Text>
              </View>
              
              <View style={styles.appointmentInfo}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.appointmentText, { color: theme.colors.onSurfaceVariant }]}>
                  {item.location}
                </Text>
              </View>
              
              {item.notes && (
                <View style={styles.appointmentInfo}>
                  <MaterialCommunityIcons
                    name="note-text"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.appointmentText, { color: theme.colors.onSurfaceVariant }]}>
                    {item.notes}
                  </Text>
                </View>
              )}
            </View>
            
            {item.reminder && !isCompleted && !isCancelled && (
              <MaterialCommunityIcons
                name="bell-ring"
                size={20}
                color={theme.colors.primary}
                style={styles.reminderIcon}
              />
            )}
          </View>
        </Card.Content>
        
        {!isCompleted && !isCancelled && (
          <Card.Actions style={styles.cardActions}>
            <Button 
              onPress={() => {
                // Open maps with location
                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
                Linking.openURL(url).catch((err: Error) => {
                  Alert.alert('Error', 'Could not open maps');
                });
              }}
            >
              Directions
            </Button>
            <Button onPress={() => handleReschedule(item)}>
              Reschedule
            </Button>
            <Button 
              onPress={() => markAsDone(item.id)} 
              mode="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Done'}
            </Button>
          </Card.Actions>
        )}
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchAppointments}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'scheduled' && new Date(`${apt.date}T${apt.time}`) >= new Date()
  );
  
  const pastAppointments = appointments.filter(
    apt => apt.status !== 'scheduled' || new Date(`${apt.date}T${apt.time}`) < new Date()
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Upcoming Appointments
        </Text>
        <Button
          mode="outlined"
          onPress={handleViewCalendar}
          style={styles.calendarButton}
          icon="calendar"
        >
          View Calendar
        </Button>
      </View>

      <FlatList
        data={upcomingAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No appointments scheduled
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddAppointment}
              style={styles.addButton}
            >
              Add Appointment
            </Button>
          </View>
        }
        ListFooterComponent={
          pastAppointments.length > 0 ? (
            <View style={styles.pastAppointmentsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Past Appointments
              </Text>
              {pastAppointments.map(item => (
                <View key={item.id} style={styles.pastAppointment}>
                  {renderAppointment({ item })}
                </View>
              ))}
            </View>
          ) : null
        }
      />

      {upcomingAppointments.length > 0 && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={handleAddAppointment}
          color="white"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendarButton: {
    borderRadius: 20,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  appointmentText: {
    fontSize: 14,
    marginLeft: 4,
  },
  reminderIcon: {
    marginLeft: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 16,
  },
  pastAppointmentsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pastAppointment: {
    marginBottom: 16,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AppointmentsScreen;
