import { supabase } from '../lib/supabase';

export type MetricType = 'steps' | 'heart_rate' | 'blood_pressure' | 'glucose';

interface HealthMetricBase {
  id?: string;
  user_id: string;
  metric_type: MetricType;
  value: string;
  unit: string;
  recorded_at: string;
  notes?: string;
}

export interface StepsData extends HealthMetricBase {
  metric_type: 'steps';
  value: string; // number of steps
  unit: 'steps';
}

export interface HeartRateData extends HealthMetricBase {
  metric_type: 'heart_rate';
  value: string; // bpm
  unit: 'bpm';
}

export interface BloodPressureData extends HealthMetricBase {
  metric_type: 'blood_pressure';
  value: string; // format: "systolic/diastolic"
  unit: 'mmHg';
}

export interface GlucoseData extends HealthMetricBase {
  metric_type: 'glucose';
  value: string; // mg/dL or mmol/L
  unit: 'mg/dL' | 'mmol/L';
}

export type HealthMetric = StepsData | HeartRateData | BloodPressureData | GlucoseData;

export const HealthModel = {
  // Create a new health metric record
  async create(metric: Omit<HealthMetric, 'id'>): Promise<HealthMetric> {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data as HealthMetric;
  },

  // Get metrics for a user with optional filters
  async getMetrics(
    userId: string, 
    filters: {
      metric_type?: MetricType;
      start_date?: string;
      end_date?: string;
      limit?: number;
    } = {}
  ): Promise<HealthMetric[]> {
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (filters.metric_type) {
      query = query.eq('metric_type', filters.metric_type);
    }

    if (filters.start_date) {
      query = query.gte('recorded_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('recorded_at', filters.end_date);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as HealthMetric[];
  },

  // Get a single metric by ID
  async getById(id: string): Promise<HealthMetric | null> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as HealthMetric;
  },

  // Update a health metric
  async update(id: string, updates: Partial<Omit<HealthMetric, 'id' | 'user_id' | 'metric_type'>>): Promise<HealthMetric | null> {
    const { data, error } = await supabase
      .from('health_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HealthMetric;
  },

  // Delete a health metric
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get metrics summary for dashboard
  async getMetricsSummary(userId: string): Promise<{
    latest: Record<string, HealthMetric>;
    trends: Record<string, any>;
  }> {
    // Get the latest reading for each metric type
    const { data: latestMetrics, error: latestError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(4); // One for each metric type

    if (latestError) throw latestError;

    // Get trend data for each metric (e.g., last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: trendData, error: trendError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .order('recorded_at', { ascending: true });

    if (trendError) throw trendError;

    // Process trend data
    const trends = trendData.reduce((acc, metric) => {
      if (!acc[metric.metric_type]) {
        acc[metric.metric_type] = [];
      }
      acc[metric.metric_type].push({
        value: metric.value,
        date: metric.recorded_at,
      });
      return acc;
    }, {} as Record<string, Array<{ value: string; date: string }>>);

    return {
      latest: latestMetrics.reduce((acc, metric) => {
        acc[metric.metric_type] = metric;
        return acc;
      }, {} as Record<string, HealthMetric>),
      trends,
    };
  },
};
