/**
 * Liquid Glass Theme Provider
 * Handles light/dark/system theme with animated transitions
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { Appearance, ColorSchemeName, Platform, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { themeTokens, type Colors, type ColorScheme, type ThemeTokens } from './tokens';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  resolvedColorScheme: ColorScheme;
  colors: Colors;
  tokens: ThemeTokens;
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleColorScheme: () => void;
  isReducedTransparency: boolean;
  animatedColors: Animated.SharedValue<Colors>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultColorScheme?: ColorSchemeName;
  enableReducedTransparency?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultColorScheme = 'system',
  enableReducedTransparency = true,
}) => {
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeName>(defaultColorScheme);
  const [isReducedTransparency, setIsReducedTransparency] = useState(false);

  const resolvedColorScheme = useMemo((): ColorScheme => {
    if (colorScheme === 'system') {
      return (Appearance.getColorScheme() ?? 'light') as ColorScheme;
    }
    return colorScheme as ColorScheme;
  }, [colorScheme]);

  const colors = useMemo((): Colors => {
    return themeTokens.getColors(resolvedColorScheme);
  }, [resolvedColorScheme]);

  const animatedColors = useSharedValue<Colors>(colors);

  useEffect(() => {
    animatedColors.value = withTiming(colors, {
      duration: themeTokens.animation.duration.normal,
      easing: themeTokens.animation.easing.standard,
    });
  }, [colors]);

  useEffect(() => {
    if (!enableReducedTransparency) return;

    const checkReducedTransparency = async () => {
      const enabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      setIsReducedTransparency(enabled);
    };

    checkReducedTransparency();

    const listener = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (enabled: boolean) => setIsReducedTransparency(enabled),
    );

    return () => listener.remove();
  }, [enableReducedTransparency]);

  const setColorScheme = useCallback((scheme: ColorSchemeName) => {
    setColorSchemeState(scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      resolvedColorScheme,
      colors,
      tokens: themeTokens,
      setColorScheme,
      toggleColorScheme,
      isReducedTransparency,
      animatedColors,
    }),
    [colorScheme, resolvedColorScheme, colors, setColorScheme, toggleColorScheme, isReducedTransparency, animatedColors],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useColors = (): Colors => {
  const { colors } = useTheme();
  return colors;
};

export const useResolvedColorScheme = (): ColorScheme => {
  const { resolvedColorScheme } = useTheme();
  return resolvedColorScheme;
};

export const useIsReducedTransparency = (): boolean => {
  const { isReducedTransparency } = useTheme();
  return isReducedTransparency;
};

export const useAnimatedColors = () => {
  const { animatedColors } = useTheme();
  return animatedColors;
};

export const withThemeTransition = <T,>(
  value: T,
  config?: { duration?: number; easing?: (t: number) => number }
) => {
  return withTiming(value, {
    duration: config?.duration ?? themeTokens.animation.duration.normal,
    easing: config?.easing ?? themeTokens.animation.easing.standard,
  });
};

export const withSpringTransition = <T,>(
  value: T,
  config?: { damping?: number; stiffness?: number; mass?: number }
) => {
  return withSpring(value, {
    damping: config?.damping ?? themeTokens.animation.spring.damping,
    stiffness: config?.stiffness ?? themeTokens.animation.spring.stiffness,
    mass: config?.mass ?? themeTokens.animation.spring.mass,
  });
};

interface ColorInterpolationProps {
  light: string;
  dark: string;
}

export const useColorInterpolation = ({
  light,
  dark,
}: ColorInterpolationProps): Animated.AnimatedStyle => {
  const { animatedColors, resolvedColorScheme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const progress = resolvedColorScheme === 'dark' ? 1 : 0;
    const color = interpolateColor(progress, [0, 1], [light, dark]);
    return { backgroundColor: color };
  }, [resolvedColorScheme]);

  return animatedStyle;
};