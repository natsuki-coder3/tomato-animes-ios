/**
 * GlassTabBar - Tab bar with glass morphism
 */

import React, { forwardRef, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Image,
  ImageStyle,
  Platform,
  Pressable,
  PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

export interface TabBarItem {
  label: string;
  icon: React.ReactNode;
  selectedIcon?: React.ReactNode;
  badge?: string | number;
  testID?: string;
  accessibilityLabel?: string;
}

interface GlassTabBarProps {
  items: TabBarItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeLabelStyle?: TextStyle;
  inactiveLabelStyle?: TextStyle;
  indicatorStyle?: ViewStyle;
  showLabels?: boolean;
  variant?: 'standard' | 'floating' | 'minimal';
  testID?: string;
}

const GlassTabBar = forwardRef<View, GlassTabBarProps>(
  (
    {
      items,
      activeIndex,
      onChange,
      style,
      itemStyle,
      labelStyle,
      activeLabelStyle,
      inactiveLabelStyle,
      indicatorStyle,
      showLabels = true,
      variant = 'standard',
      testID,
    },
    ref
  ) => {
    const { colors, animatedColors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const animatedIndex = useSharedValue(activeIndex);
    const itemWidth = useSharedValue(SCREEN_WIDTH / items.length);

    const baseStyle = useGlassStyle({
      elevation: variant === 'floating' ? 'overlay' : 'elevated',
      cornerRadius: variant === 'floating' ? 'xl' : 0,
      borderWidth: variant === 'floating' ? StyleSheet.hairlineWidth : 0,
      borderColor: colors.border,
      shadowLevel: variant === 'floating' ? 'level2' : 'level1',
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        paddingHorizontal: variant === 'floating' ? themeTokens.spacing[2] : 0,
        paddingVertical: themeTokens.spacing[1],
        marginHorizontal: variant === 'floating' ? themeTokens.spacing[4] : 0,
        marginBottom: variant === 'floating' ? themeTokens.spacing[2] : 0,
        borderRadius: variant === 'floating' ? themeTokens.cornerRadii.xl : 0,
      },
      style,
    ], [baseStyle, variant, style]);

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
      const index = animatedIndex.value;
      const translateX = index * itemWidth.value;
      return {
        transform: [{ translateX }],
        width: itemWidth.value,
      };
    });

    React.useEffect(() => {
      if (reduceMotion) {
        animatedIndex.value = activeIndex;
      } else {
        animatedIndex.value = withSpring(activeIndex, springConfig);
      }
    }, [activeIndex]);

    const handlePress = (index: number) => {
      onChange(index);
    };

    return (
      <GlassView
        ref={ref}
        elevation={variant === 'floating' ? 'overlay' : 'elevated'}
        style={containerStyle}
        testID={testID}
      >
        <Animated.View style={styles.indicatorContainer}>
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: colors.primary,
                borderRadius: themeTokens.cornerRadii.md,
                height: '100%',
              },
              indicatorStyle,
            ]}
          />
        </Animated.View>
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handlePress(index)}
              style={[
                styles.item,
                {
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: themeTokens.spacing[2],
                  paddingHorizontal: themeTokens.spacing[2],
                  borderRadius: themeTokens.cornerRadii.md,
                },
                itemStyle,
              ]}
              testID={item.testID}
              accessibilityRole="button"
              accessibilityLabel={item.accessibilityLabel ?? item.label}
              accessibilityState={{ selected: index === activeIndex }}
            >
              <View style={styles.iconContainer}>
                {index === activeIndex && item.selectedIcon ? item.selectedIcon : item.icon}
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </Text>
                  </View>
                )}
              </View>
              {showLabels && (
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      fontSize: themeTokens.typography.fontSize.xs,
                      fontWeight: index === activeIndex
                        ? themeTokens.typography.fontWeight.semibold
                        : themeTokens.typography.fontWeight.regular,
                      color: index === activeIndex ? colors.primary : colors.onSurfaceVariant,
                    },
                    labelStyle,
                    index === activeIndex ? activeLabelStyle : inactiveLabelStyle,
                  ]}
                >
                  {item.label}
                </Animated.Text>
              )}
            </Pressable>
          ))}
        </View>
      </GlassView>
    );
  }
);

GlassTabBar.displayName = 'GlassTabBar';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  indicatorContainer: {
    position: 'absolute',
    top: themeTokens.spacing[1],
    bottom: themeTokens.spacing[1],
    left: themeTokens.spacing[2],
    right: themeTokens.spacing[2],
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  item: {
    minHeight: 48,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: themeTokens.spacing[1],
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  label: {
    textAlign: 'center',
  },
});

export { GlassTabBar };