import {Platform} from 'react-native';

/** Layout rhythm — use multiples for consistent spacing */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

export const screenPaddingX = spacing.lg;

/** Card shadow — subtle elevation */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 3,
  },
  default: {},
});
