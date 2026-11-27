/**
 * GlassProgress, GlassSlider, GlassSwitch - Input/Progress components
 */

import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Pressable,
  PanResponder,
  PanResponderGestureState,
  Platform,
  Animated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

// ==================== GlassProgress ====================

export type ProgressVariant = 'linear' | 'circular' | 'ring';
export type ProgressSize = 'sm' | 'md' | 'lg';

interface GlassProgressProps {
  value: number; // 0-1
  variant?: ProgressVariant;
  size?: ProgressSize;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const sizeConfigProgress = {
  sm: { height: 4, borderRadius: 2, trackWidth: 4, ringWidth: 3, fontSize: 10 },
  md: { height: 6, borderRadius: 3, trackWidth: 6, ringWidth: 4, fontSize: 12 },
  lg: { height: 8, borderRadius: 4, trackWidth: 8, ringWidth: 5, fontSize: 14 },
};

const GlassProgress = forwardRef<View, GlassProgressProps>(
  (
    {
      value,
      variant = 'linear',
      size = 'md',
      color,
      trackColor,
      showLabel = false,
      label,
      indeterminate = false,
      style,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const config = sizeConfigProgress[size];
    const progressColor = color ?? colors.primary;
    const progressTrackColor = trackColor ?? colors.border;

    const animatedValue = useSharedValue(0);
    const animatedIndeterminate = useSharedValue(0);

    React.useEffect(() => {
      if (indeterminate) {
        animatedIndeterminate.value = withTiming(1, {
          duration: 1500,
          easing: (t) => t,
        }, () => {
          animatedIndeterminate.value = 0;
        });
      } else {
        if (reduceMotion) {
          animatedValue.value = value;
        } else {
          animatedValue.value = withSpring(value, springConfig);
        }
      }
    }, [value, indeterminate]);

    const baseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: config.borderRadius,
      borderWidth: 0,
    });

    if (variant === 'linear') {
      const trackAnimatedStyle = useAnimatedStyle(() => ({
        width: `${interpolateColor(animatedValue.value, [0, 1], [0, 100])}%`,
        backgroundColor: progressColor,
      }));

      const containerStyle = useMemo(() => [
        styles.linearContainer,
        baseStyle,
        {
          height: config.height,
          backgroundColor: progressTrackColor,
        },
        style,
      ], [baseStyle, config, progressTrackColor, style]);

      const labelText = label ?? (showLabel ? `${Math.round(value * 100)}%` : '');

      return (
        <GlassView
          ref={ref}
          elevation="surface"
          style={containerStyle}
          testID={testID}
        >
          <Animated.View style={[styles.linearTrack, trackAnimatedStyle]} />
          {labelText && (
            <Text style={[
              styles.linearLabel,
              { fontSize: config.fontSize, color: colors.onSurfaceVariant },
            ]}>
              {labelText}
            </Text>
          )}
        </GlassView>
      );
    }

    if (variant === 'circular') {
      const circumference = 2 * Math.PI * 20; // radius 20
      const strokeDashoffset = circumference * (1 - value);

      const circleAnimatedStyle = useAnimatedStyle(() => ({
        strokeDashoffset: interpolateColor(animatedValue.value, [0, 1], [circumference, 0]),
      }));

      const containerStyle = useMemo(() => [
        styles.circularContainer,
        { width: 48, height: 48 },
        style,
      ], [style]);

      return (
        <View style={containerStyle} testID={testID}>
          <Animated.View style={styles.circularSvg}>
            <Animated.Svg width={48} height={48}>
              <Animated.Circle
                cx={24}
                cy={24}
                r={20}
                strokeWidth={config.trackWidth}
                stroke={progressTrackColor}
                fill="none"
              />
              <Animated.Circle
                cx={24}
                cy={24}
                r={20}
                strokeWidth={config.trackWidth}
                stroke={progressColor}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={[{ rotate: '-90deg' }, { translateX: 24 }, { translateY: 24 }]}
              />
            </Animated.Svg>
          </Animated.View>
          {labelText && (
            <Text style={[
              styles.circularLabel,
              { fontSize: config.fontSize, color: colors.onSurfaceVariant },
            ]}>
              {labelText}
            </Text>
          )}
        </View>
      );
    }

    // Ring variant
    const ringSize = size === 'sm' ? 32 : size === 'md' ? 48 : 64;
    const ringRadius = ringSize / 2 - config.ringWidth / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;

    const ringAnimatedStyle = useAnimatedStyle(() => ({
      strokeDashoffset: interpolateColor(animatedValue.value, [0, 1], [ringCircumference, 0]),
    }));

    const containerStyle = useMemo(() => [
      styles.ringContainer,
      { width: ringSize, height: ringSize },
      style,
    ], [ringSize, style]);

    const labelText = label ?? (showLabel ? `${Math.round(value * 100)}%` : '');

    return (
      <View style={containerStyle} testID={testID}>
        <Animated.View style={styles.ringSvg}>
          <Animated.Svg width={ringSize} height={ringSize}>
            <Animated.Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              strokeWidth={config.ringWidth}
              stroke={progressTrackColor}
              fill="none"
            />
            <Animated.Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              strokeWidth={config.ringWidth}
              stroke={progressColor}
              fill="none"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringCircumference * (1 - value)}
              strokeLinecap="round"
              transform={[{ rotate: '-90deg' }, { translateX: ringSize / 2 }, { translateY: ringSize / 2 }]}
            />
          </Animated.Svg>
        </Animated.View>
        {labelText && (
          <Text style={[
            styles.ringLabel,
            { fontSize: config.fontSize, color: colors.onSurfaceVariant, textAlign: 'center' },
          ]}>
            {labelText}
          </Text>
        )}
      </View>
    );
  }
);

