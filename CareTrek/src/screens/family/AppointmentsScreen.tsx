import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  useTheme, 
  Text, 
  Card, 
  Button, 
  IconButton, 
  Divider, 
  FAB,
  Portal,
  Dialog,
  TextInput,
  Menu,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Appointment = {
  id: string;
  title: string;
  doctor: string;
  date: Date;
  time: string;
  location: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'doctor' | 'therapy' | 'checkup' | 'other';
};

const AppointmentsScreen: React.FC = () => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Annual Checkup',
      doctor: 'Dr. Sarah Johnson',
      date: new Date(2023, 11, 15, 10, 0),
      time: '10:00 AM',
      location: 'City Medical Center, Room 302',
      notes: 'Bring recent test results and medication list',
      status: 'upcoming',
      type: 'checkup',
    },
    {
      id: '2',
      title: 'Physical Therapy',
      doctor: 'Dr. Michael Chen',
      date: new Date(2023, 11, 18, 14, 30),
      time: '2:30 PM',
      location: 'Rehabilitation Center, Main Floor',
      notes: 'Focus on lower back exercises',
      status: 'upcoming',
      type: 'therapy',
    },
    {
      id: '3',
      title: 'Cardiologist Follow-up',
      doctor: 'Dr. Robert Wilson',
      date: new Date(2023, 11, 20, 9, 15),
      time: '9:15 AM',
      location: 'Heart Care Associates, Suite 405',
      notes: 'Discuss test results',
      status: 'upcoming',
      type: 'doctor',
    },
  ]);

  const [visible, setVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter(appt => 
    filter === 'all' ? true : appt.status === filter
  );

  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'doctor';
      case 'therapy':
        return 'arm-flex';
      case 'checkup':
        return 'clipboard-pulse';
      default:
        return 'calendar';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setVisible(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setVisible(true);
  };

  const handleSaveAppointment = () => {
    // In a real app, this would save to your backend
    setVisible(false);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(appt => appt.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.chip}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'upcoming'}
          onPress={() => setFilter('upcoming')}
          style={styles.chip}
          selectedColor={theme.colors.primary}
        >
          Upcoming
        </Chip>
        <Chip
          selected={filter === 'completed'}
          onPress={() => setFilter('completed')}
          style={styles.chip}
          selectedColor={theme.colors.success}
        >
          Completed
        </Chip>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="calendar-remove" 
              size={48} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="titleMedium" style={styles.emptyText}>
              No appointments found
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Tap the + button to add a new appointment
            </Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              style={[styles.card, { borderLeftColor: getStatusColor(appointment.status) }]}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.appointmentType}>
                    <MaterialCommunityIcons 
                      name={getTypeIcon(appointment.type)} 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, marginLeft: 4 }}>
                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                    </Text>
                  </View>
                  <Chip 
                    mode="outlined" 
                    textStyle={{ fontSize: 12 }}
                    style={[styles.statusChip, { borderColor: getStatusColor(appointment.status) }]}
                    textStyle={{ color: getStatusColor(appointment.status) }}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Chip>
                </View>

                <Text variant="titleLarge" style={styles.appointmentTitle}>
                  {appointment.title}
                </Text>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons 
                    name="doctor" 
                    size={20} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {appointment.doctor}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={20} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {formatDate(appointment.date)} • {appointment.time}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={20} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {appointment.location}
                  </Text>
                </View>

                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Text variant="labelSmall" style={styles.notesLabel}>
                      Notes:
                    </Text>
                    <Text variant="bodyMedium">
                      {appointment.notes}
                    </Text>
                  </View>
                )}
              </Card.Content>
              
              <Card.Actions>
                <Button 
                  mode="outlined" 
                  onPress={() => handleEditAppointment(appointment)}
                  icon="pencil"
                >
                  Edit
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {}}
                  icon="calendar-check"
                  style={styles.actionButton}
                >
                  View Details
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddAppointment}
        color="white"
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>
            {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={selectedAppointment?.title || ''}
              onChangeText={(text) => {
                if (selectedAppointment) {
                  setSelectedAppointment({ ...selectedAppointment, title: text });
                }
              }}
              style={styles.input}
            />
            <TextInput
              label="Doctor"
              value={selectedAppointment?.doctor || ''}
              onChangeText={(text) => {
                if (selectedAppointment) {
                  setSelectedAppointment({ ...selectedAppointment, doctor: text });
                }
              }}
              style={styles.input}
            />
            <TextInput
              label="Date"
              value={selectedAppointment?.date.toLocaleDateString() || ''}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
            />
            <TextInput
              label="Time"
              value={selectedAppointment?.time || ''}
              right={<TextInput.Icon icon="clock" />}
              style={styles.input}
            />
            <TextInput
              label="Location"
              value={selectedAppointment?.location || ''}
              right={<TextInput.Icon icon="map-marker" />}
              style={styles.input}
            />
            <TextInput
              label="Notes"
              value={selectedAppointment?.notes || ''}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.notesInput]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveAppointment} mode="contained">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  chip: {
    marginRight: 8,
    height: 32,
  },
  card: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusChip: {
    height: 24,
    backgroundColor: 'transparent',
  },
  appointmentTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  notesLabel: {
    marginBottom: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  actionButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
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
  input: {
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default AppointmentsScreen;
