/**
 * Liquid Glass Design Tokens
 * iOS 26 glassmorphism specification for React Native + Expo
 */

export const glassElevations = {
  surface: {
    blurRadius: 40,
    opacity: 0.72,
    tintColor: 'rgba(255, 255, 255, 0.18)',
    shadowLevel: 1,
  },
  elevated: {
    blurRadius: 60,
    opacity: 0.8,
    tintColor: 'rgba(255, 255, 255, 0.24)',
    shadowLevel: 2,
  },
  overlay: {
    blurRadius: 80,
    opacity: 0.88,
    tintColor: 'rgba(255, 255, 255, 0.32)',
    shadowLevel: 3,
  },
} as const;

export type GlassElevation = keyof typeof glassElevations;

export const blurRadii = {
  ultraThin: 10,
  thin: 20,
  regular: 40,
  thick: 60,
  chrome: 80,
} as const;

export type BlurRadius = keyof typeof blurRadii;

export const cornerRadii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type CornerRadius = keyof typeof cornerRadii;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export type Spacing = keyof typeof spacing;

export const lightColors = {
  // Background layers
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceOverlay: '#FFFFFF',

  // Primary brand
  primary: '#0066CC',
  primaryVariant: '#0052A3',
  onPrimary: '#FFFFFF',

  // Secondary
  secondary: '#5E5CE6',
  secondaryVariant: '#4A48C7',
  onSecondary: '#FFFFFF',

  // Accent
  accent: '#FF3B30',
  accentVariant: '#D70015',
  onAccent: '#FFFFFF',

  // Semantic
  error: '#FF3B30',
  onError: '#FFFFFF',
  success: '#34C759',
  onSuccess: '#FFFFFF',
  warning: '#FF9F0A',
  onWarning: '#000000',

  // Text
  onSurface: '#1C1C1E',
  onSurfaceVariant: '#8E8E93',
  onBackground: '#1C1C1E',

  // Borders & Dividers
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.16)',
  divider: 'rgba(0, 0, 0, 0.06)',

  // Glass specific
  glassTintLight: 'rgba(255, 255, 255, 0.72)',
  glassTintDark: 'rgba(0, 0, 0, 0.72)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
  glassShadow: 'rgba(0, 0, 0, 0.08)',
} as const;

export const darkColors = {
  // Background layers
  background: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceOverlay: '#3A3A3C',

  // Primary brand
  primary: '#0A84FF',
  primaryVariant: '#0066CC',
  onPrimary: '#000000',

  // Secondary
  secondary: '#5E5CE6',
  secondaryVariant: '#4A48C7',
  onSecondary: '#FFFFFF',

  // Accent
  accent: '#FF453A',
  accentVariant: '#FF3B30',
  onAccent: '#000000',

  // Semantic
  error: '#FF453A',
  onError: '#000000',
  success: '#30D158',
  onSuccess: '#000000',
  warning: '#FF9F0A',
  onWarning: '#000000',

  // Text
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#8E8E93',
  onBackground: '#FFFFFF',

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.24)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Glass specific
  glassTintLight: 'rgba(255, 255, 255, 0.12)',
  glassTintDark: 'rgba(0, 0, 0, 0.72)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
  glassShadow: 'rgba(0, 0, 0, 0.32)',
} as const;

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors;

export const shadows = {
  // iOS 26 spec shadows
  level0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 16,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.16,
    shadowRadius: 56,
    elevation: 24,
  },
} as const;

export type ShadowLevel = keyof typeof shadows;

export const typography = {
  // SF Pro / System font scale
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    rounded: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 32,
    '3xl': 36,
    '4xl': 44,
    '5xl': 56,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    spring: 'spring',
  },
  spring: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const;

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export const glassShaderUniforms = {
  refractionIndex: 1.33,
  fresnelPower: 2.5,
  specularIntensity: 0.8,
  specularSharpness: 32,
  chromaticAberration: 0.003,
  noiseScale: 0.5,
  noiseSpeed: 0.15,
} as const;

export const themeTokens = {
  glassElevations,
  blurRadii,
  cornerRadii,
  spacing,
  lightColors,
  darkColors,
  shadows,
  typography,
  animation,
  zIndex,
  breakpoints,
  glassShaderUniforms,
} as const;

export type ThemeTokens = typeof themeTokens;

export const getColors = (scheme: ColorScheme): Colors => {
  return scheme === 'dark' ? darkColors : lightColors;
};

export const getGlassElevation = (elevation: GlassElevation) => {
  return glassElevations[elevation];
};

export const getShadow = (level: ShadowLevel) => {
  return shadows[level];
};

export const getSpacing = (value: Spacing) => {
  return spacing[value];
};

export const getCornerRadius = (value: CornerRadius) => {
  return cornerRadii[value];
};

export const getBlurRadius = (value: BlurRadius) => {
  return blurRadii[value];
};