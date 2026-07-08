import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors the native demos' DemoPrefs (Java/iOS): a thin AsyncStorage wrapper
// for the values the demo wants to keep across launches.

const APP_ID_KEY = '@pushengage_demo/appId';
const ENV_KEY = '@pushengage_demo/environment';

export const DEFAULT_APP_ID = 'YOUR_APP_ID';

export type DemoEnvironment = 'STAGING' | 'PRODUCTION';
export const DEFAULT_ENVIRONMENT: DemoEnvironment = 'PRODUCTION';

export const DemoPrefs = {
  async getAppId(): Promise<string> {
    const stored = await AsyncStorage.getItem(APP_ID_KEY);
    return stored && stored.length > 0 ? stored : DEFAULT_APP_ID;
  },

  async setAppId(value: string): Promise<void> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      await AsyncStorage.removeItem(APP_ID_KEY);
    } else {
      await AsyncStorage.setItem(APP_ID_KEY, trimmed);
    }
  },

  async getEnvironment(): Promise<DemoEnvironment> {
    const stored = await AsyncStorage.getItem(ENV_KEY);
    return stored === 'STAGING' ? 'STAGING' : DEFAULT_ENVIRONMENT;
  },

  async setEnvironment(value: DemoEnvironment): Promise<void> {
    await AsyncStorage.setItem(ENV_KEY, value);
  },

  isConfigured(value: string): boolean {
    return value.length > 0 && value !== DEFAULT_APP_ID;
  },
};
