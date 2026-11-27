/**
 * Tomato Animes - Theme Hooks
 * Extended theme hooks with app-specific functionality
 */

import { useTheme, useColors, useResolvedColorScheme, useIsReducedTransparency, useIsReducedMotion } from '@theme/themeProvider';
import { useSettingsStore } from '@store/settingsStore';
import { useCallback, useEffect } from 'react';

export const useAppTheme = () => {
  const theme = useTheme();
  const settings = useSettingsStore();

  const toggleTheme = useCallback(() => {
    const { colorScheme, setColorScheme } = theme;
    const newScheme = colorScheme === 'light' ? 'dark' : colorScheme === 'dark' ? 'system' : 'light';
    setColorScheme(newScheme as any);
    settings.updateSetting('theme', newScheme);
  }, [theme, settings]);

  const setTheme = useCallback((scheme: 'light' | 'dark' | 'system') => {
    theme.setColorScheme(scheme);
    settings.updateSetting('theme', scheme);
  }, [theme, settings]);

  return {
    ...theme,
    toggleTheme,
    setTheme,
    theme: settings.theme,
  };
};

export const useAppColors = () => {
  const colors = useColors();
  const settings = useSettingsStore();

  // Apply accent color if needed
  const accentColors: Record<string, { light: string; dark: string }> = {
    blue: { light: '#0066CC', dark: '#0A84FF' },
    purple: { light: '#5E5CE6', dark: '#BF5AF2' },
    red: { light: '#FF3B30', dark: '#FF453A' },
    green: { light: '#34C759', dark: '#30D158' },
    orange: { light: '#FF9F0A', dark: '#FF9F0A' },
    pink: { light: '#FF2D92', dark: '#FF375F' },
  };

  const accent = accentColors[settings.accentColor] || accentColors.blue;
  const resolvedScheme = useResolvedColorScheme();

  return {
    ...colors,
    primary: resolvedScheme === 'dark' ? accent.dark : accent.light,
    primaryVariant: resolvedScheme === 'dark' ? accent.dark : accent.light,
  };
};

export const useReducedTransparency = () => {
  const reduced = useIsReducedTransparency();
  const settings = useSettingsStore();
  return reduced || settings.reduceTransparency;
};

export const useReducedMotion = () => {
  const reduced = useIsReducedMotion();
  const settings = useSettingsStore();
  return reduced || settings.reduceMotion;
};

export const useTextSize = () => {
  const settings = useSettingsStore();
  const sizeMap = {
    small: 0.85,
    medium: 1,
    large: 1.15,
    'extra-large': 1.3,
  };
  return sizeMap[settings.textSize as keyof typeof sizeMap] || 1;
};

export const useAccentColor = () => {
  const settings = useSettingsStore();
  return settings.accentColor;
};

export const useGlassElevation = (elevation: 'surface' | 'elevated' | 'overlay' = 'surface') => {
  const { colors, tokens } = useTheme();
  const reducedTransparency = useReducedTransparency();

  const elevationConfig = tokens.getGlassElevation(elevation);

  return {
    ...elevationConfig,
    opacity: reducedTransparency ? 1 : elevationConfig.opacity,
  };
};

export const useDynamicSpacing = () => {
  const { tokens } = useTheme();
  const textSize = useTextSize();

  return {
    xs: tokens.spacing[1] * textSize,
    sm: tokens.spacing[2] * textSize,
    md: tokens.spacing[3] * textSize,
    lg: tokens.spacing[4] * textSize,
    xl: tokens.spacing[5] * textSize,
    '2xl': tokens.spacing[6] * textSize,
  };
};

export const useDynamicTypography = () => {
  const { tokens } = useTheme();
  const textSize = useTextSize();

  const scaledSize = (size: keyof typeof tokens.typography.fontSize) =>
    tokens.typography.fontSize[size] * textSize;

  const scaledLineHeight = (size: keyof typeof tokens.typography.lineHeight) =>
    tokens.typography.lineHeight[size] * textSize;

  return {
    fontSize: scaledSize,
    lineHeight: scaledLineHeight,
    fontWeight: tokens.typography.fontWeight,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  };
};

// Export base hooks for convenience
export { useTheme, useColors, useResolvedColorScheme, useIsReducedTransparency, useIsReducedMotion } from '@theme/themeProvider';