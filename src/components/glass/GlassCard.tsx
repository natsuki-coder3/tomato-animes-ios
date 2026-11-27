/**
 * GlassCard - Elevated glass card component
 */

import React, { forwardRef, useMemo } from 'react';
import { View, ViewStyle, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GlassView, GlassViewProps } from './GlassView';
import { useGlassStyle, useGlassPressAnimation, useGlassHoverAnimation, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

interface GlassCardProps extends Omit<GlassViewProps, 'elevation'> {
  variant?: 'surface' | 'elevated' | 'outlined';
  padding?: keyof typeof themeTokens.spacing;
  onPress?: () => void;
  onLongPress?: () => void;
  pressable?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<View, GlassCardProps>(
  (
    {
      variant = 'elevated',
      padding = 4,
      onPress,
      onLongPress,
      pressable = false,
      hoverable = false,
      children,
      style,
      testID,
      accessibilityRole,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const elevationMap = {
      surface: 'surface' as const,
      elevated: 'elevated' as const,
      outlined: 'surface' as const,
    };

    const borderConfig = useMemo(() => {
      if (variant === 'outlined') {
        return { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border };
      }
      return {};
    }, [variant, colors.border]);

    const baseStyle = useGlassStyle({
      elevation: elevationMap[variant],
      shadowLevel: variant === 'outlined' ? 'level0' : undefined,
      ...borderConfig,
    });

    const { onPressIn, onPressOut, animatedStyle: pressAnimatedStyle } = useGlassPressAnimation();
    const { onHoverIn, onHoverOut, animatedStyle: hoverAnimatedStyle } = useGlassHoverAnimation();

    const combinedStyle = useMemo(() => [
      baseStyle,
      styles.card,
      { padding: themeTokens.spacing[padding] },
      style,
    ], [baseStyle, padding, style]);

    const pressHandlers = pressable ? { onPressIn, onPressOut, onPress, onLongPress } : {};
    const hoverHandlers = hoverable && !pressable ? { onHoverIn, onHoverOut } : {};

    const Content = pressable ? Pressable : View;

    return (
      <GlassView
        ref={ref}
        elevation={elevationMap[variant]}
        style={combinedStyle}
        testID={testID}
        accessibilityRole={accessibilityRole ?? (pressable ? 'button' : undefined)}
        accessibilityLabel={accessibilityLabel}
        {...pressHandlers}
        {...hoverHandlers}
        {...props}
      >
        <Animated.View style={pressAnimatedStyle}>
          <Animated.View style={hoverAnimatedStyle}>
            {children}
          </Animated.View>
        </Animated.View>
      </GlassView>
    );
  }
);

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export interface GlassCardSectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  grow?: boolean;
  shrink?: boolean;
  basis?: number | string;
}

export const GlassCardSection = forwardRef<View, GlassCardSectionProps>(
  ({ children, style, grow = false, shrink = true, basis = 'auto' }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          styles.section,
          { flexGrow: grow ? 1 : 0, flexShrink: shrink ? 1 : 0, flexBasis: basis },
          style,
        ]}
      >
        {children}
      </View>
    );
  }
);

GlassCardSection.displayName = 'GlassCardSection';

export interface GlassCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCardHeader: React.FC<GlassCardHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  const { colors } = useTheme();
  const { fontSize, fontWeight } = themeTokens.typography;

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              { fontSize: fontSize.sm, color: colors.onSurfaceVariant },
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        {action && <View style={styles.action}>{action}</View>}
      </View>
    </View>
  );
};

const Text = require('react-native').Text;

const styles = StyleSheet.create({
  header: {
    marginBottom: themeTokens.spacing[3],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: themeTokens.spacing[1],
  },
  subtitle: {},
  action: {},
  section: {},
});

export { GlassCard };