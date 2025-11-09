import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { lightTheme } from './index';

// Create a minimal theme with only the required properties
const baseTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text,
    border: lightTheme.colors.border,
    notification: lightTheme.colors.notification,
  },
};

// Create a new object without the problematic fonts property
const { fonts, ...safeTheme } = baseTheme;

export const navigationTheme = {
  ...safeTheme,
  dark: false,
} as const;

export type AppNavigationTheme = typeof navigationTheme;
