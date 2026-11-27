/**
 * Liquid Glass Hooks
 * Custom hooks for glass components and theming
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import {
  useTheme,
  useColors,
  useResolvedColorScheme,
  useIsReducedTransparency,
  useAnimatedColors,
  themeTokens,
  type GlassElevation,
  type BlurRadius,
  type CornerRadius,
  type Spacing,
  type ShadowLevel,
  type Colors,
  type ThemeTokens,
} from './themeProvider';

export interface GlassStyleOptions {
  elevation?: GlassElevation;
  blurRadius?: BlurRadius | number;
  cornerRadius?: CornerRadius | number;
  tintColor?: string;
  opacity?: number;
  interactive?: boolean;
  shadowLevel?: ShadowLevel;
  borderWidth?: number;
  borderColor?: string;
}

export interface GlassShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const useGlassStyle = (options: GlassStyleOptions = {}): ViewStyle => {
  const { colors, tokens, isReducedTransparency } = useTheme();
  const resolvedColorScheme = useResolvedColorScheme();

  const {
    elevation = 'surface',
    blurRadius = 'regular',
    cornerRadius = 'md',
    tintColor,
    opacity,
    shadowLevel,
    borderWidth = StyleSheet.hairlineWidth,
    borderColor,
  } = options;

  const elevationConfig = tokens.getGlassElevation(elevation);
  const blurValue = typeof blurRadius === 'string' ? tokens.getBlurRadius(blurRadius) : blurRadius;
  const cornerValue = typeof cornerRadius === 'string' ? tokens.getCornerRadius(cornerRadius) : cornerRadius;
  const shadow = shadowLevel ? tokens.getShadow(shadowLevel) : tokens.getShadow(elevationConfig.shadowLevel);

  const effectiveTintColor = useMemo(() => {
    if (tintColor) return tintColor;
    return resolvedColorScheme === 'dark'
      ? elevationConfig.tintColor.replace('255, 255, 255', '0, 0, 0')
      : elevationConfig.tintColor;
  }, [tintColor, resolvedColorScheme, elevationConfig.tintColor]);

  const effectiveOpacity = useMemo(() => {
    if (isReducedTransparency) return 1;
    return opacity ?? elevationConfig.opacity;
  }, [isReducedTransparency, opacity, elevationConfig.opacity]);

  const effectiveBorderColor = useMemo(() => {
    if (borderColor) return borderColor;
    return resolvedColorScheme === 'dark' ? colors.border : colors.border;
  }, [borderColor, resolvedColorScheme, colors.border]);

  return useMemo<ViewStyle>(() => ({
    borderRadius: cornerValue,
    borderWidth,
    borderColor: effectiveBorderColor,
    backgroundColor: effectiveTintColor,
    opacity: effectiveOpacity,
    ...shadow,
    // Native blur will be applied via GlassView component
    // This style is for fallback/web
    backdropFilter: Platform.OS === 'web' ? `blur(${blurValue}px)` : undefined,
  } as ViewStyle), [
    cornerValue,
    borderWidth,
    effectiveBorderColor,
    effectiveTintColor,
    effectiveOpacity,
    shadow,
    blurValue,
  ]);
};

export const useAnimatedGlassStyle = (options: GlassStyleOptions = {}) => {
  const { colors, isReducedTransparency } = useTheme();
  const resolvedColorScheme = useResolvedColorScheme();
  const animatedColors = useAnimatedColors();

  const {
    elevation = 'surface',
    blurRadius = 'regular',
    cornerRadius = 'md',
    tintColor,
    opacity,
    shadowLevel,
    borderWidth = StyleSheet.hairlineWidth,
  } = options;

  const elevationConfig = themeTokens.getGlassElevation(elevation);
  const blurValue = typeof blurRadius === 'string' ? themeTokens.getBlurRadius(blurRadius) : blurRadius;
  const cornerValue = typeof cornerRadius === 'string' ? themeTokens.getCornerRadius(cornerRadius) : cornerRadius;
  const shadow = shadowLevel ? themeTokens.getShadow(shadowLevel) : themeTokens.getShadow(elevationConfig.shadowLevel);

  const animatedStyle = useAnimatedStyle(() => {
    const scheme = resolvedColorScheme;
    const currentColors = animatedColors.value;

    const effectiveTintColor = tintColor
      ? tintColor
      : scheme === 'dark'
        ? elevationConfig.tintColor.replace('255, 255, 255', '0, 0, 0')
        : elevationConfig.tintColor;

    const effectiveOpacity = isReducedTransparency ? 1 : (opacity ?? elevationConfig.opacity);

    const effectiveBorderColor = scheme === 'dark' ? currentColors.border : currentColors.border;

    return {
      borderRadius: cornerValue,
      borderWidth,
      borderColor: effectiveBorderColor,
      backgroundColor: effectiveTintColor,
      opacity: effectiveOpacity,
      ...shadow,
    };
  }, [resolvedColorScheme, isReducedTransparency, tintColor, opacity, elevation, blurRadius, cornerRadius, shadowLevel, borderWidth]);

  return animatedStyle;
};

export const useGlassTextStyle = (
  variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'error' | 'success' | 'warning' = 'primary',
  weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
  size: keyof typeof themeTokens.typography.fontSize = 'md'
): TextStyle => {
  const { colors } = useTheme();

  const colorMap = {
    primary: colors.onSurface,
    secondary: colors.onSurfaceVariant,
    tertiary: colors.onSurfaceVariant,
    inverse: colors.onPrimary,
    accent: colors.accent,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  };

  return useMemo<TextStyle>(() => ({
    color: colorMap[variant],
    fontSize: themeTokens.typography.fontSize[size],
    lineHeight: themeTokens.typography.lineHeight[size],
    fontWeight: themeTokens.typography.fontWeight[weight],
    fontFamily: themeTokens.typography.fontFamily[weight === 'bold' ? 'bold' : weight === 'semibold' ? 'semibold' : weight === 'medium' ? 'medium' : 'regular'],
  }), [colors, variant, weight, size]);
};

export const useGlassSpacing = (value: Spacing): number => {
  return themeTokens.getSpacing(value);
};

export const useGlassCornerRadius = (value: CornerRadius): number => {
  return themeTokens.getCornerRadius(value);
};

export const useGlassBlurRadius = (value: BlurRadius): number => {
  return themeTokens.getBlurRadius(value);
};

export const useGlassShadow = (level: ShadowLevel): GlassShadowStyle => {
  return themeTokens.getShadow(level);
};

export const useReducedMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const enabled = await require('react-native').AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(enabled);
    };

    checkReduceMotion();

    const listener = require('react-native').AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => setReduceMotion(enabled),
    );

    return () => listener.remove();
  }, []);

  return reduceMotion;
};

export const useGlassAnimation = () => {
  const reduceMotion = useReducedMotion();
  const { tokens } = useTheme();

  const timingConfig = reduceMotion
    ? { duration: 0 }
    : {
        duration: tokens.animation.duration.normal,
        easing: tokens.animation.easing.standard,
      };

  const springConfig = reduceMotion
    ? undefined
    : {
        damping: tokens.animation.spring.damping,
        stiffness: tokens.animation.spring.stiffness,
        mass: tokens.animation.spring.mass,
      };

  return {
    timing: withTiming,
    spring: withSpring,
    timingConfig,
    springConfig,
    reduceMotion,
  };
};

export const useGlassPressAnimation = (scale: number = 0.96) => {
  const { spring, springConfig, reduceMotion } = useGlassAnimation();
  const animatedScale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (!reduceMotion) {
      animatedScale.value = withSpring(scale, springConfig);
    }
  }, [scale, springConfig, reduceMotion]);

  const onPressOut = useCallback(() => {
    if (!reduceMotion) {
      animatedScale.value = withSpring(1, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
  }));

  return {
    onPressIn,
    onPressOut,
    animatedStyle,
  };
};

export const useGlassHoverAnimation = (translateY: number = -2) => {
  const { spring, springConfig, reduceMotion } = useGlassAnimation();
  const animatedTranslateY = useSharedValue(0);

  const onHoverIn = useCallback(() => {
    if (!reduceMotion) {
      animatedTranslateY.value = withSpring(translateY, springConfig);
    }
  }, [translateY, springConfig, reduceMotion]);

  const onHoverOut = useCallback(() => {
    if (!reduceMotion) {
      animatedTranslateY.value = withSpring(0, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedTranslateY.value }],
  }));

  return {
    onHoverIn,
    onHoverOut,
    animatedStyle,
  };
};

export const useGlassFocusRing = (isFocused: boolean, color?: string) => {
  const { colors, tokens } = useTheme();
  const ringColor = color ?? colors.primary;
  const animatedWidth = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      animatedWidth.value = withTiming(3, { duration: 150 });
      animatedOpacity.value = withTiming(1, { duration: 150 });
    } else {
      animatedWidth.value = withTiming(0, { duration: 150 });
      animatedOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: animatedWidth.value,
    borderColor: ringColor,
    borderStyle: 'solid',
  }));

  return animatedStyle;
};

export const useGlassTransition = <T,>(
  value: T,
  dependencies: React.DependencyList,
  config?: { duration?: number; easing?: (t: number) => number }
) => {
  const { tokens, animatedColors } = useTheme();
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: config?.duration ?? tokens.animation.duration.normal,
      easing: config?.easing ?? tokens.animation.easing.standard,
    });
  }, dependencies);

  return animatedValue;
};

export const createGlassStyles = (
  colors: Colors,
  tokens: ThemeTokens,
  options: GlassStyleOptions = {}
) => {
  const {
    elevation = 'surface',
    blurRadius = 'regular',
    cornerRadius = 'md',
    tintColor,
    opacity,
    shadowLevel,
    borderWidth = StyleSheet.hairlineWidth,
    borderColor,
  } = options;

  const elevationConfig = tokens.getGlassElevation(elevation);
  const blurValue = typeof blurRadius === 'string' ? tokens.getBlurRadius(blurRadius) : blurRadius;
  const cornerValue = typeof cornerRadius === 'string' ? tokens.getCornerRadius(cornerRadius) : cornerRadius;
  const shadow = shadowLevel ? tokens.getShadow(shadowLevel) : tokens.getShadow(elevationConfig.shadowLevel);

  const effectiveTintColor = tintColor ?? elevationConfig.tintColor;
  const effectiveOpacity = opacity ?? elevationConfig.opacity;
  const effectiveBorderColor = borderColor ?? colors.border;

  return StyleSheet.create({
    container: {
      borderRadius: cornerValue,
      borderWidth,
      borderColor: effectiveBorderColor,
      backgroundColor: effectiveTintColor,
      opacity: effectiveOpacity,
      ...shadow,
    } as ViewStyle,
    content: {
      borderRadius: cornerValue,
    } as ViewStyle,
  });
};

export const useGlassLayout = () => {
  const { tokens } = useTheme();

  return useMemo(() => ({
    spacing: (value: Spacing) => tokens.getSpacing(value),
    cornerRadius: (value: CornerRadius) => tokens.getCornerRadius(value),
    blurRadius: (value: BlurRadius) => tokens.getBlurRadius(value),
    shadow: (level: ShadowLevel) => tokens.getShadow(level),
    elevation: (value: GlassElevation) => tokens.getGlassElevation(value),
    fontSize: (size: keyof typeof tokens.typography.fontSize) => tokens.typography.fontSize[size],
    lineHeight: (size: keyof typeof tokens.typography.lineHeight) => tokens.typography.lineHeight[size],
    fontWeight: (weight: keyof typeof tokens.typography.fontWeight) => tokens.typography.fontWeight[weight],
  }), [tokens]);
};

export const useGlassSheetAnimation = () => {
  const { spring, springConfig, reduceMotion } = useGlassAnimation();
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const open = useCallback((height: number) => {
    if (reduceMotion) {
      animatedHeight.value = height;
      animatedOpacity.value = 1;
    } else {
      animatedHeight.value = withSpring(height, springConfig);
      animatedOpacity.value = withSpring(1, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const close = useCallback(() => {
    if (reduceMotion) {
      animatedHeight.value = 0;
      animatedOpacity.value = 0;
    } else {
      animatedHeight.value = withSpring(0, springConfig);
      animatedOpacity.value = withSpring(0, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: animatedOpacity.value,
  }));

  return { open, close, animatedStyle, animatedHeight, animatedOpacity };
};

export const useGlassModalAnimation = () => {
  const { spring, springConfig, reduceMotion } = useGlassAnimation();
  const animatedScale = useSharedValue(0.9);
  const animatedOpacity = useSharedValue(0);

  const open = useCallback(() => {
    if (reduceMotion) {
      animatedScale.value = 1;
      animatedOpacity.value = 1;
    } else {
      animatedScale.value = withSpring(1, springConfig);
      animatedOpacity.value = withSpring(1, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const close = useCallback(() => {
    if (reduceMotion) {
      animatedScale.value = 0.9;
      animatedOpacity.value = 0;
    } else {
      animatedScale.value = withSpring(0.9, springConfig);
      animatedOpacity.value = withSpring(0, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
    opacity: animatedOpacity.value,
  }));

  return { open, close, animatedStyle };
};

export const useGlassToastAnimation = () => {
  const { spring, springConfig, reduceMotion } = useGlassAnimation();
  const animatedTranslateY = useSharedValue(100);
  const animatedOpacity = useSharedValue(0);

  const show = useCallback(() => {
    if (reduceMotion) {
      animatedTranslateY.value = 0;
      animatedOpacity.value = 1;
    } else {
      animatedTranslateY.value = withSpring(0, springConfig);
      animatedOpacity.value = withSpring(1, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const hide = useCallback(() => {
    if (reduceMotion) {
      animatedTranslateY.value = 100;
      animatedOpacity.value = 0;
    } else {
      animatedTranslateY.value = withSpring(100, springConfig);
      animatedOpacity.value = withSpring(0, springConfig);
    }
  }, [springConfig, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedTranslateY.value }],
    opacity: animatedOpacity.value,
  }));

  return { show, hide, animatedStyle };
};

export type {
  GlassStyleOptions,
  GlassShadowStyle,
};