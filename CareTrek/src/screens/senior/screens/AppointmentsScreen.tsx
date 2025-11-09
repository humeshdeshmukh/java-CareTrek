import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Button, useTheme, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Appointment = {
  id: string;
  title: string;
  type: 'doctor' | 'therapy' | 'vaccination' | 'family';
  date: string;
  time: string;
  location: string;
  notes?: string;
  reminder: boolean;
};

const AppointmentsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const appointments: Appointment[] = [
    {
      id: '1',
      title: 'Dr. Smith - Cardiology',
      type: 'doctor',
      date: '2023-11-15',
      time: '10:00 AM',
      location: 'City Medical Center',
      notes: 'Bring recent test results',
      reminder: true,
    },
    {
      id: '2',
      title: 'Physical Therapy',
      type: 'therapy',
      date: '2023-11-16',
      time: '02:30 PM',
      location: 'Rehab Center',
      reminder: true,
    },
    {
      id: '3',
      title: 'Family Dinner',
      type: 'family',
      date: '2023-11-17',
      time: '07:00 PM',
      location: 'Home',
      reminder: true,
    },
  ];

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

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
            <Text style={[styles.appointmentTitle, { color: theme.colors.onSurface }]}>
              {item.title}
            </Text>
            <View style={styles.appointmentInfo}>
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.appointmentText, { color: theme.colors.textSecondary }]}>
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
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.appointmentText, { color: theme.colors.textSecondary }]}>
                {item.location}
              </Text>
            </View>
            {item.notes && (
              <View style={styles.appointmentInfo}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.appointmentText, { color: theme.colors.textSecondary }]}>
                  {item.notes}
                </Text>
              </View>
            )}
          </View>
          {item.reminder && (
            <MaterialCommunityIcons
              name="bell-ring"
              size={20}
              color={theme.colors.primary}
              style={styles.reminderIcon}
            />
          )}
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button onPress={() => console.log('Directions')}>
          Directions
        </Button>
        <Button onPress={() => console.log('Reschedule')}>
          Reschedule
        </Button>
        <Button onPress={() => console.log('Cancel')} mode="contained">
          Done
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Upcoming Appointments
        </Text>
        <Button
          mode="outlined"
          onPress={() => console.log('View Calendar')}
          style={styles.calendarButton}
        >
          View Calendar
        </Button>
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No upcoming appointments
            </Text>
          </View>
        }
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => console.log('Add Appointment')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AppointmentsScreen;
