import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

type CalendarViewProps = {
  route: {
    params: {
      appointments: Array<{
        id: string;
        title: string;
        date: string;
        time: string;
        location: string;
        type: string;
        status: 'scheduled' | 'completed' | 'cancelled';
      }>;
    };
  };
};

const CalendarView = ({ route }: CalendarViewProps) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { appointments = [] } = route.params || { appointments: [] };

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, any[]>);

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'doctor': return '#FF7043';
      case 'therapy': return '#7E57C2';
      case 'vaccination': return '#66BB6A';
      case 'family': return '#42A5F5';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button 
          onPress={() => navigation.goBack()}
          icon="arrow-left"
          mode="text"
          style={styles.backButton}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Appointments Calendar
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.entries(appointmentsByDate).length > 0 ? (
          Object.entries(appointmentsByDate)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, dayAppointments]) => (
              <View key={date} style={styles.dayContainer}>
                <Text variant="titleMedium" style={[styles.dateHeader, { color: theme.colors.primary }]}>
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </Text>
                {dayAppointments.map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    style={[
                      styles.appointmentCard, 
                      { 
                        backgroundColor: theme.colors.surface,
                        borderLeftColor: getAppointmentColor(appointment.type),
                        opacity: appointment.status !== 'scheduled' ? 0.7 : 1
                      }
                    ]}
                  >
                    <Card.Content>
                      <View style={styles.appointmentHeader}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                          {appointment.title}
                        </Text>
                        <View style={[
                          styles.statusBadge, 
                          { 
                            backgroundColor: appointment.status === 'completed' 
                              ? theme.colors.primary 
                              : appointment.status === 'cancelled'
                                ? theme.colors.error
                                : theme.colors.secondary
                          }
                        ]}>
                          <Text style={styles.statusText}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.appointmentInfo}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={16}
                          color={theme.colors.onSurfaceVariant}
                        />
                        <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                          {appointment.time}
                        </Text>
                      </View>
                      <View style={styles.appointmentInfo}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={16}
                          color={theme.colors.onSurfaceVariant}
                        />
                        <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                          {appointment.location}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color={theme.colors.onSurfaceDisabled}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceDisabled }]}>
              No appointments scheduled
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dateHeader: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  appointmentCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CalendarView;
