import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Text, useTheme, Button, Snackbar } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { getDailyActivity, getWeeklyActivity } from '../../../services/healthService';
import { useAuth } from '../../../contexts/AuthContext';
// @ts-ignore - expo-vector-icons types are included with expo
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DailyActivityData {
  metrics: Array<{
    id: string;
    user_id: string;
    recorded_at: string;
    steps?: number;
    calories_burned?: number;
    heart_rate?: number;
    active_minutes?: number;
  }>;
  totals: {
    steps: number;
    calories: number;
    activeMinutes: number;
    heartRate: number;
  };
}

interface WeeklyActivityData {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRate: number;
}

const ActivityScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyActivityData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchActivityData = async () => {
      try {
        const [dailyActivity, weeklyActivity] = await Promise.all([
          getDailyActivity(user.id),
          getWeeklyActivity(user.id)
        ]);
        
        setDailyData(dailyActivity);
        setWeeklyData(weeklyActivity);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load activity data';
        setError(errorMessage);
        console.error('Error fetching activity data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityData();
  }, [user]);

  const renderActivityCard = (title: string, value: number, unit: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.activityHeader}>
          <View style={styles.activityTitleContainer}>
            <MaterialCommunityIcons 
              name={icon as any} 
              size={24} 
              color={theme.colors.primary} 
              style={styles.activityIcon} 
            />
            <Text style={[styles.activityTitle, { color: theme.colors.onSurface }]}>{title}</Text>
          </View>
          <Text style={[styles.activityValue, { color: theme.colors.primary }]}>
            {value} {unit}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!dailyData) {
    return (
      <View style={[styles.loadingContainer, { 
        backgroundColor: theme.colors.background, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 16
      }]}>
        <Text style={{ color: theme.colors.onSurface }}>
          {error || 'No activity data available'}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => setLoading(true)} 
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[{ flex: 1, padding: 16, backgroundColor: theme.colors.background }]}>
      <Text style={[{
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 16,
        color: theme.colors.primary
      }]}>
        Today's Activity
      </Text>
      
      <View style={styles.statsRow}>
        {renderActivityCard('Steps', dailyData.totals.steps, 'steps', 'walk')}
        {renderActivityCard('Calories', Math.round(dailyData.totals.calories), 'kcal', 'fire')}
      </View>

      <View style={styles.statsRow}>
        {renderActivityCard('Active', dailyData.totals.activeMinutes, 'min', 'clock')}
        {renderActivityCard('Heart Rate', dailyData.totals.heartRate, 'bpm', 'heart-pulse')}
      </View>

      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
          Weekly Activity Trend
        </Text>
        {weeklyData.length > 0 ? (
          <LineChart
            style={styles.chart}
            data={weeklyData.map(d => d.steps).filter((steps): steps is number => steps !== undefined)}
            svg={{
              stroke: theme.colors.primary,
              strokeWidth: 2,
            }}
            contentInset={{ top: 20, bottom: 20 }}
            curve={shape.curveNatural}
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No data available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chartLabels}>
        {weeklyData.length > 0 ? (
          weeklyData.map((day, index) => (
            <Text 
              key={index} 
              style={[styles.chartLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
          ))
        ) : (
          <Text style={[styles.chartLabel, { color: theme.colors.onSurfaceVariant }]}>
            No data
          </Text>
        )}
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <Button 
          mode="contained" 
          onPress={() => {}}
          style={{ flex: 1, marginRight: 8 }}
          icon="plus"
        >
          Add
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => {}}
          style={{ flex: 1, marginLeft: 8 }}
          icon="refresh"
        >
          Refresh
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Layout
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  // Cards
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  
  // Activity Header
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 14,
    color: '#666',
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  activityUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Progress
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
  },
  
  // Charts
  chartContainer: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    height: 200,
    borderRadius: 16,
    marginVertical: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  
  // Buttons
  actionButton: {
    marginTop: 8,
  },
});

export default ActivityScreen;
