/**
 * GlassButton - Button with glass morphism variants
 */

import React, { forwardRef, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Pressable,
  PressableProps,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useGlassPressAnimation, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

export type GlassButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type GlassButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends Omit<PressableProps, 'onPressIn' | 'onPressOut' | 'children'> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const variantStyles: Record<GlassButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: 'rgba(0, 102, 204, 0.9)',
    text: '#FFFFFF',
    border: 'transparent',
  },
  secondary: {
    bg: 'rgba(94, 92, 230, 0.9)',
    text: '#FFFFFF',
    border: 'transparent',
  },
  ghost: {
    bg: 'transparent',
    text: '#0066CC',
    border: 'transparent',
  },
  danger: {
    bg: 'rgba(255, 59, 48, 0.9)',
    text: '#FFFFFF',
    border: 'transparent',
  },
  outline: {
    bg: 'transparent',
    text: '#0066CC',
    border: '#0066CC',
  },
};

const sizeConfig = {
  sm: {
    paddingVertical: themeTokens.spacing[2],
    paddingHorizontal: themeTokens.spacing[3],
    fontSize: themeTokens.typography.fontSize.sm,
    fontWeight: themeTokens.typography.fontWeight.medium,
    borderRadius: themeTokens.cornerRadii.md,
    iconSize: 16,
    gap: themeTokens.spacing[1],
  },
  md: {
    paddingVertical: themeTokens.spacing[3],
    paddingHorizontal: themeTokens.spacing[4],
    fontSize: themeTokens.typography.fontSize.md,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    borderRadius: themeTokens.cornerRadii.lg,
    iconSize: 20,
    gap: themeTokens.spacing[2],
  },
  lg: {
    paddingVertical: themeTokens.spacing[4],
    paddingHorizontal: themeTokens.spacing[6],
    fontSize: themeTokens.typography.fontSize.lg,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    borderRadius: themeTokens.cornerRadii.xl,
    iconSize: 24,
    gap: themeTokens.spacing[3],
  },
};

const GlassButton = forwardRef<Pressable, GlassButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      onPress,
      style,
      textStyle,
      testID,
      ...props
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();
    const { onPressIn, onPressOut, animatedStyle: pressAnimatedStyle } = useGlassPressAnimation();

    const config = sizeConfig[size];
    const variantConfig = variantStyles[variant];

    const isInteractive = !disabled && !loading;

    const animatedOpacity = useSharedValue(isInteractive ? 1 : 0.5);
    const animatedScale = useSharedValue(1);

    const backgroundColor = useMemo(() => {
      if (variant === 'ghost' || variant === 'outline') {
        return 'transparent';
      }
      return variantConfig.bg;
    }, [variant, variantConfig.bg]);

    const borderColor = useMemo(() => {
      if (variant === 'outline') {
        return isInteractive ? variantConfig.border : interpolateColor(0.5, [0, 1], [variantConfig.border, colors.onSurfaceVariant]);
      }
      return 'transparent';
    }, [variant, variantConfig.border, isInteractive, colors.onSurfaceVariant]);

    const textColor = useMemo(() => {
      if (!isInteractive) {
        return colors.onSurfaceVariant;
      }
      return variantConfig.text;
    }, [isInteractive, variantConfig.text, colors.onSurfaceVariant]);

    const baseStyle = useGlassStyle({
      elevation: variant === 'ghost' || variant === 'outline' ? 'surface' : 'elevated',
      cornerRadius: config.borderRadius,
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor,
      tintColor: backgroundColor,
      opacity: isReducedTransparency && (variant === 'ghost' || variant === 'outline') ? 1 : undefined,
      shadowLevel: variant === 'ghost' || variant === 'outline' ? 'level0' : 'level1',
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        paddingVertical: config.paddingVertical,
        paddingHorizontal: config.paddingHorizontal,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: config.gap,
        width: fullWidth ? '100%' : undefined,
        opacity: animatedOpacity.value,
      },
      style,
    ], [baseStyle, config, fullWidth, style, animatedOpacity]);

    const textStyleCombined = useMemo(() => [
      styles.text,
      {
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        color: textColor,
      },
      textStyle,
    ], [config, textColor, textStyle]);

    const handlePressIn = () => {
      if (isInteractive && !reduceMotion) {
        animatedScale.value = withSpring(0.96, springConfig);
      }
      onPressIn?.();
    };

    const handlePressOut = () => {
      if (isInteractive && !reduceMotion) {
        animatedScale.value = withSpring(1, springConfig);
      }
      onPressOut?.();
    };

    const handlePress = () => {
      if (isInteractive) {
        onPress?.();
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isInteractive, busy: loading }}
        testID={testID}
        style={({ pressed }: any) => [
          containerStyle,
          pressAnimatedStyle,
          pressed && !reduceMotion && { transform: [{ scale: 0.96 }] },
        ]}
        {...props}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' || variant === 'outline' ? colors.primary : colors.onPrimary}
            style={styles.spinner}
          />
        )}
        {!loading && leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <Text style={textStyleCombined}>{children}</Text>
        {!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </Pressable>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export interface GlassIconButtonProps extends Omit<PressableProps, 'onPressIn' | 'onPressOut' | 'children'> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const GlassIconButton = forwardRef<Pressable, GlassIconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      label,
      onPress,
      style,
      testID,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();
    const { onPressIn, onPressOut, animatedStyle: pressAnimatedStyle } = useGlassPressAnimation();

    const config = sizeConfig[size];
    const variantConfig = variantStyles[variant];

    const isInteractive = !disabled && !loading;

    const backgroundColor = useMemo(() => {
      if (variant === 'ghost' || variant === 'outline') {
        return 'transparent';
      }
      return variantConfig.bg;
    }, [variant, variantConfig.bg]);

    const borderColor = useMemo(() => {
      if (variant === 'outline') {
        return isInteractive ? variantConfig.border : colors.onSurfaceVariant;
      }
      return 'transparent';
    }, [variant, variantConfig.border, isInteractive, colors.onSurfaceVariant]);

    const baseStyle = useGlassStyle({
      elevation: variant === 'ghost' || variant === 'outline' ? 'surface' : 'elevated',
      cornerRadius: 'full',
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor,
      tintColor: backgroundColor,
      shadowLevel: 'level0',
    });

    const containerStyle = useMemo(() => [
      styles.iconContainer,
      baseStyle,
      {
        width: config.paddingVertical * 2 + config.iconSize,
        height: config.paddingVertical * 2 + config.iconSize,
        padding: 0,
      },
      style,
    ], [baseStyle, config, style]);

    const handlePressIn = () => {
      if (isInteractive && !reduceMotion) {
        // Scale handled by pressAnimatedStyle
      }
      onPressIn?.();
    };

    const handlePressOut = () => {
      if (isInteractive && !reduceMotion) {
        // Scale handled by pressAnimatedStyle
      }
      onPressOut?.();
    };

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !isInteractive, busy: loading }}
        testID={testID}
        style={({ pressed }: any) => [
          containerStyle,
          pressAnimatedStyle,
          pressed && !reduceMotion && { transform: [{ scale: 0.9 }] },
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' || variant === 'outline' ? colors.primary : colors.onPrimary}
          />
        ) : (
          <View style={styles.iconCenter}>{icon}</View>
        )}
      </Pressable>
    );
  }
);

GlassIconButton.displayName = 'GlassIconButton';

const styles = StyleSheet.create({
  container: {
    borderRadius: themeTokens.cornerRadii.lg,
  },
  iconContainer: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    flexShrink: 0,
  },
  spinner: {
    marginHorizontal: themeTokens.spacing[1],
  },
});

export { GlassButton };