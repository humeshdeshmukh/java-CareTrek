import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { HealthMetric } from '../services/healthService';
import { nativeHealthService } from '../services/NativeHealthService';

type HealthContextType = {
  healthData: Partial<HealthMetric> | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const HealthContext = createContext<HealthContextType>({
  healthData: null,
  isLoading: false,
  error: null,
  refresh: async () => {},
});

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthData, setHealthData] = useState<Partial<HealthMetric> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.warn('Health data is only available on iOS and Android');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await nativeHealthService.getTodaysHealthData();
      setHealthData(data);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <HealthContext.Provider
      value={{
        healthData,
        isLoading,
        error,
        refresh: fetchHealthData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
