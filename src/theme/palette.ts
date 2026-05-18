/**
 * Design tokens — light / dark palettes for QA shell screens.
 * Single source of truth for colors referenced across membership-shell UI.
 */

export type ThemePalette = {
  background: string;
  backgroundSubtle: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  mono: string;
  chipBg: string;
  chipBorder: string;
  dangerBg: string;
  dangerText: string;
};

export const lightPalette: ThemePalette = {
  background: '#EEF1F6',
  backgroundSubtle: '#E4E8F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFD',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.12)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  accent: '#0066FF',
  accentSoft: 'rgba(0, 102, 255, 0.12)',
  onAccent: '#FFFFFF',
  mono: '#0F172A',
  chipBg: 'rgba(0, 102, 255, 0.08)',
  chipBorder: 'rgba(0, 102, 255, 0.22)',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',
};

export const darkPalette: ThemePalette = {
  background: '#0C0C0E',
  backgroundSubtle: '#141418',
  surface: '#1C1C22',
  surfaceElevated: '#24242C',
  border: 'rgba(248, 250, 252, 0.08)',
  borderStrong: 'rgba(248, 250, 252, 0.14)',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  accent: '#3B82F6',
  accentSoft: 'rgba(59, 130, 246, 0.18)',
  onAccent: '#FFFFFF',
  mono: '#E2E8F0',
  chipBg: 'rgba(59, 130, 246, 0.14)',
  chipBorder: 'rgba(59, 130, 246, 0.35)',
  dangerBg: '#2A1518',
  dangerText: '#FCA5A5',
};
