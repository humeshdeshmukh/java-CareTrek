import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, ProgressBar, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HealthScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

const HealthScreen: React.FC<HealthScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock health data - will be replaced with actual data from the backend
  const healthData = {
    steps: {
      current: 5842,
      goal: 10000,
      progress: 0.58,
    },
    heartRate: 72,
    bloodPressure: '120/80',
    bloodOxygen: 98,
    lastCheckup: '2023-10-15',
    nextAppointment: '2023-12-10',
    doctor: 'Dr. Sarah Johnson',
  };

  const handleViewDetails = (metric: string) => {
    // Navigate to detailed view for the selected metric
    console.log(`View details for ${metric}`);
  };

  const handleBookAppointment = () => {
    // Navigate to appointment booking
    console.log('Book appointment');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Steps</Text>
                <Text style={styles.metricValue}>
                  {healthData.steps.current.toLocaleString()}
                  <Text style={styles.metricUnit}> / {healthData.steps.goal.toLocaleString()}</Text>
                </Text>
              </View>
              <ProgressBar 
                progress={healthData.steps.progress} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Button 
                mode="text" 
                onPress={() => handleViewDetails('steps')}
                labelStyle={{ fontSize: 14 }}
              >
                Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricCardContent}>
              <Text style={styles.metricCardLabel}>Heart Rate</Text>
              <Text style={[styles.metricCardValue, { color: theme.colors.primary }]}>
                {healthData.heartRate}
                <Text style={styles.metricCardUnit}> bpm</Text>
              </Text>
              <Text style={styles.metricCardStatus}>Normal</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricCardContent}>
              <Text style={styles.metricCardLabel}>Blood Pressure</Text>
              <Text style={[styles.metricCardValue, { color: theme.colors.primary }]}>
                {healthData.bloodPressure}
                <Text style={styles.metricCardUnit}> mmHg</Text>
              </Text>
              <Text style={styles.metricCardStatus}>Normal</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricCardContent}>
              <Text style={styles.metricCardLabel}>Blood Oxygen</Text>
              <Text style={[styles.metricCardValue, { color: theme.colors.primary }]}>
                {healthData.bloodOxygen}
                <Text style={styles.metricCardUnit}>%</Text>
              </Text>
              <Text style={styles.metricCardStatus}>Good</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <Button 
            mode="text" 
            onPress={handleBookAppointment}
            labelStyle={{ color: theme.colors.primary }}
          >
            Book Now
          </Button>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.appointmentRow}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentDate}>Next Appointment</Text>
                <Text style={styles.appointmentDoctor}>{healthData.doctor}</Text>
                <Text style={styles.appointmentTime}>
                  {new Date(healthData.nextAppointment).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Button 
                mode="contained" 
                onPress={() => console.log('View appointment')}
                style={styles.viewButton}
                labelStyle={styles.buttonLabel}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button 
            mode="outlined" 
            onPress={() => console.log('Log symptoms')}
            style={styles.actionButton}
            icon="clipboard-pulse"
            contentStyle={styles.actionButtonContent}
          >
            Log Symptoms
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => console.log('Medication')}
            style={styles.actionButton}
            icon="pill"
            contentStyle={styles.actionButtonContent}
          >
            Medication
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => console.log('Health Records')}
            style={styles.actionButton}
            icon="file-document"
            contentStyle={styles.actionButtonContent}
          >
            Health Records
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  section: {
    margin: 16,
    marginBottom: 0,
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
    color: '#2D3748',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  metricUnit: {
    fontSize: 14,
    color: '#718096',
    fontWeight: 'normal',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 16,
    flex: 2,
    backgroundColor: '#E2E8F0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    width: '48%',
    margin: '1%',
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCardContent: {
    padding: 16,
  },
  metricCardLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricCardUnit: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  metricCardStatus: {
    fontSize: 12,
    color: '#48BB78',
    fontWeight: '500',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#4A5568',
  },
  viewButton: {
    marginLeft: 16,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 14,
    paddingVertical: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    margin: 4,
    borderRadius: 8,
    borderColor: '#E2E8F0',
  },
  actionButtonContent: {
    height: 48,
  },
});

export default HealthScreen;
