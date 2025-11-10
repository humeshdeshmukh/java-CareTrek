import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, useTheme, Text, RadioButton, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SeniorTabParamList } from '../../../../src/navigation/SeniorTabNavigator';
import { createAppointment } from '../../../../src/services/appointmentService';
import DateTimePicker from '@react-native-community/datetimepicker';

type DateTimePickerEvent = {
  type: string;
  nativeEvent: {
    timestamp: number;
  };
};

type AddAppointmentScreenNavigationProp = NativeStackNavigationProp<SeniorTabParamList, 'AddAppointment'>;

const AddAppointmentScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddAppointmentScreenNavigationProp>();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('doctor');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the appointment');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const appointmentDate = new Date(date);
      appointmentDate.setHours(time.getHours(), time.getMinutes());
      
      await createAppointment({
        title,
        type,
        date: appointmentDate.toISOString(),
        location,
        notes,
        status: 'scheduled'
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Appointment Type
          </Text>
          <RadioButton.Group onValueChange={value => setType(value)} value={type}>
            <View style={styles.radioItem}>
              <RadioButton.Android value="doctor" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Doctor</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android value="therapy" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Therapy</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android value="vaccination" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Vaccination</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android value="family" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Family</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android value="other" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurface }}>Other</Text>
            </View>
          </RadioButton.Group>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <TextInput
              label="Date"
              value={date.toLocaleDateString()}
              onFocus={() => setShowDatePicker(true)}
              mode="outlined"
              style={styles.input}
              editable={false}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              label="Time"
              value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              onFocus={() => setShowTimePicker(true)}
              mode="outlined"
              style={styles.input}
              editable={false}
            />
          </View>
        </View>

        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { minHeight: 100 }]}
          mode="outlined"
          multiline
          numberOfLines={4}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.onPrimary }}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Appointment'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, { borderColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.primary }}
          disabled={loading}
        >
          Cancel
        </Button>
      </ScrollView>

      {/* Date Picker Modal */}
      <Portal>
        <Modal
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        </Modal>
      </Portal>

      {/* Time Picker Modal */}
      <Portal>
        <Modal
          visible={showTimePicker}
          onDismiss={() => setShowTimePicker(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

export default AddAppointmentScreen;
