import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  // Mock data - will be replaced with actual data from the backend
  const quickActions = [
    { id: '1', title: 'SOS Emergency', icon: 'alarm-light', color: '#E53E3E' },
    { id: '2', title: 'Call Family', icon: 'phone', color: '#3182CE' },
    { id: '3', title: 'Medication', icon: 'pill', color: '#38B2AC' },
    { id: '4', title: 'Health Check', icon: 'heart-pulse', color: '#805AD5' },
  ];

  const recentAlerts = [
    { id: '1', title: 'Medication Reminder', time: '10 mins ago', type: 'medication' },
    { id: '2', title: 'Health Check Due', time: '2 hours ago', type: 'health' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>John</Text>
        </View>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={56} 
            color={theme.colors.primary} 
          />
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsContainer}
      >
        {quickActions.map((action) => (
          <TouchableOpacity 
            key={action.id}
            style={[styles.quickAction, { backgroundColor: action.color }]}
            onPress={() => {
              // Handle quick action press
              console.log(`Pressed ${action.title}`);
            }}
          >
            <MaterialCommunityIcons 
              name={action.icon} 
              size={28} 
              color="#FFF" 
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Alerts')}
            labelStyle={{ color: theme.colors.primary }}
          >
            View All
          </Button>
        </View>
        
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <Card key={alert.id} style={styles.alertCard}>
              <Card.Content style={styles.alertContent}>
                <View style={styles.alertIconContainer}>
                  <MaterialCommunityIcons 
                    name={alert.type === 'medication' ? 'pill' : 'heart-pulse'} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#A0AEC0" 
                />
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.noAlertsContainer}>
            <MaterialCommunityIcons 
              name="bell-off-outline" 
              size={48} 
              color="#A0AEC0" 
              style={styles.noAlertsIcon}
            />
            <Text style={styles.noAlertsText}>No recent alerts</Text>
          </View>
        )}
      </View>

      {/* Health Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Summary</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Health')}
            labelStyle={{ color: theme.colors.primary }}
          >
            View Details
          </Button>
        </View>
        
        <Card style={styles.healthCard}>
          <Card.Content>
            <View style={styles.healthMetrics}>
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>72</Text>
                <Text style={styles.healthMetricLabel}>BPM</Text>
                <Text style={styles.healthMetricName}>Heart Rate</Text>
              </View>
              <View style={styles.healthMetricDivider} />
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>98.6°F</Text>
                <Text style={styles.healthMetricLabel}>Temperature</Text>
              </View>
              <View style={styles.healthMetricDivider} />
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>120/80</Text>
                <Text style={styles.healthMetricLabel}>mmHg</Text>
                <Text style={styles.healthMetricName}>Blood Pressure</Text>
              </View>
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
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#4A5568',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(47, 133, 90, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#2D3748',
  },
  quickActionsContainer: {
    paddingVertical: 12,
    paddingRight: 16,
  },
  quickAction: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  noAlertsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  noAlertsIcon: {
    opacity: 0.5,
    marginBottom: 12,
  },
  noAlertsText: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  healthCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  healthMetric: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  healthMetricDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  healthMetricLabel: {
    fontSize: 12,
    color: '#4A5568',
  },
  healthMetricName: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 2,
  },
});

export default HomeScreen;
