import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Card, Title, ActivityIndicator } from 'react-native-paper';

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'medication' | 'appointment' | 'activity' | 'alert';
};

const ActivityScreen: React.FC = () => {
  const theme = useTheme();
  
  // Mock data - replace with actual data from your API
  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'Medication Taken',
      description: 'John took his morning medication',
      time: '2 hours ago',
      type: 'medication',
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      description: 'Upcoming appointment with Dr. Smith at 2:00 PM',
      time: '5 hours ago',
      type: 'appointment',
    },
    {
      id: '3',
      title: 'Daily Walk',
      description: 'Completed 30-minute walk in the park',
      time: '1 day ago',
      type: 'activity',
    },
  ];

  const getIconName = (type: string) => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'appointment':
        return 'calendar-clock';
      case 'activity':
        return 'walk';
      case 'alert':
        return 'alert-circle';
      default:
        return 'information';
    }
  };

  if (!activities.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Title style={[styles.title, { color: theme.colors.onSurface }]}>
        Recent Activity
      </Title>
      
      {activities.map((activity) => (
        <Card 
          key={activity.id} 
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Title
            title={activity.title}
            subtitle={activity.time}
            left={(props) => (
              <View style={[
                styles.iconContainer,
                { backgroundColor: `${theme.colors.primary}20` }
              ]}>
                <Text style={[styles.icon, { color: theme.colors.primary }]}>
                  {getIconName(activity.type)}
                </Text>
              </View>
            )}
          />
          <Card.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {activity.description}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});

export default ActivityScreen;
