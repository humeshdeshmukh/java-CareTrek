import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Vibration, Linking, Alert, ScrollView, TextInput } from 'react-native';
import { Button, Text, useTheme, Card, IconButton, ActivityIndicator, Portal, Modal, TextInput as PaperInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import * as SMS from 'expo-sms';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Auth: undefined;
  // Add other screen params as needed
};

type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
  updated_at: string;
};

type EmergencyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const EmergencyScreen = () => {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const theme = useTheme();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownActive, setCountdownActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  // Fetch emergency contacts from Supabase
  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigation.navigate('Auth');
        return;
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEmergencyContacts(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      setError('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchEmergencyContacts();
      } else if (event === 'SIGNED_OUT') {
        navigation.navigate('Auth');
      }
    });

    const checkTableStructure = async () => {
      try {
        // Try to get the table structure by querying information_schema
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'emergency_contacts');
          
        if (columnsError) {
          console.error('Error getting column info:', columnsError);
          // Fallback: Try to get one record to see the structure
          const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .limit(1);
            
          if (error) {
            console.error('Error fetching sample record:', error);
          } else {
            console.log('Sample record structure:', data);
            if (data && data.length > 0) {
              console.log('Available columns in the first record:', Object.keys(data[0]));
            }
          }
        } else if (columns && columns.length > 0) {
          console.log('Table columns from information_schema:', columns);
        } else {
          console.log('Table emergency_contacts has no columns or does not exist');
        }
      } catch (err) {
        console.error('Error checking table structure:', err);
      }
    };

    checkTableStructure();
    fetchEmergencyContacts();
    
    return () => {
      if (subscription?.data?.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  const addEmergencyContact = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([
          { 
            name: newContact.name.trim(),
            phone: newContact.phone.trim(),
            relationship: newContact.relationship.trim(),
            user_id: user.id
          }
        ])
        .select();

      if (error) throw error;

      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relationship: '' });
      fetchEmergencyContacts();
      Alert.alert('Success', 'Emergency contact added successfully');
    } catch (error) {
      console.error('Detailed error adding contact:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : undefined,
        details: error instanceof Error ? (error as any).details : undefined,
        hint: error instanceof Error ? (error as any).hint : undefined
      });
      Alert.alert('Error', `Failed to add emergency contact: ${error.message || 'Unknown error'}`);
    }
  };

  const removeEmergencyContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      fetchEmergencyContacts();
      Alert.alert('Success', 'Contact removed successfully');
    } catch (error) {
      console.error('Error removing contact:', error);
      Alert.alert('Error', 'Failed to remove contact');
    }
  };

  const makePhoneCall = async (contactNumber: string) => {
    const url = `tel:${contactNumber}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Phone calls are not supported on this device');
    }
  };

  const sendEmergencySMS = async (message: string) => {
    try {
      const { result } = await SMS.sendSMSAsync(
        emergencyContacts.map(contact => contact.phone),
        message
      );
      return result === 'sent' || result === 'cancelled';
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  };

  const startEmergencyCountdown = async () => {
    setEmergencyActive(true);
    setCountdown(5);
    setCountdownActive(true);
    
    const timer = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCountdownActive(false);
          
          // Trigger emergency actions
          Vibration.vibrate([0, 500, 200, 500]);
          
          // Send emergency SMS to all contacts
          const message = `EMERGENCY: I need immediate assistance! Please call me back as soon as possible.`;
          sendEmergencySMS(message);
          
          // Call primary contact if available
          if (emergencyContacts.length > 0) {
            makePhoneCall(emergencyContacts[0].phone);
          }
          
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

  const handleEmergencyPress = () => {
    if (emergencyContacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts first');
      return;
    }
    
    startEmergencyCountdown();
  };

  const renderEmergencyButton = () => {
    if (emergencyActive) {
      return (
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
      );
    }

    return (
      <Button
        mode="contained"
        onPress={handleEmergencyPress}
        onLongPress={handleEmergencyPress}
        style={[styles.emergencyButton, { backgroundColor: '#ff3b30' }]}
        contentStyle={styles.emergencyButtonContent}
        labelStyle={styles.emergencyButtonLabel}
      >
        <MaterialCommunityIcons name="alert" size={32} color="white" />
        <Text style={styles.emergencyButtonText}>HOLD FOR EMERGENCY</Text>
      </Button>
    );
  };

  const renderContactItem = (contact: EmergencyContact) => (
    <Card key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.contactContent}>
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>
              {contact.name}
            </Text>
          </View>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactNumber}>{contact.phone}</Text>
        </View>
        <View style={styles.contactActions}>
          <IconButton
            icon="message"
            mode="contained"
            onPress={() => {
              const message = `Hello ${contact.name}, I need assistance. Please call me back.`;
              SMS.sendSMSAsync([contact.phone], message);
            }}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            iconColor="white"
            size={20}
          />
          <IconButton
            icon="phone"
            mode="contained"
            onPress={() => makePhoneCall(contact.phone)}
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            iconColor="white"
            size={20}
          />
          <IconButton
            icon="trash-can-outline"
            mode="outlined"
            onPress={() => removeEmergencyContact(contact.id)}
            style={styles.deleteButton}
            iconColor={theme.colors.error}
            size={20}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.emergencyContainer}>
          {renderEmergencyButton()}
          {!emergencyActive && (
            <Text style={[styles.emergencySubtext, { color: theme.colors.onSurface }]}>
              Press and hold to send emergency alerts
            </Text>
          )}
        </View>

        <View style={styles.contactsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Emergency Contacts
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowAddContact(true)}
              style={styles.addButton}
              icon="plus"
              compact
            >
              Add
            </Button>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
              <Button mode="outlined" onPress={fetchEmergencyContacts} style={styles.retryButton}>
                Retry
              </Button>
            </View>
          ) : emergencyContacts.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="account-alert" 
                size={48} 
                color={theme.colors.onSurfaceVariant}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No emergency contacts found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                Add at least one emergency contact
              </Text>
            </View>
          ) : (
            emergencyContacts.map((contact) => (
              <Card key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.surface }]} >
                <Card.Content style={styles.contactContent}>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactHeader}>
                      <Text style={styles.contactName}>
                        {contact.name}
                      </Text>
                    </View>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    <Text style={styles.contactNumber}>{contact.phone}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <IconButton
                      icon="message"
                      mode="contained"
                      onPress={() => {
                        const message = `Hello ${contact.name}, I need assistance. Please call me back.`;
                        SMS.sendSMSAsync([contact.phone], message);
                      }}
                      style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                      iconColor="white"
                      size={20}
                    />
                    <IconButton
                      icon="phone"
                      mode="contained"
                      onPress={() => makePhoneCall(contact.phone)}
                      style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      iconColor="white"
                      size={20}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      mode="outlined"
                      onPress={() => removeEmergencyContact(contact.id)}
                      style={styles.deleteButton}
                      iconColor={theme.colors.error}
                      size={20}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Portal>
        <Modal
          visible={showAddContact}
          onDismiss={() => setShowAddContact(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]} >
            Add Emergency Contact
          </Text>
          <PaperInput
            label="Name"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            style={styles.input}
            mode="outlined"
          />
          <PaperInput
            label="Phone Number"
            value={newContact.phone}
            onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
          />
          <PaperInput
            label="Relationship"
            value={newContact.relationship}
            onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowAddContact(false)}
              style={[styles.modalButton, { marginRight: 10 }]}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addEmergencyContact}
              style={styles.modalButton}
              disabled={!newContact.name || !newContact.phone || !newContact.relationship}
            >
              Add Contact
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
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emergencyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emergencyActiveContainer: {
    alignItems: 'center',
    padding: 20,
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
    lineHeight: 28,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  cancelButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  emergencySubtext: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 300,
    opacity: 0.8,
  },
  contactsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 20,
  },
  contactCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  contactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  primaryBadge: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '500',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 15,
    color: '#2196F3',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    margin: 0,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    borderColor: '#ff3b30',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    marginTop: 10,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 8,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  checkboxLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxButton: {
    marginLeft: 8,
    minWidth: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default EmergencyScreen;
