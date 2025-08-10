/**
 * Shared utilities and types for iOS ContextOS Project
 */

// Context-aware interfaces
export interface ContextData {
  timestamp: Date;
  location?: GeolocationCoordinates;
  deviceInfo: DeviceInfo;
  userActivity: UserActivity;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
}

export interface UserActivity {
  type: 'active' | 'idle' | 'background';
  lastInteraction: Date;
}

// Utility functions
export const formatTimestamp = (date: Date): string => {
  return date.toISOString();
};

export const getDeviceInfo = (): DeviceInfo => {
  return {
    platform: 'iOS',
    version: '17.0',
    model: 'iPhone'
  };
};

// Export all types and utilities
export * from './types';
export * from './utils';

// Default export
export default {
  formatTimestamp,
  getDeviceInfo
};