GlassProgress.displayName = 'GlassProgress';

const Svg = require('react-native-svg').Svg;
const Circle = require('react-native-svg').Circle;

// ==================== GlassSlider ====================

interface GlassSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  color?: string;
  trackColor?: string;
  thumbColor?: string;
  showValue?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const GlassSlider = forwardRef<View, GlassSliderProps>(
  (
    {
      value,
      onValueChange,
      onSlidingComplete,
      min = 0,
      max = 1,
      step = 0.01,
      disabled = false,
      color,
      trackColor,
      thumbColor,
      showValue = false,
      style,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const sliderColor = color ?? colors.primary;
    const sliderTrackColor = trackColor ?? colors.border;
    const sliderThumbColor = thumbColor ?? colors.onSurface;

    const animatedValue = useSharedValue(value);
    const animatedPressed = useSharedValue(false);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startValue = animatedValue.value;
      },
      onActive: (event, ctx: any) => {
        const width = event.nativeEvent.layoutMeasurement.width;
        const ratio = Math.max(0, Math.min(1, event.x / width));
        const newValue = min + ratio * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        animatedValue.value = Math.max(min, Math.min(max, steppedValue));
      },
      onEnd: () => {
        runOnJS(onSlidingComplete)?.(animatedValue.value);
      },
    });

    React.useEffect(() => {
      if (reduceMotion) {
        animatedValue.value = value;
      } else {
        animatedValue.value = withSpring(value, springConfig);
      }
    }, [value]);

    const trackAnimatedStyle = useAnimatedStyle(() => ({
      width: `${interpolateColor(animatedValue.value, [min, max], [0, 100])}%`,
      backgroundColor: sliderColor,
    }));

    const thumbAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: interpolateColor(animatedValue.value, [min, max], [-12, -12]) },
        { scale: animatedPressed.value ? 1.3 : 1 },
      ],
    }));

    const containerStyle = useMemo(() => [
      styles.sliderContainer,
      { paddingHorizontal: 12 },
      style,
    ], [style]);

    const handlePressIn = () => {
      animatedPressed.value = withSpring(1, springConfig);
    };

    const handlePressOut = () => {
      animatedPressed.value = withSpring(0, springConfig);
    };

    return (
      <View style={containerStyle} testID={testID}>
        <View style={styles.sliderTrackContainer}>
          <GlassView
            elevation="surface"
            style={[
              styles.sliderTrack,
              { height: 4, backgroundColor: sliderTrackColor },
            ]}
          >
            <Animated.View style={[styles.sliderTrackFill, trackAnimatedStyle]} />
          </GlassView>
        </View>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.thumbWrapper}
        >
          <Animated.View
            style={[
              styles.sliderThumb,
              { backgroundColor: sliderThumbColor, width: 20, height: 20 },
              thumbAnimatedStyle,
            ]}
          />
        </Pressable>
        {showValue && (
          <Text style={styles.sliderValue}>
            {Math.round(value * 100)}%
          </Text>
        )}
      </View>
    );
  }
);

