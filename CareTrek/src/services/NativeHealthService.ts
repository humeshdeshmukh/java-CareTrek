import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthInputOptions,
  HealthKitPermissions,
  HealthObserver,
} from 'react-native-health';
import { request, check, PERMISSIONS, Permission, PermissionStatus } from 'react-native-permissions';

// Import HealthMetric from the correct path (case-sensitive)
import { HealthMetric } from './healthService';

// Type definitions for health data
type SleepSample = {
  value: string;
  startDate: string;
  endDate: string;
  sourceName?: string;
  sourceId?: string;
};

class NativeHealthService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request necessary permissions
      if (Platform.OS === 'ios') {
        await this.requestIOSPermissions();
        
        // Initialize Apple HealthKit
        await new Promise<void>((resolve, reject) => {
          const permissions: HealthKitPermissions = {
            permissions: {
              read: [
                AppleHealthKit.Constants.Permissions.Steps,
                AppleHealthKit.Constants.Permissions.HeartRate,
                AppleHealthKit.Constants.Permissions.SleepAnalysis,
                AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
              ],
              write: [],
            },
          };

          AppleHealthKit.initHealthKit(permissions, (error: string) => {
            if (error) {
              console.error('Error initializing HealthKit:', error);
              reject(error);
              return;
            }
            this.isInitialized = true;
            resolve();
          });
        });
        
        return this.isInitialized;
      } else if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
        // For Android, we'll use Health Connect which is handled by react-native-health
        this.isInitialized = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing health service:', error);
      return false;
    }
  }

  private async requestIOSPermissions(): Promise<void> {
    try {
      // Request HealthKit permissions through react-native-health
      await new Promise<void>((resolve, reject) => {
        const permissions: HealthKitPermissions = {
          permissions: {
            read: [
              AppleHealthKit.Constants.Permissions.Steps,
              AppleHealthKit.Constants.Permissions.HeartRate,
              AppleHealthKit.Constants.Permissions.SleepAnalysis,
              AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
            ],
            write: [],
          },
        };

        AppleHealthKit.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.error('Error initializing HealthKit:', error);
            reject(error);
            return;
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      throw error;
    }
  }

  private async requestAndroidPermissions(): Promise<void> {
    try {
      // For Android, we'll use Health Connect which is handled by react-native-health
      // No additional permissions needed here as they're handled by the library
      return Promise.resolve();
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      throw error;
    }
  }

  async getTodaysHealthData(): Promise<Partial<HealthMetric>> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) throw new Error('Health services not available');
    }

    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const [steps, heartRate, sleep] = await Promise.all([
        this.getSteps(startOfDay, now),
        this.getHeartRate(startOfDay, now),
        this.getSleepAnalysis(startOfDay, now),
      ]);

      return {
        steps,
        heart_rate: heartRate,
        sleep_duration: sleep?.duration,
        sleep_quality: sleep?.quality,
        recorded_at: now.toISOString(),
      };
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  }

  private async getSteps(startDate: Date, endDate: Date): Promise<number> {
    try {
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      return new Promise((resolve, reject) => {
        AppleHealthKit.getStepCount(options, (err: string, results: HealthValue) => {
          if (err) {
            console.error('Error fetching steps:', err);
            resolve(0);
            return;
          }
          resolve(results.value || 0);
        });
      });
    } catch (error) {
      console.error('Error in getSteps:', error);
      return 0;
    }
  }

  private async getHeartRate(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getHeartRateSamples(
        options,
        (err: string, results: HealthValue[]) => {
          if (err || !results || results.length === 0) {
            console.error('Error or no heart rate data:', err);
            resolve(0);
            return;
          }
          
          // Calculate average heart rate
          const sum = results.reduce((acc: number, sample) => acc + sample.value, 0);
          const average = Math.round(sum / results.length);
          resolve(average);
        }
      );
    });
  }

  private async getSleepAnalysis(startDate: Date, endDate: Date): Promise<{ duration: number; quality: number } | null> {
    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      // Use the HealthKit sleep samples endpoint
      AppleHealthKit.getSleepSamples(
        options,
        (err: string, results: HealthValue[]) => {
          if (err || !results || results.length === 0) {
            console.error('Error or no sleep data:', err);
            resolve(null);
            return;
          }

          // Calculate total sleep duration in hours
          const totalDuration = results.reduce((total: number, sample) => {
            // Check if the sample is a sleep sample
            const isSleepSample = sample.value === 1; // 1 typically represents 'INBED' or 'ASLEEP' in HealthKit
            if (isSleepSample) {
              const start = new Date(sample.startDate).getTime();
              const end = new Date(sample.endDate).getTime();
              return total + (end - start);
            }
            return total;
          }, 0);

          // Convert milliseconds to hours
          const duration = parseFloat((totalDuration / (1000 * 60 * 60)).toFixed(1));

          // Simple sleep quality calculation
          const quality = Math.min(100, Math.max(0, 70 + (duration - 6) * 5));

          resolve({ duration, quality });
        }
      );
    });
  }
}

export const nativeHealthService = new NativeHealthService();
