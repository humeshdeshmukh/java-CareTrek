import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Vibration, Alert } from 'react-native';
import { Text, Button, Card, useTheme, Switch, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FallDetectionScreen = () => {
  const theme = useTheme();
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  // Mock fall detection history
  const [fallHistory, setFallHistory] = useState([
    { id: '1', date: '2023-11-10 14:30', location: 'Living Room', responded: true },
    { id: '2', date: '2023-11-08 09:15', location: 'Kitchen', responded: true },
    { id: '3', date: '2023-11-05 16:45', location: 'Bedroom', responded: true },
  ]);

  // Toggle fall detection
  const toggleFallDetection = () => {
    if (isEnabled && !isAlertActive) {
      Alert.alert(
        'Disable Fall Detection?',
        'Are you sure you want to disable fall detection? This will stop automatic emergency alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: () => setIsEnabled(false)
          },
        ]
      );
    } else {
      setIsEnabled(true);
    }
  };

  // Simulate a fall (for testing)
  const simulateFall = () => {
    if (!isEnabled) return;
    
    setIsSimulating(true);
    setIsAlertActive(true);
    setCountdown(30);
    Vibration.vibrate([0, 500, 200, 500], true);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-alert emergency contacts if no response
          if (isAlertActive) {
            triggerEmergencyAlert();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  // Cancel the alert
  const cancelAlert = () => {
    setIsAlertActive(false);
    setIsSimulating(false);
    Vibration.cancel();
    // In a real app, this would also cancel any pending alerts
  };

  // Trigger emergency alert
  const triggerEmergencyAlert = () => {
    // In a real app, this would notify emergency contacts
    Alert.alert(
      'Emergency Alert Sent',
      'Your emergency contacts have been notified with your location.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            setIsAlertActive(false);
            setIsSimulating(false);
            // Add to history
            setFallHistory([
              {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                location: 'Living Room', // In a real app, get from GPS
                responded: true
              },
              ...fallHistory
            ]);
          }
        },
      ]
    );
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isAlertActive ? (
        <View style={styles.alertContainer}>
          <View style={[styles.alertContent, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons 
              name="alert-octagram" 
              size={80} 
              color="#FF3B30" 
              style={styles.alertIcon}
            />
            <Text style={[styles.alertTitle, { color: theme.colors.error }]}>
              Fall Detected!
            </Text>
            <Text style={[styles.alertSubtitle, { color: theme.colors.onSurface }]}>
              {isSimulating ? 'This is a test alert.' : 'We detected a possible fall.'}
            </Text>
            
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownText, { color: theme.colors.error }]}>
                {formatTime(countdown)}
              </Text>
              <Text style={[styles.countdownLabel, { color: theme.colors.onSurface }]}>
                Emergency services will be notified in
              </Text>
            </View>
            
            <View style={styles.alertButtons}>
              <Button 
                mode="contained" 
                onPress={cancelAlert}
                style={[styles.alertButton, { backgroundColor: '#34C759' }]}
                labelStyle={styles.alertButtonText}
              >
                I'm Okay
              </Button>
              <Button 
                mode="contained" 
                onPress={triggerEmergencyAlert}
                style={[styles.alertButton, { backgroundColor: '#FF3B30' }]}
                labelStyle={styles.alertButtonText}
              >
                Call for Help
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Status Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicatorContainer}>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { 
                        backgroundColor: isEnabled ? '#34C759' : '#FF3B30',
                        opacity: isEnabled ? 1 : 0.5
                      }
                    ]} 
                  />
                  <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>
                    {isEnabled ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={toggleFallDetection}
                  color={theme.colors.primary}
                />
              </View>
              
              <Text style={[styles.statusDescription, { color: theme.colors.onSurface }]}>
                {isEnabled 
                  ? 'Fall detection is active. The system will automatically detect falls and send alerts.'
                  : 'Fall detection is turned off. You will not receive automatic fall alerts.'}
              </Text>
              
              <Button 
                mode="outlined" 
                onPress={simulateFall}
                disabled={!isEnabled}
                style={styles.testButton}
                icon="alert"
              >
                Test Fall Detection
              </Button>
            </Card.Content>
          </Card>

          {/* Settings Section */}
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Settings
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.settingItem}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                    High Sensitivity Mode
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                    Increases sensitivity for fall detection (may cause false alarms)
                  </Text>
                </View>
                <Switch value={false} onValueChange={() => {}} />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                    Notify Emergency Contacts
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                    Automatically notify emergency contacts when a fall is detected
                  </Text>
                </View>
                <Switch value={true} onValueChange={() => {}} />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                    Call Emergency Services
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                    Automatically call emergency services if no response
                  </Text>
                </View>
                <Switch value={true} onValueChange={() => {}} />
              </View>
            </Card.Content>
          </Card>

          {/* Fall History */}
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Fall History
            </Text>
            <Button mode="text" onPress={() => console.log('View All')}>
              View All
            </Button>
          </View>
          
          {fallHistory.length > 0 ? (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                {fallHistory.slice(0, 3).map((fall, index) => (
                  <React.Fragment key={fall.id}>
                    <View style={styles.historyItem}>
                      <MaterialCommunityIcons 
                        name="alert-circle" 
                        size={24} 
                        color={fall.responded ? '#34C759' : '#FF3B30'} 
                      />
                      <View style={styles.historyDetails}>
                        <Text style={[styles.historyDate, { color: theme.colors.onSurface }]}>
                          {new Date(fall.date).toLocaleString()}
                        </Text>
                        <Text style={[styles.historyLocation, { color: theme.colors.textSecondary }]}>
                          {fall.location}
                        </Text>
                      </View>
                      <Text style={[
                        styles.historyStatus,
                        { color: fall.responded ? '#34C759' : '#FF3B30' }
                      ]}>
                        {fall.responded ? 'Responded' : 'No Response'}
                      </Text>
                    </View>
                    {index < Math.min(2, fallHistory.length - 1) && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </Card.Content>
            </Card>
          ) : (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyHistory}>
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={48} 
                  color={theme.colors.primary} 
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                  No falls detected recently
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                  Your fall detection history will appear here
                </Text>
              </Card.Content>
            </Card>
          )}
          
          {/* Help Section */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.helpTitle, { color: theme.colors.primary }]}>
                How Fall Detection Works
              </Text>
              <View style={styles.helpItem}>
                <MaterialCommunityIcons 
                  name="shield-alert" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.helpText, { color: theme.colors.onSurface }]}>
                  The app uses your device's sensors to detect hard falls
                </Text>
              </View>
              <View style={styles.helpItem}>
                <MaterialCommunityIcons 
                  name="timer" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.helpText, { color: theme.colors.onSurface }]}>
                  You'll have 30 seconds to respond before emergency services are contacted
                </Text>
              </View>
              <View style={styles.helpItem}>
                <MaterialCommunityIcons 
                  name="cellphone" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.helpText, { color: theme.colors.onSurface }]}>
                  Keep your device with you for accurate fall detection
                </Text>
              </View>
            </Card.Content>
          </Card>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              For emergency assistance, press the SOS button on the home screen
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  alertButtons: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
    maxWidth: '90%',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  helpText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default FallDetectionScreen;
