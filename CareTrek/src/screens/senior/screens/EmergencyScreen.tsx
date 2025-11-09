import React, { useState } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { Button, Text, useTheme, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmergencyScreen = () => {
  const theme = useTheme();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownActive, setCountdownActive] = useState(false);

  const emergencyContacts = [
    { id: '1', name: 'John Doe', relationship: 'Son', number: '+1234567890' },
    { id: '2', name: 'Jane Smith', relationship: 'Daughter', number: '+1987654321' },
    { id: '3', name: 'Dr. Johnson', relationship: 'Doctor', number: '+1122334455' },
  ];

  const startEmergencyCountdown = () => {
    setEmergencyActive(true);
    setCountdown(5);
    setCountdownActive(true);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCountdownActive(false);
          // In a real app, this would trigger emergency services and notify contacts
          Vibration.vibrate([0, 500, 200, 500]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setCountdownActive(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.emergencyContainer}>
        {emergencyActive ? (
          <View style={styles.emergencyActiveContainer}>
            <MaterialCommunityIcons
              name="alert-octagram"
              size={80}
              color="#ff3b30"
              style={styles.emergencyIcon}
            />
            <Text style={styles.emergencyText}>
              {countdownActive
                ? `Emergency in ${countdown}...`
                : 'Emergency Alert Sent!'}
            </Text>
            {countdownActive && (
              <Button
                mode="contained"
                onPress={cancelEmergency}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
            )}
          </View>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={startEmergencyCountdown}
              style={[styles.emergencyButton, { backgroundColor: '#ff3b30' }]}
              contentStyle={styles.emergencyButtonContent}
              labelStyle={styles.emergencyButtonLabel}
            >
              <MaterialCommunityIcons name="alert" size={32} color="white" />
              <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
            </Button>
            <Text style={[styles.emergencySubtext, { color: theme.colors.onSurface }]}>
              Press and hold for 3 seconds to call emergency services
            </Text>
          </>
        )}
      </View>

      <View style={styles.contactsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Emergency Contacts
        </Text>
        {emergencyContacts.map((contact) => (
          <Card key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.contactContent}>
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
              </View>
              <IconButton
                icon="phone"
                mode="contained"
                onPress={() => console.log(`Calling ${contact.name}...`)}
                style={styles.phoneIcon}
                iconColor="white"
                size={24}
              />
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emergencyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emergencyActiveContainer: {
    alignItems: 'center',
  },
  emergencyIcon: {
    marginBottom: 20,
  },
  emergencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
  },
  cancelButtonLabel: {
    color: 'white',
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    elevation: 8,
  },
  emergencyButtonContent: {
    height: '100%',
  },
  emergencyButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emergencySubtext: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  contactsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  contactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactRelationship: {
    color: '#666',
    marginTop: 4,
  },
  phoneIcon: {
    backgroundColor: '#007AFF',
    margin: 0,
  },
});

export default EmergencyScreen;
