import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTheme, Text, ActivityIndicator, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Location = {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
};

const LocationTrackingScreen: React.FC = () => {
  const theme = useTheme();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Mock location data - replace with actual location service
  const mockLocations: Location[] = [
    {
      latitude: 37.78825,
      longitude: -122.4324,
      timestamp: new Date(),
      accuracy: 10,
    },
  ];

  useEffect(() => {
    requestLocationPermission();
    // In a real app, you would set up a location watcher here
    const timer = setTimeout(() => {
      setIsLoading(false);
      setCurrentLocation(mockLocations[0]);
      setRegion({
        ...mockLocations[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'CareTrek needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMsg('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
        setErrorMsg('Error requesting location permission');
      }
    }
  };

  const refreshLocation = () => {
    setIsLoading(true);
    // In a real app, this would fetch the latest location
    setTimeout(() => {
      setIsLoading(false);
      setCurrentLocation({
        ...mockLocations[0],
        timestamp: new Date(),
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Getting location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons 
          name="map-marker-off" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={{ marginTop: 10, color: theme.colors.error }}>{errorMsg}</Text>
        <Button 
          mode="contained" 
          onPress={requestLocationPermission}
          style={{ marginTop: 20 }}
        >
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Senior's Location"
            description={`Last updated: ${currentLocation.timestamp.toLocaleTimeString()}`}
          >
            <MaterialCommunityIcons 
              name="account" 
              size={32} 
              color={theme.colors.primary} 
            />
          </Marker>
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.infoText}>
                <Text variant="bodySmall">Current Location</Text>
                <Text variant="bodyLarge">
                  {currentLocation ? 
                    `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : 
                    'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <MaterialCommunityIcons 
                name="clock-time-eight" 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.infoText}>
                <Text variant="bodySmall">Last Updated</Text>
                <Text variant="bodyMedium">
                  {currentLocation?.timestamp.toLocaleTimeString() || 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={refreshLocation}
              icon="refresh"
              loading={isLoading}
            >
              Refresh
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  map: {
    width: '100%',
    height: '60%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  infoCard: {
    borderRadius: 12,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
  },
});

export default LocationTrackingScreen;
