/**
 * GlassBadge, GlassChip, GlassDivider - Small display components
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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

// ==================== GlassBadge ====================

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: 'rgba(0, 0, 0, 0.06)', text: '#1C1C1E', border: 'transparent' },
  primary: { bg: 'rgba(0, 102, 204, 0.12)', text: '#0066CC', border: 'transparent' },
  secondary: { bg: 'rgba(94, 92, 230, 0.12)', text: '#5E5CE6', border: 'transparent' },
  success: { bg: 'rgba(52, 199, 89, 0.12)', text: '#34C759', border: 'transparent' },
  warning: { bg: 'rgba(255, 159, 10, 0.12)', text: '#FF9F0A', border: 'transparent' },
  error: { bg: 'rgba(255, 59, 48, 0.12)', text: '#FF3B30', border: 'transparent' },
  outline: { bg: 'transparent', text: '#0066CC', border: '#0066CC' },
};

const sizeConfig = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, fontWeight: '600' as const, dotSize: 6, gap: 4 },
  md: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '600' as const, dotSize: 7, gap: 5 },
  lg: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '600' as const, dotSize: 8, gap: 6 },
};

const GlassBadge = forwardRef<View, GlassBadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      style,
      textStyle,
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const config = sizeConfig[size];
    const variantConfig = variantColors[variant];

    const bgColor = useMemo(() => {
      if (variant === 'outline') return 'transparent';
      if (variant === 'default') {
        return isReducedTransparency ? 'rgba(0, 0, 0, 0.12)' : variantConfig.bg;
      }
      return variantConfig.bg;
    }, [variant, variantConfig.bg, isReducedTransparency]);

    const borderColor = useMemo(() => {
      if (variant === 'outline') return variantConfig.border;
      return 'transparent';
    }, [variant, variantConfig.border]);

    const textColor = useMemo(() => variantConfig.text, [variantConfig.text]);

    const baseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: 'full',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor,
      tintColor: bgColor,
      opacity: isReducedTransparency && variant !== 'outline' ? 1 : undefined,
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        paddingHorizontal: config.paddingHorizontal,
        paddingVertical: config.paddingVertical,
        flexDirection: 'row',
        alignItems: 'center',
        gap: config.gap,
      },
      style,
    ], [baseStyle, config, style]);

    const textStyleCombined = useMemo(() => [
      styles.text,
      {
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        color: textColor,
      },
      textStyle,
    ], [config, textColor, textStyle]);

    const dotStyle = useMemo(() => [
      styles.dot,
      {
        width: config.dotSize,
        height: config.dotSize,
        borderRadius: config.dotSize / 2,
        backgroundColor: textColor,
      },
    ], [config, textColor]);

    return (
      <GlassView
        ref={ref}
        elevation="surface"
        style={containerStyle}
        testID={testID}
      >
        {dot && <View style={dotStyle} />}
        <Text style={textStyleCombined}>{children}</Text>
      </GlassView>
    );
  }
);

GlassBadge.displayName = 'GlassBadge';

// ==================== GlassChip ====================

export type ChipVariant = 'default' | 'primary' | 'outline' | 'selected';

interface GlassChipProps extends Omit<PressableProps, 'onPressIn' | 'onPressOut' | 'children'> {
  label: string;
  variant?: ChipVariant;
  size?: BadgeSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  onClose?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const GlassChip = forwardRef<Pressable, GlassChipProps>(
  (
    {
      label,
      variant = 'default',
      size = 'md',
      leadingIcon,
      trailingIcon,
      onPress,
      disabled = false,
      selected = false,
      onClose,
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

    const isInteractive = !disabled && onPress;
    const effectiveVariant = selected ? 'selected' : variant;

    const variantStyles: Record<ChipVariant, { bg: string; text: string; border: string }> = {
      default: {
        bg: isReducedTransparency ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        text: colors.onSurface,
        border: colors.border,
      },
      primary: {
        bg: 'rgba(0, 102, 204, 0.16)',
        text: colors.primary,
        border: 'transparent',
      },
      outline: {
        bg: 'transparent',
        text: colors.primary,
        border: colors.primary,
      },
      selected: {
        bg: 'rgba(0, 102, 204, 0.2)',
        text: colors.primary,
        border: colors.primary,
      },
    };

    const variantConfig = variantStyles[effectiveVariant];

    const baseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: 'full',
      borderWidth: effectiveVariant === 'outline' || effectiveVariant === 'selected' ? 1.5 : StyleSheet.hairlineWidth,
      borderColor: variantConfig.border,
      tintColor: variantConfig.bg,
      opacity: isReducedTransparency && effectiveVariant !== 'outline' && effectiveVariant !== 'selected' ? 1 : undefined,
    });

    const containerStyle = useMemo(() => [
      styles.chipContainer,
      baseStyle,
      {
        paddingHorizontal: config.paddingHorizontal,
        paddingVertical: config.paddingVertical,
        flexDirection: 'row',
        alignItems: 'center',
        gap: config.gap,
        opacity: disabled ? 0.5 : 1,
      },
      style,
    ], [baseStyle, config, disabled, style]);

    const textStyleCombined = useMemo(() => [
      styles.chipText,
      {
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        color: variantConfig.text,
      },
      textStyle,
    ], [config, variantConfig.text, textStyle]);

    const handlePressIn = () => {
      if (isInteractive && !reduceMotion) {
        onPressIn?.();
      }
    };

    const handlePressOut = () => {
      if (isInteractive && !reduceMotion) {
        onPressOut?.();
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
        testID={testID}
        style={({ pressed }: any) => [
          containerStyle,
          pressAnimatedStyle,
          pressed && !reduceMotion && { transform: [{ scale: 0.96 }] },
        ]}
        {...props}
      >
        {leadingIcon && <View style={styles.chipIcon}>{leadingIcon}</View>}
        <Text style={textStyleCombined}>{label}</Text>
        {trailingIcon && <View style={styles.chipIcon}>{trailingIcon}</View>}
        {onClose && !disabled && (
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="Remover">
            <Image
              source={require('../../assets/icons/x-small.png')}
              style={[
                styles.closeIcon,
                { tintColor: variantConfig.text },
              ]}
            />
          </Pressable>
        )}
      </Pressable>
    );
  }
);

GlassChip.displayName = 'GlassChip';

const Image = require('react-native').Image;

// ==================== GlassDivider ====================

interface GlassDividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  length?: number | 'full';
  style?: ViewStyle;
  testID?: string;
}

export const GlassDivider: React.FC<GlassDividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  length = 'full',
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const dividerStyle = useMemo(() => {
    const base = {
      backgroundColor: colors.divider,
      opacity: 0.5,
    };

    if (orientation === 'horizontal') {
      return [
        styles.horizontalDivider,
        base,
        length === 'full' ? { width: '100%' } : { width: length },
      ];
    } else {
      return [
        styles.verticalDivider,
        base,
        length === 'full' ? { height: '100%' } : { height: length },
      ];
    }
  }, [orientation, variant, length, colors.divider]);

  return <View style={dividerStyle} testID={testID} />;
};

GlassDivider.displayName = 'GlassDivider';

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
  },
  text: {},
  dot: {},
  chipContainer: {
    borderRadius: 9999,
  },
  chipText: {},
  chipIcon: {
    flexShrink: 0,
  },
  closeButton: {
    padding: 2,
  },
  closeIcon: {
    width: 12,
    height: 12,
  },
  horizontalDivider: {
    height: StyleSheet.hairlineWidth,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
  },
});

export { GlassBadge, GlassChip, GlassDivider };