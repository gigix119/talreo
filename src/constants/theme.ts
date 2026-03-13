/**
 * Theme — design tokens for premium fintech UI.
 * Light theme (default). Dark theme available via getTheme.
 */
export const lightColors = {
  primary: '#0A84FF',
  primaryHover: '#0071E3',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  backgroundElevated: '#E8E8ED',
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
  },
  income: '#34C759',
  expense: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  border: '#E5E5EA',
} as const;

export const darkColors = {
  primary: '#0A84FF',
  primaryHover: '#409CFF',
  background: '#000000',
  surface: '#1C1C1E',
  backgroundElevated: '#2C2C2E',
  text: {
    primary: '#FFFFFF',
    secondary: '#EBEBF5',
    tertiary: '#8E8E93',
  },
  income: '#30D158',
  expense: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  border: '#38383A',
} as const;

export const theme = {
  colors: lightColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 4,
    },
  },
} as const;
