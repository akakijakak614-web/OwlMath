// Purple-themed color palette inspired by Duolingo's design system
export const COLORS = {
  // Primary purples
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#A78BFA',
  primaryLighter: '#C4B5FD',
  primaryLightest: '#EDE9FE',
  primaryBg: '#F5F3FF',

  // Accent colors
  accent: '#F59E0B',       // Gold for streaks/rewards
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Feedback colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F7FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E1F0',
  borderLight: '#F0EDF7',

  // Text
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // Overlay
  overlay: 'rgba(30, 27, 75, 0.5)',

  // Progress
  progressBg: '#E5E1F0',
  progressFill: '#7C3AED',

  // Hearts
  heart: '#EF4444',
  heartEmpty: '#D1D5DB',

  // XP
  xp: '#F59E0B',

  // Level colors
  levelElementary: '#A78BFA',
  levelMiddle: '#7C3AED',
  levelHigh: '#5B21B6',
};

export const FONTS = {
  bold: {
    fontWeight: '800',
  },
  semiBold: {
    fontWeight: '700',
  },
  medium: {
    fontWeight: '600',
  },
  regular: {
    fontWeight: '400',
  },
  light: {
    fontWeight: '300',
  },
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Font sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontBase: 16,
  fontLg: 18,
  fontXl: 20,
  font2xl: 24,
  font3xl: 30,
  font4xl: 36,
  font5xl: 48,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
