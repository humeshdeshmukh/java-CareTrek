import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Alert, Platform, Linking, useWindowDimensions, StatusBar, Share } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';

interface LocationType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  accuracy?: number | null;
}

type LocationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Location'>;

interface LocationScreenProps {
  navigation: LocationScreenNavigationProp;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { width, height } = useWindowDimensions();
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.01;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const styles = useMemo(() => getStyles(theme), [theme]);

  const getLocation = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setErrorMsg(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission was denied');
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
        accuracy: currentLocation.coords.accuracy,
      };
      
      setLocation(newLocation);

      const [addressResponse] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const addressParts = [
        addressResponse?.name,
        addressResponse?.street,
        addressResponse?.city,
        addressResponse?.region,
        addressResponse?.postalCode,
        addressResponse?.country,
      ].filter(Boolean);

      setAddress(addressParts.join(', '));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleShareLocation = async () => {
    if (!location) return;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    const message = `My current location: ${address || 'Unknown location'}\n\n${mapUrl}`;

    try {
      await Share.share({
        message,
        title: 'My Current Location',
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert('Error', 'Failed to share location. Please try again.');
    }
  };

  const handleRefresh = async () => {
    await getLocation();
  };

  const animateToCurrentLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: location.latitudeDelta,
        longitudeDelta: location.longitudeDelta,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" animating color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Getting your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <MaterialCommunityIcons name="map-marker-off" size={48} color={theme.colors.error} />
        <Text style={{ marginTop: 16, textAlign: 'center', color: theme.colors.error }}>{errorMsg}</Text>
        <Button mode="contained" onPress={getLocation} style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
        loadingBackgroundColor={theme.colors.background}
        mapType="standard"
      >
        {location.accuracy && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={location.accuracy}
            fillColor="rgba(66, 135, 245, 0.1)"
            strokeColor="rgba(66, 135, 245, 0.3)"
            strokeWidth={1}
          />
        )}
      </MapView>

      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Your Location</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
            {address || 'Loading address...'}
          </Text>
          {lastUpdated && (
            <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </View>
        <IconButton
          icon="share-variant"
          size={24}
          onPress={handleShareLocation}
          style={{ margin: 0 }}
        />
      </View>

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.accuracyBadge}>
          <MaterialCommunityIcons name="crosshairs-gps" size={16} color={theme.colors.primary} />
          <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.primary }}>
            {location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Accurate'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <IconButton
            icon="crosshairs-gps"
            size={24}
            onPress={animateToCurrentLocation}
            style={styles.actionButton}
            iconColor={theme.colors.onSurface}
          />
          <IconButton
            icon="share-variant"
            size={24}
            onPress={handleShareLocation}
            style={styles.actionButton}
            iconColor={theme.colors.onSurface}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  actionBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    margin: 0,
    backgroundColor: theme.colors.surfaceVariant,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markerContainer: { display: 'none' },
  markerPin: { display: 'none' },
  markerPulse: { display: 'none' },
});

export default LocationScreen;
