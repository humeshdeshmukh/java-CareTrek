import React, { useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Card, Title, Text, useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { useHealth } from '../../../contexts/HealthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HealthDashboardScreen = () => {
  const theme = useTheme();
  const { healthData, isLoading, error, refresh } = useHealth();

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '--';
    return num.toLocaleString();
  };

  const renderHealthCard = (title: string, value: string | number | undefined, unit: string, icon: string) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
          <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{title}</Title>
        </View>
        <Text variant="headlineMedium" style={[styles.healthValue, { color: theme.colors.primary }]}>
          {value}
          <Text style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>{unit}</Text>
        </Text>
      </Card.Content>
    </Card>
  );

  if (isLoading && !healthData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading health data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
          {error}
        </Text>
        <IconButton
          icon="reload"
          size={24}
          onPress={refresh}
          iconColor={theme.colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }>
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.onBackground }]}>
          Health Dashboard
        </Title>
        <IconButton
          icon="refresh"
          size={24}
          onPress={refresh}
          disabled={isLoading}
          iconColor={theme.colors.primary}
        />
      </View>

      {renderHealthCard(
        'Heart Rate', 
        healthData?.heart_rate ? Math.round(healthData.heart_rate) : '--', 
        ' BPM',
        'heart-pulse'
      )}

      {renderHealthCard(
        'Blood Oxygen', 
        healthData?.blood_oxygen ? healthData.blood_oxygen : '--', 
        '%',
        'water-percent'
      )}

      {renderHealthCard(
        'Steps Today', 
        formatNumber(healthData?.steps), 
        ' steps',
        'walk'
      )}

      {renderHealthCard(
        'Active Calories', 
        formatNumber(healthData?.calories_burned), 
        ' kcal',
        'fire'
      )}

      {renderHealthCard(
        'Sleep', 
        healthData?.sleep_duration ? `${healthData.sleep_duration.toFixed(1)}` : '--', 
        ' hrs',
        'sleep'
      )}
    </ScrollView>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  healthValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  unit: {
    fontSize: 16,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HealthDashboardScreen;