GlassSlider.displayName = 'GlassSlider';

// ==================== GlassSwitch ====================

interface GlassSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  color?: string;
  trackColor?: string;
  thumbColor?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
}

const sizeConfigSwitch = {
  sm: { width: 36, height: 20, thumbSize: 16, padding: 2 },
  md: { width: 44, height: 24, thumbSize: 20, padding: 2 },
  lg: { width: 52, height: 28, thumbSize: 24, padding: 2 },
};

const GlassSwitch = forwardRef<View, GlassSwitchProps>(
  (
    {
      value,
      onValueChange,
      disabled = false,
      color,
      trackColor,
      thumbColor,
      size = 'md',
      style,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const config = sizeConfigSwitch[size];
    const switchColor = color ?? colors.primary;
    const switchTrackColor = trackColor ?? colors.border;
    const switchThumbColor = thumbColor ?? colors.onSurface;

    const animatedValue = useSharedValue(value ? 1 : 0);
    const animatedPressed = useSharedValue(false);

    React.useEffect(() => {
      if (reduceMotion) {
        animatedValue.value = value ? 1 : 0;
      } else {
        animatedValue.value = withSpring(value ? 1 : 0, springConfig);
      }
    }, [value]);

    const trackAnimatedStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(animatedValue.value, [0, 1], [switchTrackColor, switchColor]),
    }));

    const thumbAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: interpolateColor(animatedValue.value, [0, 1], [config.padding, config.width - config.thumbSize - config.padding]) },
        { scale: animatedPressed.value ? 1.1 : 1 },
      ],
    }));

    const handlePressIn = () => {
      if (!disabled) {
        animatedPressed.value = withSpring(1, springConfig);
      }
    };

    const handlePressOut = () => {
      if (!disabled) {
        animatedPressed.value = withSpring(0, springConfig);
      }
    };

    const handlePress = () => {
      if (!disabled) {
        onValueChange(!value);
      }
    };

    const containerStyle = useMemo(() => [
      styles.switchContainer,
      { width: config.width, height: config.height },
      style,
    ], [config, style]);

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        testID={testID}
        style={containerStyle}
      >
        <Animated.View style={[
          styles.switchTrack,
          { borderRadius: config.height / 2 },
          trackAnimatedStyle,
        ]} />
        <Animated.View style={[
          styles.switchThumb,
          { width: config.thumbSize, height: config.thumbSize, backgroundColor: switchThumbColor, borderRadius: config.thumbSize / 2 },
          thumbAnimatedStyle,
        ]} />
      </Pressable>
    );
  }
);

GlassSwitch.displayName = 'GlassSwitch';

const styles = StyleSheet.create({
  linearContainer: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  linearTrack: {
    height: '100%',
    borderRadius: 9999,
  },
  linearLabel: {
    marginTop: themeTokens.spacing[2],
    textAlign: 'center',
  },
  circularContainer: {
    alignItems: 'center',
  },
  circularSvg: {
    position: 'relative',
  },
  circularLabel: {
    marginTop: themeTokens.spacing[2],
  },
  ringContainer: {
    alignItems: 'center',
  },
  ringSvg: {
    position: 'relative',
  },
  ringLabel: {
    marginTop: themeTokens.spacing[2],
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[3],
  },
  sliderTrackContainer: {
    flex: 1,
  },
  sliderTrack: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 9999,
  },
  thumbWrapper: {
    position: 'relative',
  },
  sliderThumb: {
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderValue: {
    fontSize: themeTokens.typography.fontSize.sm,
    color: colors.onSurfaceVariant,
    minWidth: 40,
    textAlign: 'right',
  },
  switchContainer: {
    borderRadius: 9999,
  },
  switchTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 9999,
  },
  switchThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

export { GlassProgress, GlassSlider, GlassSwitch };