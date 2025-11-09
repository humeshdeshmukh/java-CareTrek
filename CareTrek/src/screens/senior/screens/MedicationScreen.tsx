import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const medications = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    time: '08:00 AM',
    taken: true,
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    time: '08:00 AM',
    taken: false,
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    time: '08:00 PM',
    taken: false,
  },
];

const MedicationScreen = () => {
  const theme = useTheme();

  const renderMedication = ({ item }) => (
    <Card style={[styles.medicationCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.medicationHeader}>
          <MaterialCommunityIcons
            name="pill"
            size={24}
            color={theme.colors.primary}
            style={styles.medicationIcon}
          />
          <View>
            <Title style={styles.medicationName}>{item.name}</Title>
            <Text style={styles.medicationDosage}>{item.dosage}</Text>
          </View>
        </View>
        <View style={styles.medicationFooter}>
          <Text style={styles.medicationTime}>{item.time}</Text>
          <Button
            mode={item.taken ? 'contained' : 'outlined'}
            onPress={() => {}}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            {item.taken ? 'Taken' : 'Mark as Taken'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={styles.title}>Medication</Title>
        <Button mode="contained" onPress={() => {}}>Add Medication</Button>
      </View>
      
      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.medicationList}
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
  medicationList: {
    paddingBottom: 16,
  },
  medicationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIcon: {
    marginRight: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicationDosage: {
    color: '#666',
  },
  medicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  medicationTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 20,
  },
  actionButtonLabel: {
    fontSize: 14,
  },
});

export default MedicationScreen;
