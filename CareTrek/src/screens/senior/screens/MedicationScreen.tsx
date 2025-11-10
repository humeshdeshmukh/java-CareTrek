import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Text, Button, useTheme, Portal, Modal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../../src/services/supabase';
import { useAuth } from '@hooks/useAuth';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  user_id: string;
  created_at: string;
  taken_today: boolean;
}

const MedicationScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('Daily');

  // Fetch medications from Supabase
  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .order('time', { ascending: true });

      if (error) throw error;
      
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  // Load medications on component mount
  useEffect(() => {
    fetchMedications();
  }, [user]);

  // Handle marking medication as taken
  const handleMarkAsTaken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medication_history')
        .insert([{
          medication_id: id,
          taken_at: new Date().toISOString(),
          user_id: user?.id
        }]);

      if (error) throw error;

      // Update local state to reflect the change
      setMedications(medications.map(med => 
        med.id === id ? { ...med, taken_today: true } : med
      ));
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      Alert.alert('Error', 'Failed to update medication status');
    }
  };

  // Handle form submission (add/edit)
  const handleSubmit = async () => {
    if (!name || !dosage || !time) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editingMed) {
        // Update existing medication
        const { error } = await supabase
          .from('medications')
          .update({
            name,
            dosage,
            time,
            frequency,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMed.id);

        if (error) throw error;
      } else {
        // Add new medication
        const { error } = await supabase
          .from('medications')
          .insert([{
            name,
            dosage,
            time,
            frequency,
            user_id: user?.id,
            taken_today: false
          }]);

        if (error) throw error;
      }

      // Refresh the list and close modal
      await fetchMedications();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication');
    }
  };

  // Delete medication
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      Alert.alert('Error', 'Failed to delete medication');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setDosage('');
    setTime('');
    setFrequency('Daily');
    setEditingMed(null);
  };

  // Open edit modal with medication data
  const openEditModal = (medication: Medication) => {
    setName(medication.name);
    setDosage(medication.dosage);
    setTime(medication.time);
    setFrequency(medication.frequency);
    setEditingMed(medication);
    setModalVisible(true);
  };

  // Render medication item
  const renderMedication = ({ item }: { item: Medication }) => (
    <Card style={[styles.medicationCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.medicationHeader}>
          <MaterialCommunityIcons
            name="pill"
            size={24}
            color={theme.colors.primary}
            style={styles.medicationIcon}
          />
          <View style={styles.medicationInfo}>
            <Title style={styles.medicationName}>{item.name}</Title>
            <Text style={styles.medicationDosage}>{item.dosage}</Text>
            <Text style={styles.medicationFrequency}>{item.frequency} at {item.time}</Text>
          </View>
        </View>
        <View style={styles.medicationActions}>
          <Button 
            mode="text" 
            onPress={() => openEditModal(item)}
            icon="pencil"
          >
            Edit
          </Button>
          <Button 
            mode="text" 
            onPress={() => handleDelete(item.id)}
            textColor="red"
            icon="delete"
          >
            Delete
          </Button>
          <Button
            mode={item.taken_today ? 'contained' : 'outlined'}
            onPress={() => handleMarkAsTaken(item.id)}
            disabled={item.taken_today}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            {item.taken_today ? 'Taken Today' : 'Mark as Taken'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={styles.title}>Medication</Title>
        <Button 
          mode="contained" 
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          icon="plus"
        >
          Add Medication
        </Button>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading medications...</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.medicationList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="pill" 
                size={48} 
                color={theme.colors.primary} 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No medications added yet</Text>
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(true)}
                style={styles.addFirstButton}
              >
                Add Your First Medication
              </Button>
            </View>
          }
        />
      )}

      {/* Add/Edit Medication Modal */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => {
            setModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <Title style={styles.modalTitle}>
            {editingMed ? 'Edit Medication' : 'Add New Medication'}
          </Title>
          
          <TextInput
            label="Medication Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Dosage (e.g., 500mg)"
            value={dosage}
            onChangeText={setDosage}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Time (e.g., 08:00 AM)"
            value={time}
            onChangeText={setTime}
            style={styles.input}
            mode="outlined"
            placeholder="08:00 AM"
          />
          
          <TextInput
            label="Frequency (e.g., Daily, Twice a day)"
            value={frequency}
            onChangeText={setFrequency}
            style={styles.input}
            mode="outlined"
          />
          
          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.saveButton}
            >
              {editingMed ? 'Update' : 'Save'}
            </Button>
          </View>
        </Modal>
      </Portal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  addFirstButton: {
    marginTop: 8,
  },
  medicationList: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  medicationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicationDosage: {
    color: '#666',
    marginBottom: 4,
  },
  medicationFrequency: {
    color: '#888',
    fontSize: 14,
  },
  medicationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    borderRadius: 20,
    marginLeft: 8,
    marginTop: 8,
  },
  actionButtonLabel: {
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
});

export default MedicationScreen;
