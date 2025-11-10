import { supabase } from '../lib/supabase';

type TimeRange = 'day' | 'week' | 'month' | 'year';
type MetricType = 'steps' | 'heart' | 'bp' | 'glucose';

interface HealthMetricBase {
  id: string;
  value: string;
  unit: string;
  recorded_at: string;
  notes?: string;
}

export interface StepsData extends HealthMetricBase {
  metric_type: 'steps';
  goal: string;
  normalRange: string;
}

export interface HeartRateData extends HealthMetricBase {
  metric_type: 'heart';
  normalRange: string;
}

export interface BloodPressureData extends HealthMetricBase {
  metric_type: 'bp';
  systolic: string;
  diastolic: string;
  normalRange: string;
}

export interface GlucoseData extends HealthMetricBase {
  metric_type: 'glucose';
  normalRange: string;
}

type HealthMetric = StepsData | HeartRateData | BloodPressureData | GlucoseData;

export const HealthService = {
  // Get health metrics summary for dashboard
  async getSummary() {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return this.processMetrics(data || []);
  },

  // Get metrics for a specific type and time range
  async getMetrics(metricType: MetricType, timeRange: TimeRange) {
    const date = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(date.setDate(date.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(date.setDate(date.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(date.setMonth(date.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(date.setFullYear(date.getFullYear() - 1));
        break;
      default:
        startDate = new Date(date.setDate(date.getDate() - 7));
    }

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('metric_type', this.mapMetricType(metricType))
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return this.processMetrics(data || []);
  },

  // Add a new health metric
  async addMetric(metric: Omit<HealthMetric, 'id' | 'recorded_at'>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert({
        metric_type: this.mapMetricType(metric.metric_type),
        value: metric.value,
        unit: this.getUnitForMetric(metric.metric_type),
        notes: metric.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Process raw metrics into the format expected by the UI
  private processMetrics(metrics: any[]) {
    const result: Record<string, any> = {
      steps: { data: [], labels: [], current: '0', goal: '10000', normalRange: '8,000 - 12,000 steps', unit: 'steps' },
      heart: { data: [], labels: [], current: '72', normalRange: '60-100 bpm', unit: 'bpm' },
      bp: { data: [], labels: [], current: '120/80', systolic: [], diastolic: [], normalRange: '90/60 - 120/80 mmHg', unit: 'mmHg' },
      glucose: { data: [], labels: [], current: '100', normalRange: '70-140 mg/dL', unit: 'mg/dL' },
    };

    // Group metrics by type and process them
    metrics.forEach(metric => {
      const type = this.mapToUIMetricType(metric.metric_type);
      const date = new Date(metric.recorded_at);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (type === 'bp') {
        const [systolic, diastolic] = metric.value.split('/').map(Number);
        result.bp.labels.push(label);
        result.bp.systolic.push(systolic);
        result.bp.diastolic.push(diastolic);
        result.bp.current = metric.value;
      } else if (type) {
        result[type].labels.push(label);
        result[type].data.push(Number(metric.value));
        result[type].current = metric.value;
      }
    });

    return result;
  },

  // Map internal metric types to UI metric types
  private mapToUIMetricType(type: string): MetricType | null {
    switch (type) {
      case 'steps': return 'steps';
      case 'heart_rate': return 'heart';
      case 'blood_pressure': return 'bp';
      case 'glucose': return 'glucose';
      default: return null;
    }
  },

  // Map UI metric types to internal types
  private mapMetricType(type: MetricType): string {
    switch (type) {
      case 'steps': return 'steps';
      case 'heart': return 'heart_rate';
      case 'bp': return 'blood_pressure';
      case 'glucose': return 'glucose';
      default: return type;
    }
  },

  // Get unit for a metric type
  private getUnitForMetric(type: MetricType): string {
    switch (type) {
      case 'steps': return 'steps';
      case 'heart': return 'bpm';
      case 'bp': return 'mmHg';
      case 'glucose': return 'mg/dL';
      default: return '';
    }
  },
};
