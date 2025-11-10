import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { 
  useTheme, 
  Avatar, 
  Title, 
  Text, 
  Button, 
  Card, 
  Divider,
  IconButton,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

type SeniorProfileRouteParams = {
  seniorId: string;
};

type HealthMetric = {
  id: string;
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
};

const SeniorProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { seniorId } = route.params as SeniorProfileRouteParams;
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'activity'>('overview');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual data from your API
  const senior = {
    id: seniorId,
    name: 'John Smith',
    relationship: 'Father',
    age: 72,
    lastActive: '2 hours ago',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    healthStatus: 'good',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    medications: [
      { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '8:00 AM' },
      { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM' },
    ],
    appointments: [
      { id: '1', title: 'Dr. Smith - Checkup', date: '2023-11-15', time: '2:00 PM', location: 'City Medical Center' },
      { id: '2', title: 'Blood Test', date: '2023-11-20', time: '10:30 AM', location: 'LabCorp' },
    ],
  };

  const healthMetrics: HealthMetric[] = [
    { id: '1', title: 'Heart Rate', value: '72', unit: 'bpm', trend: 'down', icon: 'heart-pulse' },
    { id: '2', title: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'neutral', icon: 'blood-bag' },
    { id: '3', title: 'Steps', value: '3,245', unit: 'steps', trend: 'up', icon: 'walk' },
    { id: '4', title: 'Sleep', value: '7.5', unit: 'hours', trend: 'up', icon: 'sleep' },
  ];

  const handleCall = () => {
    Linking.openURL(`tel:${senior.phone}`);
  };

  const handleMessage = () => {
    // Navigate to chat screen with the senior
    navigation.navigate('Chat', { seniorId });
  };

  const handleEmergency = () => {
    // Handle emergency action
    Linking.openURL('tel:911');
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Health Summary
          </Title>
          <View style={styles.healthMetrics}>
            {healthMetrics.map((metric) => (
              <View key={metric.id} style={styles.healthMetric}>
                <MaterialIcons 
                  name={metric.icon as any} 
                  size={24} 
                  color={theme.colors.primary} 
                  style={styles.metricIcon}
                />
                <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
                  {metric.value} 
                  <Text style={[styles.metricUnit, { color: theme.colors.onSurfaceVariant }]}>
                    {' '}{metric.unit}
                  </Text>
                </Text>
                <Text style={[styles.metricTitle, { color: theme.colors.onSurfaceVariant }]}>
                  {metric.title}
                </Text>
                <MaterialIcons 
                  name={metric.trend === 'up' ? 'trending-up' : metric.trend === 'down' ? 'trending-down' : 'trending-neutral'}
                  size={20} 
                  color={metric.trend === 'up' ? '#4CAF50' : metric.trend === 'down' ? '#F44336' : '#FFC107'} 
                  style={styles.trendIcon}
                />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Title>
          <View style={styles.quickActions}>
            <Button 
              mode="contained" 
              onPress={handleCall}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              icon="phone"
            >
              Call
            </Button>
            <Button 
              mode="outlined" 
              onPress={handleMessage}
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
              icon="message"
            >
              Message
            </Button>
            <Button 
              mode="contained" 
              onPress={handleEmergency}
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              icon="alert"
              textColor="white"
            >
              Emergency
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderHealth = () => (
    <View style={styles.section}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Medications
          </Title>
          {senior.medications.map((med, index) => (
            <React.Fragment key={med.id}>
              <View style={styles.medicationItem}>
                <View style={styles.medicationInfo}>
                  <Text style={[styles.medicationName, { color: theme.colors.onSurface }]}>
                    {med.name}
                  </Text>
                  <Text style={[styles.medicationDosage, { color: theme.colors.onSurfaceVariant }]}>
                    {med.dosage} • {med.frequency}
                  </Text>
                  <Text style={[styles.medicationTime, { color: theme.colors.primary }]}>
                    Next: {med.time}
                  </Text>
                </View>
                <IconButton
                  icon="bell-outline"
                  size={24}
                  onPress={() => {}}
                  iconColor={theme.colors.primary}
                />
              </View>
              {index < senior.medications.length - 1 && (
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
              )}
            </React.Fragment>
          ))}
          <Button 
            mode="text" 
            onPress={() => {}}
            textColor={theme.colors.primary}
            style={styles.addButton}
            icon="plus"
          >
            Add Medication
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.section}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Upcoming Appointments
          </Title>
          {senior.appointments.map((appt, index) => (
            <React.Fragment key={appt.id}>
              <View style={styles.appointmentItem}>
                <View style={styles.appointmentTime}>
                  <Text style={[styles.appointmentDay, { color: theme.colors.primary }]}>
                    {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.appointmentDate, { color: theme.colors.onSurface }]}>
                    {new Date(appt.date).getDate()}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={[styles.appointmentTitle, { color: theme.colors.onSurface }]}>
                    {appt.title}
                  </Text>
                  <View style={styles.appointmentMeta}>
                    <MaterialIcons 
                      name="access-time" 
                      size={16} 
                      color={theme.colors.onSurfaceVariant} 
                      style={styles.appointmentIcon}
                    />
                    <Text style={[styles.appointmentText, { color: theme.colors.onSurfaceVariant }]}>
                      {appt.time}
                    </Text>
                    <MaterialIcons 
                      name="location-on" 
                      size={16} 
                      color={theme.colors.onSurfaceVariant} 
                      style={[styles.appointmentIcon, { marginLeft: 12 }]}
                    />
                    <Text style={[styles.appointmentText, { color: theme.colors.onSurfaceVariant }]}>
                      {appt.location}
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  onPress={() => {}}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              </View>
              {index < senior.appointments.length - 1 && (
                <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
              )}
            </React.Fragment>
          ))}
          <Button 
            mode="text" 
            onPress={() => {}}
            textColor={theme.colors.primary}
            style={styles.addButton}
            icon="plus"
          >
            Add Appointment
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={[styles.relationship, { color: theme.colors.onPrimaryContainer }]}>
                {senior.relationship}
              </Text>
              <Title style={[styles.name, { color: theme.colors.onPrimaryContainer }]}>
                {senior.name}
              </Title>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { 
                      backgroundColor: 
                        senior.healthStatus === 'excellent' ? '#4CAF50' :
                        senior.healthStatus === 'good' ? '#8BC34A' :
                        senior.healthStatus === 'fair' ? '#FFC107' : '#F44336'
                    }
                  ]} 
                />
                <Text style={[styles.statusText, { color: theme.colors.onPrimaryContainer }]}>
                  {senior.healthStatus.charAt(0).toUpperCase() + senior.healthStatus.slice(1)} Health
                </Text>
              </View>
            </View>
            <Avatar.Image 
              size={80} 
              source={{ uri: senior.profileImage }} 
              style={[styles.avatar, { borderColor: theme.colors.surface }]}
            />
          </View>
          
          <View style={styles.tabContainer}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={[
                {
                  value: 'overview',
                  label: 'Overview',
                  icon: 'view-dashboard',
                },
                {
                  value: 'health',
                  label: 'Health',
                  icon: 'heart-pulse',
                },
                {
                  value: 'activity',
                  label: 'Activity',
                  icon: 'chart-line',
                },
              ]}
              style={styles.segmentedButtons}
              theme={{
                colors: {
                  secondaryContainer: theme.colors.primaryContainer,
                  onSecondaryContainer: theme.colors.onPrimaryContainer,
                },
              }}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'health' && renderHealth()}
            {activeTab === 'activity' && renderActivity()}
          </>
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
    padding: 24,
    paddingBottom: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginRight: 16,
  },
  relationship: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  avatar: {
    borderWidth: 3,
    backgroundColor: 'white',
  },
  tabContainer: {
    marginTop: 16,
  },
  segmentedButtons: {
    marginHorizontal: -8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  healthMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  healthMetric: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  metricTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  trendIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  medicationInfo: {
    flex: 1,
    marginRight: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    opacity: 0.5,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  appointmentTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  appointmentDay: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    flex: 1,
    marginRight: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    marginRight: 4,
  },
  appointmentText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});

export default SeniorProfileScreen;
