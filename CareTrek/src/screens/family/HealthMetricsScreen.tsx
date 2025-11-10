import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  useTheme,
  Text,
  Card,
  SegmentedButtons,
  Button,
  IconButton,
  Menu,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MetricType = 'steps' | 'heart' | 'bp' | 'glucose';
const windowWidth = Dimensions.get('window').width;

const HealthMetricsScreen: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>(
    'week'
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('steps');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Types
  type MetricData = {
    labels: string[];
    color: string;
    unit: string;
    current: string;
    icon: string;
  };

  type StepsData = MetricData & {
    data: number[];
    goal: string;
  };

  type HeartRateData = MetricData & {
    data: number[];
    normalRange: string;
  };

  type BloodPressureData = MetricData & {
    systolic: number[];
    diastolic: number[];
    normalRange: string;
  };

  type GlucoseData = MetricData & {
    data: number[];
    normalRange: string;
  };

  type Metrics = {
    steps: StepsData;
    heart: HeartRateData;
    bp: BloodPressureData;
    glucose: GlucoseData;
  };

  // Mock data
  const mockData: Metrics = {
    steps: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [4300, 5200, 4800, 6100, 5400, 3200, 4100],
      color: '#4CAF50',
      unit: 'steps',
      current: '5,200',
      goal: '7,500',
      icon: 'walk',
    },
    heart: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [72, 75, 71, 73, 74, 70, 69],
      color: '#F44336',
      unit: 'bpm',
      current: '72',
      normalRange: '60-100',
      icon: 'heart-pulse',
    },
    bp: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      systolic: [122, 120, 118, 124, 121, 123, 119],
      diastolic: [82, 80, 79, 81, 83, 82, 80],
      color: '#9C27B0',
      unit: 'mmHg',
      current: '120/80',
      normalRange: '<120/80',
      icon: 'blood-bag',
    },
    glucose: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [95, 102, 98, 105, 99, 101, 97],
      color: '#2196F3',
      unit: 'mg/dL',
      current: '102',
      normalRange: '70-140',
      icon: 'needle',
    },
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      // stroke will be applied by dataset color functions in the chart datasets where needed
    },
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    const data = mockData[selectedMetric];

    if (selectedMetric === 'bp') {
      const bpData = data as BloodPressureData;
      return (
        <LineChart
          data={{
            labels: bpData.labels,
            datasets: [
              {
                data: bpData.systolic,
                color: () => '#F44336',
                strokeWidth: 2,
              },
              {
                data: bpData.diastolic,
                color: () => '#9C27B0',
                strokeWidth: 2,
              },
            ],
          }}
          width={windowWidth - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix=" "
        />
      );
    }

    // steps, heart, glucose
    const metricData = data as StepsData | HeartRateData | GlucoseData;
    return (
      <LineChart
        data={{
          labels: metricData.labels,
          datasets: [
            {
              data: (metricData as any).data,
              color: () => data.color,
              strokeWidth: 2,
            },
          ],
        }}
        width={windowWidth - 48}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisSuffix={selectedMetric === 'glucose' ? '' : ' '}
      />
    );
  };

  const renderMetricInfo = () => {
    const data = mockData[selectedMetric];
    return (
      <View style={styles.infoContainer}>
        <Text variant="bodyMedium" style={styles.infoText}>
          {selectedMetric === 'bp'
            ? 'Blood pressure measures the force of blood against your artery walls.'
            : selectedMetric === 'heart'
            ? 'Heart rate is the number of times your heart beats per minute.'
            : selectedMetric === 'glucose'
            ? 'Blood glucose measures the amount of sugar in your blood.'
            : 'Steps track your daily physical activity.'}
        </Text>

        {selectedMetric === 'bp' && (
          <View style={styles.bpInfo}>
            <View style={styles.bpInfoItem}>
              <View style={[styles.bpIndicator, { backgroundColor: '#F44336' }]} />
              <Text style={styles.bpLabel}>Systolic (top number)</Text>
            </View>
            <View style={styles.bpInfoItem}>
              <View style={[styles.bpIndicator, { backgroundColor: '#9C27B0' }]} />
              <Text style={styles.bpLabel}>Diastolic (bottom number)</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const getAverageValue = () => {
    const data = mockData[selectedMetric];
    if (selectedMetric === 'bp') {
      const bpData = data as BloodPressureData;
      const avgSystolic = Math.round(bpData.systolic.reduce((a, b) => a + b, 0) / bpData.systolic.length);
      const avgDiastolic = Math.round(bpData.diastolic.reduce((a, b) => a + b, 0) / bpData.diastolic.length);
      return `${avgSystolic}/${avgDiastolic} ${data.unit}`;
    } else {
      const metricData = data as StepsData | HeartRateData | GlucoseData;
      const arr = (metricData as any).data as number[];
      const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      return `${avg.toLocaleString()} ${data.unit}`;
    }
  };

  const getStatusColor = () => {
    const data = mockData[selectedMetric];
    if (selectedMetric === 'bp') {
      const [systolic] = data.current.split('/').map(Number);
      if (systolic < 120) return '#4CAF50';
      if (systolic < 130) return '#FFC107';
      return '#F44336';
    }
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (selectedMetric === 'bp') {
      const [systolic] = mockData.bp.current.split('/').map(Number);
      if (systolic < 120) return 'Normal';
      if (systolic < 130) return 'Elevated';
      return 'High';
    }
    return 'Normal';
  };

  const renderMetricDetails = () => {
    const data = mockData[selectedMetric];

    const statContent =
      selectedMetric === 'bp' ? (
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>
            Normal Range
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {(data as BloodPressureData).normalRange}
          </Text>
        </View>
      ) : selectedMetric === 'heart' || selectedMetric === 'glucose' ? (
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>
            Normal Range
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {(data as HeartRateData | GlucoseData).normalRange}
          </Text>
        </View>
      ) : (
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>
            Daily Goal
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {(data as StepsData).goal}
          </Text>
        </View>
      );

    return (
      <Card style={styles.metricCard}>
        <Card.Content>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIcon, { backgroundColor: `${data.color}20` }]}>
              <MaterialCommunityIcons name={data.icon as any} size={24} color={data.color} />
            </View>
            <View>
              <Text variant="titleLarge" style={styles.metricValue}>
                {data.current} <Text style={styles.metricUnit}>{data.unit}</Text>
              </Text>
              <Text variant="bodyMedium" style={styles.metricLabel}>
                Current {selectedMetric === 'bp' ? 'Blood Pressure' : selectedMetric}
              </Text>
            </View>
          </View>

          <View style={styles.metricStats}>
            {statContent}
            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={styles.infoLabel}>
                Status
              </Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                <Text variant="bodyMedium" style={styles.statusText}>
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getMetricTitle = (metric: MetricType) => {
    switch (metric) {
      case 'steps':
        return 'Step Count';
      case 'heart':
        return 'Heart Rate';
      case 'bp':
        return 'Blood Pressure';
      case 'glucose':
        return 'Blood Glucose';
      default:
        return '';
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="headlineSmall" style={styles.title}>
              Health Metrics
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Track and monitor health data
            </Text>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton icon="dots-vertical" size={24} onPress={() => setMenuVisible(true)} />
            }
          >
            <Menu.Item onPress={() => setMenuVisible(false)} title="Settings" leadingIcon="cog" />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleRefresh();
              }}
              title="Refresh Data"
              leadingIcon="refresh"
            />
            <Menu.Item onPress={() => setMenuVisible(false)} title="Export Data" leadingIcon="export" />
          </Menu>
        </View>

        <SegmentedButtons
          value={selectedMetric}
          onValueChange={(value) => setSelectedMetric(value as MetricType)}
          buttons={[
            { value: 'steps', label: 'Steps', icon: 'walk' },
            { value: 'heart', label: 'Heart', icon: 'heart-pulse' },
            { value: 'bp', label: 'BP', icon: 'blood-bag' },
            { value: 'glucose', label: 'Glucose', icon: 'needle' },
          ]}
          style={styles.segmentedButtons}
        />

        <View style={styles.timeRangeContainer}>
          {(['Day', 'Week', 'Month', 'Year'] as const).map((range) => {
            const rangeLower = range.toLowerCase() as 'day' | 'week' | 'month' | 'year';
            return (
              <Button
                key={range}
                mode={timeRange === rangeLower ? 'contained' : 'outlined'}
                onPress={() => setTimeRange(rangeLower)}
                compact
                style={styles.timeRangeButton}
              >
                {range}
              </Button>
            );
          })}
        </View>

        {renderMetricInfo()}

        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text variant="titleMedium">
                {getTimeRangeLabel()}'s {getMetricTitle(selectedMetric)}
              </Text>
              <IconButton icon="information-outline" size={20} onPress={() => {}} />
            </View>
            {renderChart()}
          </Card.Content>
        </Card>

        {renderMetricDetails()}

        <View style={styles.actions}>
          <Button mode="outlined" icon="chart-line" onPress={() => {}} style={styles.actionButton}>
            View Trends
          </Button>
          <Button mode="contained" icon="plus" onPress={() => {}} style={styles.actionButton}>
            Add Reading
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', height: 220 },
  chart: { marginVertical: 16, borderRadius: 8 },
  segmentedButtons: { marginHorizontal: 16, marginBottom: 16 },
  metricCard: { margin: 16, marginBottom: 8, borderRadius: 12, elevation: 2 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricValue: { fontSize: 24, fontWeight: 'bold' },
  metricUnit: { fontSize: 16, opacity: 0.7 },
  metricLabel: { fontSize: 14, opacity: 0.7 },
  metricStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, opacity: 0.7, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  infoContainer: { padding: 16, paddingTop: 0 },
  infoText: { fontSize: 14, lineHeight: 20, color: '#333' },
  bpInfo: { marginTop: 12 },
  bpInfoItem: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bpIndicator: { width: 16, height: 16, borderRadius: 8, marginRight: 8 },
  bpLabel: { fontSize: 14, color: '#333' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  actionButton: { flex: 1, marginHorizontal: 8 },
  timeRangeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  timeRangeButton: { marginHorizontal: 4 },
  chartCard: { margin: 16, marginBottom: 8, borderRadius: 12, elevation: 2 },
  chartHeader: { padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: 16, fontWeight: 'bold' },
  infoItem: { padding: 8, flex: 1 },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '500' },
});

export default HealthMetricsScreen;
