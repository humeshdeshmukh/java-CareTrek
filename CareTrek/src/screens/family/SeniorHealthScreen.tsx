import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl } from 'react-native';
import { useTheme, Card, Title, Paragraph, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@contexts/AuthContext';

type RootStackParamList = {
  SeniorProfile: { seniorId: string };
  // Add other screens as needed
};

type HealthMetric = {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'oxygen' | 'temperature';
  value: number;
  unit: string;
  timestamp: string;
};

type SeniorHealthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorProfile'>;

const SeniorHealthScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SeniorHealthScreenNavigationProp>();
  const route = useRoute();
  const { seniorId } = route.params as { seniorId: string };
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate');
  
  const { user } = useAuth();

  // Mock data - replace with actual API call
  const fetchHealthData = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: HealthMetric[] = [
        // Heart rate data
        { id: '1', type: 'heart_rate', value: 72, unit: 'bpm', timestamp: '2025-11-11T08:00:00Z' },
        { id: '2', type: 'heart_rate', value: 75, unit: 'bpm', timestamp: '2025-11-11T12:00:00Z' },
        { id: '3', type: 'heart_rate', value: 70, unit: 'bpm', timestamp: '2025-11-11T16:00:00Z' },
        
        // Blood pressure data
        { id: '4', type: 'blood_pressure', value: 120, unit: 'mmHg', timestamp: '2025-11-11T08:00:00Z' },
        { id: '5', type: 'blood_pressure', value: 118, unit: 'mmHg', timestamp: '2025-11-11T16:00:00Z' },
        
        // Oxygen data
        { id: '6', type: 'oxygen', value: 98, unit: '%', timestamp: '2025-11-11T08:00:00Z' },
        { id: '7', type: 'oxygen', value: 97, unit: '%', timestamp: '2025-11-11T16:00:00Z' },
        
        // Temperature data
        { id: '8', type: 'temperature', value: 36.8, unit: '°C', timestamp: '2025-11-11T08:00:00Z' },
        { id: '9', type: 'temperature', value: 36.9, unit: '°C', timestamp: '2025-11-11T16:00:00Z' },
      ];
      
      setHealthMetrics(mockData);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [seniorId]);

  const filteredData = healthMetrics.filter(metric => metric.type === selectedMetric);

  const chartData = {
    labels: filteredData.map(item => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      data: filteredData.map(item => item.value),
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const getMetricInfo = (type: string) => {
    switch (type) {
      case 'heart_rate':
        return { label: 'Heart Rate', icon: 'heart-pulse', color: '#E91E63' };
      case 'blood_pressure':
        return { label: 'Blood Pressure', icon: 'blood-bag', color: '#9C27B0' };
      case 'oxygen':
        return { label: 'Oxygen Level', icon: 'air-filter', color: '#2196F3' };
      case 'temperature':
        return { label: 'Temperature', icon: 'thermometer', color: '#FF9800' };
      default:
        return { label: type, icon: 'chart-line', color: '#607D8B' };
    }
  };

  const currentMetric = getMetricInfo(selectedMetric);
  const latestReading = filteredData[filteredData.length - 1];

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
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={fetchHealthData} 
        />
      }>
      <View style={styles.header}>
        <Title>Health Overview</Title>
      </View>

      {/* Metric Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.metricSelector}
        contentContainerStyle={styles.metricSelectorContent}
      >
        {['heart_rate', 'blood_pressure', 'oxygen', 'temperature'].map((metric) => {
          const info = getMetricInfo(metric);
          const isSelected = selectedMetric === metric;
          return (
            <Button
              key={metric}
              mode={isSelected ? 'contained' : 'outlined'}
              onPress={() => setSelectedMetric(metric)}
              style={[
                styles.metricButton,
                isSelected && { backgroundColor: info.color }
              ]}
              labelStyle={styles.metricButtonLabel}
            >
              {info.label}
            </Button>
          );
        })}
      </ScrollView>

      {/* Current Reading */}
      <Card style={styles.currentReadingCard}>
        <Card.Content>
          <View style={styles.currentReadingHeader}>
            <MaterialCommunityIcons 
              name={currentMetric.icon} 
              size={24} 
              color={currentMetric.color} 
            />
            <Title style={[styles.currentReadingTitle, { color: currentMetric.color }]}>
              {currentMetric.label}
            </Title>
          </View>
          
          {latestReading ? (
            <View style={styles.currentReadingValueContainer}>
              <Text style={styles.currentReadingValue}>
                {latestReading.value}
                <Text style={styles.currentReadingUnit}> {latestReading.unit}</Text>
              </Text>
              <Text style={styles.currentReadingTime}>
                {new Date(latestReading.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text>No data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Chart */}
      {filteredData.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Trend</Title>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={350}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: currentMetric.color
                  }
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Health Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Health Summary</Title>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="run" size={20} color="#1976D2" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Daily Steps</Text>
              <Text style={styles.summaryValue}>4,892 / 8,000</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="sleep" size={20} color="#388E3C" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Sleep</Text>
              <Text style={styles.summaryValue}>7h 23m (Good)</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="pill" size={20} color="#F57C00" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Medication</Text>
              <Text style={styles.summaryValue}>3/4 taken today</Text>
            </View>
          </View>
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
  header: {
    marginBottom: 16,
  },
  metricSelector: {
    marginBottom: 16,
  },
  metricSelectorContent: {
    paddingHorizontal: 4,
  },
  metricButton: {
    marginRight: 8,
    borderRadius: 20,
  },
  metricButtonLabel: {
    fontSize: 12,
  },
  currentReadingCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  currentReadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentReadingTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  currentReadingValueContainer: {
    alignItems: 'flex-start',
  },
  currentReadingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentReadingUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    opacity: 0.7,
  },
  currentReadingTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default SeniorHealthScreen;
