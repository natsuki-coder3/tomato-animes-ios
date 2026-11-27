/**
 * GlassNavigationBar - Navigation bar with glass morphism
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
  SafeAreaView,
} from 'react-native';
import { GlassView } from './GlassView';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

interface GlassNavigationBarProps {
  title?: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftAction?: () => void;
  rightAction?: () => void;
  transparent?: boolean;
  elevation?: 'surface' | 'elevated' | 'overlay';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  testID?: string;
}

const GlassNavigationBar = forwardRef<View, GlassNavigationBarProps>(
  (
    {
      title,
      subtitle,
      leftElement,
      rightElement,
      leftAction,
      rightAction,
      transparent = false,
      elevation = 'surface',
      style,
      titleStyle,
      subtitleStyle,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const baseStyle = useGlassStyle({
      elevation: transparent ? 'surface' : elevation,
      cornerRadius: transparent ? 'full' : 0,
      borderWidth: transparent ? StyleSheet.hairlineWidth : 0,
      borderColor: colors.border,
      shadowLevel: transparent ? 'level1' : 'level0',
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        paddingHorizontal: themeTokens.spacing[4],
        paddingTop: Platform.OS === 'ios' ? themeTokens.spacing[2] : themeTokens.spacing[4],
        paddingBottom: themeTokens.spacing[3],
      },
      style,
    ], [baseStyle, style]);

    const contentStyle = useMemo(() => [
      styles.content,
      { gap: themeTokens.spacing[3] },
    ], []);

    return (
      <SafeAreaView style={styles.safeArea}>
        <GlassView
          ref={ref}
          elevation={transparent ? 'surface' : elevation}
          style={containerStyle}
          testID={testID}
        >
          <View style={contentStyle}>
            <View style={[styles.left, { flex: 1 }]}>
              {leftElement ? (
                <Pressable onPress={leftAction} accessibilityRole="button">
                  {leftElement}
                </Pressable>
              ) : null}
            </View>
            <View style={styles.center}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      fontSize: themeTokens.typography.fontSize.lg,
                      fontWeight: themeTokens.typography.fontWeight.semibold,
                      color: colors.onSurface,
                    },
                    titleStyle,
                  ]}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontSize: themeTokens.typography.fontSize.xs,
                      fontWeight: themeTokens.typography.fontWeight.regular,
                      color: colors.onSurfaceVariant,
                    },
                    subtitleStyle,
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={[styles.right, { flex: 1, alignItems: 'flex-end' }]}>
              {rightElement ? (
                <Pressable onPress={rightAction} accessibilityRole="button">
                  {rightElement}
                </Pressable>
              ) : null}
            </View>
          </View>
        </GlassView>
      </SafeAreaView>
    );
  }
);

GlassNavigationBar.displayName = 'GlassNavigationBar';

const Pressable = require('react-native').Pressable;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  left: {
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    flex: 1,
  },
  right: {
    justifyContent: 'flex-end',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 2,
  },
});

export interface GlassNavigationBarBackProps {
  onPress?: () => void;
  label?: string;
  testID?: string;
}

export const GlassNavigationBarBack: React.FC<GlassNavigationBarBackProps> = ({
  onPress,
  label = 'Voltar',
  testID,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={styles.backButton}
    >
      <View style={styles.backButtonContent}>
        <Image
          source={require('../../assets/icons/chevron-left.png')}
          style={[
            styles.backIcon,
            { tintColor: colors.onSurface },
          ]}
        />
        {label && <Text style={styles.backLabel}>{label}</Text>}
      </View>
    </Pressable>
  );
};

const backStyles = StyleSheet.create({
  backButton: {
    paddingVertical: themeTokens.spacing[1],
    paddingHorizontal: themeTokens.spacing[2],
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[1],
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  backLabel: {
    fontSize: themeTokens.typography.fontSize.md,
    fontWeight: themeTokens.typography.fontWeight.regular,
  },
});

export { GlassNavigationBar };