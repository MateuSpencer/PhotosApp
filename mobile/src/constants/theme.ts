/**
 * App Theme Configuration
 * Consistent theming for the Narratives mobile app
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Brand colors
const brandColors = {
  primary: '#6366f1',       // Indigo
  primaryDark: '#4f46e5',
  secondary: '#22d3ee',     // Cyan
  accent: '#f472b6',        // Pink
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#0f172a',    // Dark slate
  surface: '#1e293b',
  surfaceLight: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#475569',
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.primary,
    primaryContainer: brandColors.primaryDark,
    secondary: brandColors.secondary,
    secondaryContainer: brandColors.secondary,
    tertiary: brandColors.accent,
    background: brandColors.background,
    surface: brandColors.surface,
    surfaceVariant: brandColors.surfaceLight,
    error: brandColors.error,
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: brandColors.text,
    onSurface: brandColors.text,
    outline: brandColors.border,
  },
  custom: brandColors,
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: '#e0e7ff',
    secondary: brandColors.secondary,
    secondaryContainer: '#cffafe',
    tertiary: brandColors.accent,
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    error: brandColors.error,
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#0f172a',
    onSurface: '#0f172a',
    outline: '#cbd5e1',
  },
  custom: {
    ...brandColors,
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceLight: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#cbd5e1',
  },
};

export type AppTheme = typeof darkTheme;
export default darkTheme;
