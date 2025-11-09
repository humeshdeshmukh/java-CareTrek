import { supabase } from './supabase';

export interface HealthMetric {
  id: string;
  user_id: string;
  heart_rate?: number;
  blood_oxygen?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  steps?: number;
  calories_burned?: number;
  sleep_duration?: number;
  sleep_quality?: number;
  recorded_at: string;
  created_at: string;
}

export const getHealthMetrics = async (userId: string, limit = 7) => {
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }

  return data as HealthMetric[];
};

export const getDailyActivity = async (userId: string, date: Date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', startOfDay.toISOString())
    .lte('recorded_at', endOfDay.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily activity:', error);
    throw error;
  }

  // Calculate totals for the day
  const dailyTotals = data.reduce((acc, curr) => ({
    steps: (acc.steps || 0) + (curr.steps || 0),
    calories: (acc.calories || 0) + (curr.calories_burned || 0),
    activeMinutes: (acc.activeMinutes || 0) + (curr.active_minutes || 0),
    heartRate: data.length > 0 ? Math.round(data.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / data.length) : 0,
  }), { steps: 0, calories: 0, activeMinutes: 0, heartRate: 0 });

  return {
    metrics: data as HealthMetric[],
    totals: dailyTotals,
  };
};

export const getWeeklyActivity = async (userId: string) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', startDate.toISOString())
    .lte('recorded_at', endDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching weekly activity:', error);
    throw error;
  }

  // Group by day
  const days: Record<string, HealthMetric[]> = {};
  data.forEach(metric => {
    const date = new Date(metric.recorded_at).toISOString().split('T')[0];
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(metric);
  });

  // Calculate daily totals
  const weeklyData = Object.entries(days).map(([date, metrics]) => {
    return {
      date,
      steps: metrics.reduce((sum, m) => sum + (m.steps || 0), 0),
      calories: metrics.reduce((sum, m) => sum + (m.calories_burned || 0), 0),
      activeMinutes: metrics.reduce((sum, m) => sum + (m.active_minutes || 0), 0),
      heartRate: metrics.length > 0 
        ? Math.round(metrics.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / metrics.length)
        : 0,
    };
  });

  return weeklyData;
};

export const recordHealthMetric = async (metric: Omit<HealthMetric, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('health_metrics')
    .insert([metric])
    .select()
    .single();

  if (error) {
    console.error('Error recording health metric:', error);
    throw error;
  }

  return data as HealthMetric;
};
