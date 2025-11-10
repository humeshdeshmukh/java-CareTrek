import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Linking, TouchableOpacity, Alert } from 'react-native';
import { useTheme, Card, Title, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useAuth } from '@contexts/AuthContext';

type RootStackParamList = {
  SeniorProfile: { seniorId: string };
  // Add other screens as needed
};

type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
};

type SeniorLocation = {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
};

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorProfile'>;

const EmergencyScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const route = useRoute();
  const { seniorId } = route.params as { seniorId: string };
  
  const [loading, setLoading] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [seniorLocation, setSeniorLocation] = useState<SeniorLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const { user } = useAuth();

  // Mock data - replace with actual API call
  const fetchEmergencyData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockContacts: EmergencyContact[] = [
        {
          id: '1',
          name: 'John Doe',
          relationship: 'Son',
          phone: '+1 (555) 123-4567',
          isPrimary: true
        },
        {
          id: '2',
          name: 'Jane Smith',
          relationship: 'Daughter',
          phone: '+1 (555) 987-6543',
          isPrimary: false
        },
        {
          id: '3',
          name: 'Local Hospital',
          relationship: 'Medical',
          phone: '911',
          isPrimary: false
        }
      ];
      
      setEmergencyContacts(mockContacts);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, [seniorId]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to get the current location.');
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const formattedAddress = address[0] 
        ? `${address[0].name || ''} ${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''} ${address[0].postalCode || ''}`
        : 'Address not available';
      
      setSeniorLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
        address: formattedAddress
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleEmergencyCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device.');
        }
      })
      .catch(error => {
        console.error('Error making call:', error);
        Alert.alert('Error', 'Could not make the call. Please try again.');
      });
  };

  const openMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Could not open maps. Please try again.');
    });
  };

  const renderEmergencyContact = (contact: EmergencyContact) => (
    <Card key={contact.id} style={styles.contactCard}>
      <Card.Content style={styles.contactContent}>
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={() => handleEmergencyCall(contact.phone)}
          style={styles.callButton}
          labelStyle={styles.callButtonLabel}
        >
          Call
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Emergency SOS Button */}
      <View style={styles.emergencySosContainer}>
        <Text style={styles.sectionTitle}>Emergency SOS</Text>
        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => handleEmergencyCall('911')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="emergency" size={32} color="white" />
          <Text style={styles.sosButtonText}>EMERGENCY CALL 911</Text>
          <Text style={styles.sosButtonSubtext}>Press and hold for 3 seconds</Text>
        </TouchableOpacity>
      </View>
      
      {/* Senior's Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Senior's Location</Text>
          <Button 
            mode="text" 
            onPress={getCurrentLocation}
            loading={locationLoading}
            disabled={locationLoading}
            compact
            style={styles.refreshButton}
          >
            {locationLoading ? 'Updating...' : 'Refresh'}
          </Button>
        </View>
        
        {seniorLocation ? (
          <Card style={styles.locationCard}>
            <Card.Content>
              <View style={styles.locationHeader}>
                <MaterialIcons name="location-on" size={24} color="#4285F4" />
                <Text style={styles.locationTitle}>Current Location</Text>
                <Text style={styles.locationTime}>
                  {new Date(seniorLocation.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <Text style={styles.locationAddress} numberOfLines={2}>
                {seniorLocation.address}
              </Text>
              
              <View style={styles.locationActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => openMaps(seniorLocation.latitude, seniorLocation.longitude)}
                  style={styles.mapButton}
                  icon="map"
                >
                  Open in Maps
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    // Share location functionality
                    const message = `Senior's current location: ${seniorLocation.address}\n\nhttps://www.google.com/maps/dir/?api=1&destination=${seniorLocation.latitude},${seniorLocation.longitude}`;
                    // Implement share functionality here
                    Alert.alert('Share Location', 'Share this location with emergency contacts?', [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Share', 
                        onPress: () => {
                          // Share the location via SMS or other apps
                          const url = `sms:?body=${encodeURIComponent(message)}`;
                          Linking.openURL(url).catch(err => {
                            console.error('Error sharing location:', err);
                            Alert.alert('Error', 'Could not share location. Please try again.');
                          });
                        } 
                      },
                    ]);
                  }}
                  style={styles.shareButton}
                  icon="share"
                >
                  Share
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.locationCard}>
            <Card.Content style={styles.noLocationContent}>
              <MaterialIcons name="location-off" size={32} color="#BDBDBD" />
              <Text style={styles.noLocationText}>Location not available</Text>
              <Button 
                mode="contained" 
                onPress={getCurrentLocation}
                loading={locationLoading}
                disabled={locationLoading}
                style={styles.enableLocationButton}
              >
                Enable Location
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
      
      {/* Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Button 
            mode="text" 
            onPress={() => {/* Navigate to edit contacts */}}
            compact
            style={styles.editButton}
          >
            Edit
          </Button>
        </View>
        
        {emergencyContacts.length > 0 ? (
          emergencyContacts.map(contact => renderEmergencyContact(contact))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="account-alert" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No emergency contacts added</Text>
              <Button 
                mode="outlined" 
                onPress={() => {/* Navigate to add contact */}}
                style={styles.addContactButton}
              >
                Add Emergency Contact
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
      
      {/* Medical Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        <Card style={styles.medicalCard}>
          <Card.Content>
            <View style={styles.medicalInfoItem}>
              <MaterialCommunityIcons name="card-account-details" size={20} color="#5C6BC0" />
              <View style={styles.medicalInfoText}>
                <Text style={styles.medicalInfoLabel}>Medical ID</Text>
                <Text style={styles.medicalInfoValue}>View Medical Profile</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.medicalInfoItem}>
              <MaterialCommunityIcons name="pill" size={20} color="#5C6BC0" />
              <View style={styles.medicalInfoText}>
                <Text style={styles.medicalInfoLabel}>Medications</Text>
                <Text style={styles.medicalInfoValue}>View All Medications</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.medicalInfoItem}>
              <MaterialCommunityIcons name="hospital-building" size={20} color="#5C6BC0" />
              <View style={styles.medicalInfoText}>
                <Text style={styles.medicalInfoLabel}>Healthcare Providers</Text>
                <Text style={styles.medicalInfoValue}>View All Providers</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
            </View>
          </Card.Content>
        </Card>
      </View>
      
      {/* Safety Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <Card style={styles.tipsCard}>
          <Card.Content>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Ensure all emergency contacts are up to date
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Keep medical information current and accessible
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Test emergency features regularly
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  refreshButton: {
    minWidth: 0,
  },
  editButton: {
    minWidth: 0,
  },
  emergencySosContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sosButton: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  sosButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  locationCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  noLocationContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLocationText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#757575',
    textAlign: 'center',
  },
  enableLocationButton: {
    borderRadius: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationTime: {
    fontSize: 12,
    color: '#757575',
  },
  locationAddress: {
    marginLeft: 32,
    marginBottom: 16,
    color: '#616161',
    lineHeight: 20,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mapButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  shareButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  contactCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  primaryBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  primaryBadgeText: {
    color: '#1976D2',
    fontSize: 10,
    fontWeight: '600',
  },
  contactRelationship: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#1976D2',
  },
  callButton: {
    marginLeft: 16,
    borderRadius: 20,
    backgroundColor: '#F44336',
  },
  callButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#757575',
    textAlign: 'center',
  },
  addContactButton: {
    borderRadius: 20,
  },
  medicalCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  medicalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  medicalInfoText: {
    flex: 1,
    marginLeft: 16,
  },
  medicalInfoLabel: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 2,
  },
  medicalInfoValue: {
    fontSize: 12,
    color: '#757575',
  },
  divider: {
    marginHorizontal: -16,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  tipsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    color: '#424242',
    lineHeight: 20,
  },
});

export default EmergencyScreen;
