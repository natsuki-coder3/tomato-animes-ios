/**
 * GlassView - Base glass component using expo-blur with native UIVisualEffectView fallback
 */

import React, { forwardRef, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Platform,
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { AnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { useGlassStyle, useAnimatedGlassStyle, type GlassStyleOptions } from '../../theme/hooks';
import { useTheme } from '../../theme/themeProvider';

interface GlassViewProps extends GlassStyleOptions {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  onLayout?: (event: any) => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
}

const NativeGlassView = Platform.OS === 'ios'
  ? requireNativeComponent('GlassEffectView', {
      onlyEvents: ['onTouchStart', 'onTouchEnd', 'onTouchCancel'],
    })
  : null;

const GlassViewBase = forwardRef<View, GlassViewProps>(
  (
    {
      children,
      style,
      testID,
      accessibilityRole,
      accessibilityLabel,
      onLayout,
      pointerEvents = 'auto',
      elevation = 'surface',
      blurRadius = 'regular',
      cornerRadius = 'md',
      tintColor,
      opacity,
      interactive = true,
      shadowLevel,
      borderWidth,
      borderColor,
      ...rest
    },
    ref
  ) => {
    const { isReducedTransparency, colors } = useTheme();

    const baseStyle = useGlassStyle({
      elevation,
      blurRadius,
      cornerRadius,
      tintColor,
      opacity,
      shadowLevel,
      borderWidth,
      borderColor,
    });

    const animatedStyle = useAnimatedGlassStyle({
      elevation,
      blurRadius,
      cornerRadius,
      tintColor,
      opacity,
      shadowLevel,
      borderWidth,
    });

    const combinedStyle = useMemo(() => [
      baseStyle,
      animatedStyle,
      style,
    ], [baseStyle, animatedStyle, style]);

    const blurIntensity = useMemo(() => {
      const radii = {
        ultraThin: 10,
        thin: 20,
        regular: 40,
        thick: 60,
        chrome: 80,
      };
      return typeof blurRadius === 'string' ? radii[blurRadius] : blurRadius;
    }, [blurRadius]);

    const cornerValue = useMemo(() => {
      const radii = {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
      };
      return typeof cornerRadius === 'string' ? radii[cornerRadius] : cornerRadius;
    }, [cornerRadius]);

    const effectiveTintColor = useMemo(() => {
      if (tintColor) return tintColor;
      const elevationConfig = {
        surface: 'rgba(255, 255, 255, 0.18)',
        elevated: 'rgba(255, 255, 255, 0.24)',
        overlay: 'rgba(255, 255, 255, 0.32)',
      };
      return elevationConfig[elevation];
    }, [tintColor, elevation]);

    if (Platform.OS === 'ios' && NativeGlassView && !isReducedTransparency) {
      return (
        <NativeGlassView
          ref={ref}
          style={combinedStyle}
          testID={testID}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          onLayout={onLayout}
          pointerEvents={pointerEvents}
          blurRadius={blurIntensity}
          tintColor={effectiveTintColor}
          cornerRadius={cornerValue}
          interactive={interactive}
          {...rest}
        >
          {children}
        </NativeGlassView>
      );
    }

    return (
      <BlurView
        ref={ref as any}
        intensity={blurIntensity}
        style={combinedStyle}
        testID={testID}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        onLayout={onLayout}
        pointerEvents={pointerEvents}
        {...rest}
      >
        <View style={[styles.content, { borderRadius: cornerValue }]}>
          {children}
        </View>
      </BlurView>
    );
  }
);

GlassViewBase.displayName = 'GlassView';

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

export const GlassView = GlassViewBase;

export interface GlassSurfaceProps extends GlassViewProps {
  variant?: 'surface' | 'elevated' | 'overlay';
}

export const GlassSurface = forwardRef<View, GlassSurfaceProps>(
  ({ variant = 'surface', children, style, ...props }, ref) => {
    const elevationMap = {
      surface: 'surface' as const,
      elevated: 'elevated' as const,
      overlay: 'overlay' as const,
    };

    return (
      <GlassView
        ref={ref}
        elevation={elevationMap[variant]}
        style={style}
        {...props}
      >
        {children}
      </GlassView>
    );
  }
);

GlassSurface.displayName = 'GlassSurface';