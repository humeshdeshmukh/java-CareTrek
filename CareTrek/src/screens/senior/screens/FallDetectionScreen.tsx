import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Vibration, Alert, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, Button, Card, useTheme, Switch, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../../../src/services/supabase';
import { Session } from '@supabase/supabase-js';

interface FallEvent {
  id: string;
  user_id: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  responded: boolean;
  response_time?: number; // in seconds
  emergency_contacts_notified: boolean;
  emergency_services_called: boolean;
  is_test: boolean;
  created_at: string;
  updated_at: string;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const FallDetectionScreen = () => {
  const theme = useTheme();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [settings, setSettings] = useState({
    highSensitivity: false,
    notifyContacts: true,
    callEmergency: true,
    countdownDuration: 30,
  });
  const [fallHistory, setFallHistory] = useState<FallEvent[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'error' | 'success',
  });
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const responseStartTime = useRef<number>(0);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Initialize the component
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Request permissions in parallel
        const [locationPermission, notificationPermission] = await Promise.allSettled([
          Location.requestForegroundPermissionsAsync(),
          Notifications.requestPermissionsAsync()
        ]);

        if (isMounted) {
          // Check permissions
          const locationGranted = locationPermission.status === 'fulfilled' && 
                                locationPermission.value.status === 'granted';
          
          if (!locationGranted) {
            showSnackbar('Location permission is required for fall detection', 'error');
          }

          // Get current location if permission granted
          if (locationGranted) {
            try {
              const location = await Location.getCurrentPositionAsync({});
              if (isMounted) setCurrentLocation(location);
            } catch (locationError) {
              console.warn('Error getting location:', locationError);
            }
          }

          // Get user session
          const { data: { session } } = await supabase.auth.getSession();
          if (isMounted && session) {
            setSession(session);
            await Promise.all([
              loadSettings(session.user.id),
              loadFallHistory(session.user.id)
            ]);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        showSnackbar('Error initializing fall detection', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    init();

    // Set up notification listeners
    const notificationSubscription = Notifications.addNotificationReceivedListener(handleNotification);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Cleanup function
    return () => {
      isMounted = false;
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [isEnabled]);

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('fall_detection_settings')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.fall_detection_settings) {
        setSettings(prev => ({
          ...prev,
          ...data.fall_detection_settings,
        }));
        setCountdown(data.fall_detection_settings.countdownDuration || 30);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };

  const loadFallHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('fall_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setFallHistory(data || []);
    } catch (error) {
      console.error('Error loading fall history:', error);
      throw error;
    }
  };

  const saveSettings = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          fall_detection_settings: settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save settings', 'error');
    }
  };

  const handleNotification = (notification: Notifications.Notification) => {
    // Handle incoming notifications
    console.log('Notification received:', notification);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { actionIdentifier } = response;
    
    if (actionIdentifier === 'dismiss') {
      cancelAlert();
    } else if (actionIdentifier === 'emergency') {
      triggerEmergencyAlert();
    }
  };

  // Toggle fall detection
  const toggleFallDetection = async () => {
    if (isEnabled && !isAlertActive) {
      Alert.alert(
        'Disable Fall Detection?',
        'Are you sure you want to disable fall detection? This will stop automatic emergency alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              setIsEnabled(false);
              await saveSettings();
            }
          },
        ]
      );
    } else {
      setIsEnabled(true);
      saveSettings();
    }
  };

  const showSnackbar = (message: string, type: 'info' | 'error' | 'success') => {
    setSnackbar({
      visible: true,
      message,
      type,
    });
  };

  // Simulate a fall (for testing)
  const simulateFall = async () => {
    if (!isEnabled || !session?.user?.id) {
      showSnackbar('Please sign in to test fall detection', 'error');
      return;
    }
    
    try {
      setIsSimulating(true);
      setIsAlertActive(true);
      setCountdown(settings.countdownDuration);
      responseStartTime.current = Date.now();
      
      // Start vibration pattern
      Vibration.vibrate([0, 500, 200, 500], true);
      
      // Schedule local notification
      await scheduleNotification();
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Auto-trigger emergency alert if no response
            if (isAlertActive) {
              triggerEmergencyAlert(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error simulating fall:', error);
      showSnackbar('Failed to simulate fall detection', 'error');
      cancelAlert();
    }
  };
  
  const scheduleNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Create notification content
    const content = {
      title: 'Fall Detected!',
      body: 'We detected a possible fall. Tap to respond.',
      data: { type: 'fall_detection' },
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
      sound: 'default',
      categoryIdentifier: 'fallDetection',
    };
    
    // Schedule immediate notification
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null, // Send immediately
    });
    
    // Add action buttons for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationCategoryAsync('fallDetection', [
        {
          identifier: 'dismiss',
          buttonTitle: 'I\'m Okay',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'emergency',
          buttonTitle: 'Call for Help',
          options: {
            isDestructive: true,
            opensAppToForeground: true,
          },
        },
      ]);
    }
  };

  // Cancel the alert
  const cancelAlert = async () => {
    try {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      Vibration.cancel();
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Log the cancellation
      if (session?.user?.id) {
        await logFallEvent({
          responded: true,
          responseTime: Math.floor((Date.now() - responseStartTime.current) / 1000),
          emergencyContactsNotified: false,
          emergencyServicesCalled: false,
          isTest: isSimulating,
        });
      }
      
      setIsAlertActive(false);
      setIsSimulating(false);
      showSnackbar('Fall alert cancelled', 'success');
    } catch (error) {
      console.error('Error cancelling alert:', error);
      showSnackbar('Failed to cancel alert', 'error');
    }
  };

  // Log fall event to database
  const logFallEvent = async (eventData: Partial<FallEvent>) => {
    if (!session?.user?.id || !currentLocation) return null;
    
    try {
      const fallEvent: Partial<FallEvent> = {
        user_id: session.user.id,
        timestamp: new Date().toISOString(),
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        responded: false,
        emergency_contacts_notified: false,
        emergency_services_called: false,
        is_test: false,
        ...eventData,
      };
      
      const { data, error } = await supabase
        .from('fall_events')
        .insert([fallEvent])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      if (data) {
        setFallHistory(prev => [data as FallEvent, ...prev].slice(0, 5));
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error logging fall event:', error);
      throw error;
    }
  };

  // Get address from coordinates
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (address) {
        return [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Location Unknown';
    }
  };

  // Trigger emergency alert
  const triggerEmergencyAlert = async (autoTriggered = false) => {
    try {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      Vibration.cancel();
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Log the event
      const fallEvent = await logFallEvent({
        responded: !autoTriggered,
        responseTime: autoTriggered 
          ? settings.countdownDuration 
          : Math.floor((Date.now() - responseStartTime.current) / 1000),
        emergency_contacts_notified: settings.notifyContacts,
        emergency_services_called: settings.callEmergency,
        is_test: isSimulating,
      });
      
      // In a real app, you would:
      // 1. Get emergency contacts from the database
      // 2. Send notifications/emails/SMS to contacts
      // 3. Call emergency services if enabled
      // 4. Share real-time location with contacts
      
      // For demo purposes, we'll show an alert
      const locationText = fallEvent?.location 
        ? await getAddressFromCoords(
            (fallEvent.location as any).latitude, 
            (fallEvent.location as any).longitude
          )
        : 'Unknown Location';
      
      Alert.alert(
        'Emergency Alert Sent',
        `Your emergency contacts have been notified.\n\nLocation: ${locationText}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setIsAlertActive(false);
              setIsSimulating(false);
              showSnackbar('Help is on the way!', 'success');
            }
          },
        ]
      );
      
      // In a real app, you might also want to:
      // 1. Start sharing live location
      // 2. Open a call with emergency services
      // 3. Notify caregivers in real-time
      
    } catch (error) {
      console.error('Error triggering emergency alert:', error);
      showSnackbar('Failed to send emergency alert', 'error');
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle setting
  const toggleSetting = async (setting: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    
    setSettings(newSettings);
    
    if (session?.user?.id) {
      try {
        await saveSettings();
      } catch (error) {
        // Revert on error
        setSettings(prev => ({
          ...prev,
          [setting]: !prev[setting],
        }));
        showSnackbar('Failed to update setting', 'error');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle button press with proper type
  const handleCancelAlert = () => {
    cancelAlert();
  };

  const handleEmergencyAlert = () => {
    triggerEmergencyAlert();
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
            <Text style={[styles.alertTitle, { color: theme.colors.onSurface }]}>
              Fall Detected!
            </Text>
            <Text style={[styles.alertMessage, { color: theme.colors.onSurfaceVariant }]}>
              We've detected a potential fall. Please respond if you need help.
            </Text>
            <View style={styles.alertButtonContainer}>
              <Button 
                mode="contained" 
                onPress={handleCancelAlert}
                style={[styles.alertButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.onPrimary }}
              >
                I'm Okay
              </Button>
              <Button 
                mode="contained" 
                onPress={handleEmergencyAlert}
                style={[styles.alertButton, { backgroundColor: '#FF3B30' }]}
                labelStyle={{ color: 'white' }}
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
                  <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Increases sensitivity for fall detection (may cause false alarms)
                  </Text>
                </View>
                <Switch 
                  value={settings.highSensitivity} 
                  onValueChange={() => toggleSetting('highSensitivity')} 
                  disabled={!isEnabled}
                />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                    Notify Emergency Contacts
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Automatically notify emergency contacts when a fall is detected
                  </Text>
                </View>
                <Switch 
                  value={settings.notifyContacts} 
                  onValueChange={() => toggleSetting('notifyContacts')}
                  disabled={!isEnabled}
                />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                    Call Emergency Services
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Automatically call emergency services if no response
                  </Text>
                </View>
                <Switch 
                  value={settings.callEmergency} 
                  onValueChange={() => toggleSetting('callEmergency')}
                  disabled={!isEnabled || !settings.notifyContacts}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Fall History */}
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Alerts
            </Text>
            <Button 
              mode="text" 
              onPress={() => {
                // In a real app, navigate to a detailed history screen
                showSnackbar('View all alerts feature coming soon', 'info');
              }}
              disabled={fallHistory.length === 0}
            >
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
                        name={fall.responded ? 'check-circle' : 'alert-circle'} 
                        size={24} 
                        color={fall.responded ? '#34C759' : '#FF3B30'} 
                      />
                      <View style={styles.historyDetails}>
                        <Text style={[styles.historyDate, { color: theme.colors.onSurface }]}>
                          {formatDate(fall.timestamp || fall.created_at)}
                          {fall.is_test && ' (Test)'}
                        </Text>
                        <Text 
                          style={[
                            styles.historyLocation, 
                            { color: theme.colors.onSurfaceVariant }
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {fall.location?.address || 'Location not available'}
                        </Text>
                      </View>
                      <Text style={[
                        styles.historyStatus,
                        { 
                          color: fall.responded ? '#34C759' : '#FF3B30',
                          backgroundColor: fall.responded ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                        }
                      ]}>
                        {fall.responded 
                          ? `Responded${fall.response_time ? ` (${fall.response_time}s)` : ''}` 
                          : 'No Response'}
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
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No fall events recorded
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                  Test the fall detection to see alerts here
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
            <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
              CareTrek v1.0.0
            </Text>
            <Text style={[styles.footerText, { color: theme.colors.outline }]}>
              For emergency assistance, press the SOS button on the home screen
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Alert styles
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContent: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertIcon: {
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  
  // Loading styles
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
