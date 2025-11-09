import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';

const HealthDashboardScreen = () => {
  const theme = useTheme();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Title style={styles.title}>Health Dashboard</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Heart Rate</Title>
          <Text variant="headlineMedium" style={styles.healthValue}>72 <Text style={styles.unit}>BPM</Text></Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Blood Oxygen</Title>
          <Text variant="headlineMedium" style={styles.healthValue}>98<Text style={styles.unit}>%</Text></Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Steps Today</Title>
          <Text variant="headlineMedium" style={styles.healthValue}>2,345<Text style={styles.unit}>/5,000</Text></Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Sleep</Title>
          <Text variant="headlineMedium" style={styles.healthValue}>7.5<Text style={styles.unit}>hrs</Text></Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  healthValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  unit: {
    fontSize: 16,
    color: '#666',
  },
});

export default HealthDashboardScreen;
