import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    isDark,
    colors: {
      // Background colors
      background: isDark ? '#121212' : '#FFFFFF',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      surfaceElevated: isDark ? '#262626' : '#F8F8FA',
      
      // Text colors
      text: isDark ? '#FFFFFF' : '#0F0A18',
      textSecondary: isDark ? 'rgba(255, 255, 255, 0.7)' : '#736B82',
      textTertiary: isDark ? 'rgba(255, 255, 255, 0.6)' : '#A09AA8',
      
      // Interactive colors
      primary: '#6855FF',
      primaryDark: isDark ? '#7C6AFF' : '#6855FF',
      
      // Border and separator colors
      border: isDark ? '#2A2A2A' : '#EAEAEA',
      borderLight: isDark ? '#242424' : '#F0F0F2',
      separator: isDark ? '#333333' : '#E2E2E5',
      
      // Input and field colors
      inputBackground: isDark ? '#2A2A2A' : '#F3F3F5',
      inputBackgroundFocused: isDark ? '#333333' : '#E8E8EB',
      placeholder: isDark ? 'rgba(255, 255, 255, 0.4)' : '#A09AA8',
      
      // Status bar
      statusBarStyle: isDark ? 'light' : 'dark',
      
      // Card and container colors
      cardBackground: isDark ? '#1E1E1E' : '#FFFFFF',
      cardBorder: isDark ? '#2A2A2A' : '#F0F0F2',
      
      // Button colors
      buttonSecondary: isDark ? '#2A2A2A' : '#ECE8FF',
      buttonSecondaryText: isDark ? '#FFFFFF' : '#6855FF',
      
      // Special UI elements
      progressRing: isDark ? '#444444' : '#F4F4F4',
      progressRingSecondary: isDark ? '#3A3A3A' : '#EBEBEB',
      progressRingTertiary: isDark ? '#4A4A4A' : '#EDEAFF',
      
      // Shadow colors (for elevation)
      shadow: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(104, 85, 255, 0.3)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};