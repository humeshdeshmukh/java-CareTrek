import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTheme, Card, Title, Button, ActivityIndicator, Divider, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@contexts/AuthContext';

type RootStackParamList = {
  SeniorProfile: { seniorId: string };
  MedicationDetail: { medicationId: string };
  // Add other screens as needed
};

type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: {
    time: string;
    days: string[];
  };
  nextDose: string;
  remaining: number;
  image?: string;
  status: 'taken' | 'missed' | 'upcoming';
  instructions?: string;
};

type MedicationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorProfile'>;

const MedicationScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<MedicationScreenNavigationProp>();
  const route = useRoute();
  const { seniorId } = route.params as { seniorId: string };
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [medications, setMedications] = useState<Medication[]>([]);
  
  const { user } = useAuth();

  // Mock data - replace with actual API call
  const fetchMedications = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockData: Medication[] = [
        {
          id: '1',
          name: 'Lisinopril',
          dosage: '10mg',
          schedule: {
            time: '08:00 AM',
            days: ['Mon', 'Wed', 'Fri']
          },
          nextDose: '2025-11-12T08:00:00Z',
          remaining: 15,
          status: 'upcoming',
          instructions: 'Take with water. May cause dizziness.'
        },
        {
          id: '2',
          name: 'Metformin',
          dosage: '500mg',
          schedule: {
            time: '12:30 PM',
            days: ['Daily']
          },
          nextDose: '2025-11-11T12:30:00Z',
          remaining: 30,
          status: 'taken',
          instructions: 'Take with meals to reduce stomach upset.'
        },
        {
          id: '3',
          name: 'Atorvastatin',
          dosage: '20mg',
          schedule: {
            time: '08:00 PM',
            days: ['Daily']
          },
          nextDose: '2025-11-11T20:00:00Z',
          remaining: 5,
          status: 'upcoming',
          instructions: 'Take at bedtime.'
        },
        {
          id: '4',
          name: 'Albuterol',
          dosage: '90mcg',
          schedule: {
            time: 'As Needed',
            days: ['As Needed']
          },
          nextDose: '2025-11-11T00:00:00Z',
          remaining: 42,
          status: 'upcoming',
          instructions: 'Use as needed for shortness of breath.'
        },
      ];
      
      setMedications(mockData);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [seniorId]);

  const filteredMeds = activeTab === 'today' 
    ? medications.filter(med => med.schedule.days.includes('Daily') || 
                             new Date(med.nextDose).toDateString() === new Date().toDateString())
    : medications;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return '#4CAF50';
      case 'missed':
        return '#F44336';
      case 'upcoming':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return 'check-circle';
      case 'missed':
        return 'close-circle';
      case 'upcoming':
        return 'clock-time-four';
      default:
        return 'help-circle';
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <Card 
      style={[styles.medicationCard, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => navigation.navigate('MedicationDetail', { medicationId: item.id })}
    >
      <Card.Content>
        <View style={styles.medicationHeader}>
          <View>
            <View style={styles.medicationTitleContainer}>
              <Title style={styles.medicationName}>{item.name}</Title>
              <Text style={styles.medicationDosage}>{item.dosage}</Text>
            </View>
            <View style={styles.medicationSchedule}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.scheduleText}>
                {item.schedule.time === 'As Needed' 
                  ? 'As Needed' 
                  : `${item.schedule.time} • ${item.schedule.days.join(', ')}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons 
              name={getStatusIcon(item.status)} 
              size={20} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.medicationFooter}>
          <View style={styles.remainingPills}>
            <MaterialCommunityIcons name="pill" size={16} color="#666" />
            <Text style={styles.remainingText}>{item.remaining} left</Text>
          </View>
          
          {item.nextDose && item.schedule.time !== 'As Needed' && (
            <View style={styles.nextDose}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#666" />
              <Text style={styles.nextDoseText}>
                Next: {new Date(item.nextDose).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          )}
        </View>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Medications</Title>
        <Button 
          mode="contained" 
          onPress={() => {/* Navigate to add medication */}}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          Add Reminder
        </Button>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'today' && styles.activeTab,
            { borderBottomColor: theme.colors.primary }
          ]} 
          onPress={() => setActiveTab('today')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'today' && { color: theme.colors.primary }
          ]}>
            Today
          </Text>
          {activeTab === 'today' && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'all' && styles.activeTab,
            { borderBottomColor: theme.colors.primary }
          ]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'all' && { color: theme.colors.primary }
          ]}>
            All Medications
          </Text>
          {activeTab === 'all' && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />}
        </TouchableOpacity>
      </View>
      
      {/* Medication List */}
      {filteredMeds.length > 0 ? (
        <FlatList
          data={filteredMeds}
          renderItem={renderMedicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.medicationList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="pill-off" size={64} color="#BDBDBD" />
          <Text style={styles.emptyStateText}>
            {activeTab === 'today' 
              ? 'No medications scheduled for today' 
              : 'No medications found'}
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => {/* Navigate to add medication */}}
            style={styles.addFirstButton}
          >
            Add Your First Medication
          </Button>
        </View>
      )}
      
      {/* Bottom Action Button */}
      {filteredMeds.length > 0 && (
        <View style={styles.bottomAction}>
          <Button 
            mode="contained" 
            onPress={() => {/* Log medication */}}
            style={styles.logButton}
            icon="plus"
          >
            Log Medication
          </Button>
        </View>
      )}
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
  addButton: {
    borderRadius: 20,
  },
  addButtonLabel: {
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeTab: {
    // Styling for active tab is handled in the component
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  medicationList: {
    paddingBottom: 80, // Space for the bottom action button
  },
  medicationCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginBottom: 0,
    lineHeight: 24,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#757575',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  medicationSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduleText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#616161',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  medicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  remainingPills: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#757575',
  },
  nextDose: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDoseText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#757575',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    borderRadius: 20,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logButton: {
    borderRadius: 25,
    paddingVertical: 8,
  },
});

export default MedicationScreen;
