/**
 * GlassAvatar - Avatar with glass morphism
 */

import React, { forwardRef, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Image,
  ImageStyle,
  Text,
  TextStyle,
  Platform,
} from 'react-native';
import { GlassView } from './GlassView';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

export type GlassAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GlassAvatarShape = 'circle' | 'square' | 'rounded';

interface GlassAvatarProps {
  source?: ImageSourcePropType;
  children?: React.ReactNode;
  name?: string;
  size?: GlassAvatarSize;
  shape?: GlassAvatarShape;
  elevation?: 'surface' | 'elevated' | 'overlay';
  borderWidth?: number;
  borderColor?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
  testID?: string;
}

type ImageSourcePropType = { uri: string } | number | ImageRequireSource;

const sizeConfig = {
  xs: { width: 24, height: 24, fontSize: 10, statusSize: 8 },
  sm: { width: 32, height: 32, fontSize: 12, statusSize: 10 },
  md: { width: 40, height: 40, fontSize: 16, statusSize: 12 },
  lg: { width: 56, height: 56, fontSize: 22, statusSize: 14 },
  xl: { width: 72, height: 72, fontSize: 28, statusSize: 16 },
  '2xl': { width: 96, height: 96, fontSize: 36, statusSize: 20 },
};

const shapeConfig = {
  circle: 'full',
  square: 'none' as const,
  rounded: 'lg',
};

const statusColors = {
  online: '#34C759',
  offline: '#8E8E93',
  busy: '#FF3B30',
  away: '#FF9F0A',
};

const GlassAvatar = forwardRef<View, GlassAvatarProps>(
  (
    {
      source,
      children,
      name,
      size = 'md',
      shape = 'circle',
      elevation = 'surface',
      borderWidth = 0,
      borderColor,
      status,
      statusPosition = 'bottom-right',
      style,
      imageStyle,
      textStyle,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const config = sizeConfig[size];
    const borderRadius = shapeConfig[shape];

    const baseStyle = useGlassStyle({
      elevation,
      cornerRadius: borderRadius === 'none' ? 0 : borderRadius as any,
      borderWidth: borderWidth || (source ? 0 : StyleSheet.hairlineWidth),
      borderColor: borderColor || colors.border,
      shadowLevel: 'level1',
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        width: config.width,
        height: config.height,
        borderRadius: borderRadius === 'full' ? config.width / 2 : borderRadius === 'none' ? 0 : themeTokens.cornerRadii[borderRadius as keyof typeof themeTokens.cornerRadii],
      },
      style,
    ], [baseStyle, config, borderRadius, style]);

    const getInitials = (name: string) => {
      const parts = name.trim().split(' ');
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getColorFromName = (name: string) => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B',
        '#FB5607', '#8338EC', '#3A86FF', '#06D6A0',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const backgroundColor = useMemo(() => {
      if (name) return getColorFromName(name);
      return colors.primary;
    }, [name, colors.primary]);

    const statusStyle = useMemo(() => {
      if (!status) return null;
      const positions = {
        'bottom-right': { bottom: -2, right: -2 },
        'bottom-left': { bottom: -2, left: -2 },
        'top-right': { top: -2, right: -2 },
        'top-left': { top: -2, left: -2 },
      };
      return [
        styles.status,
        {
          width: config.statusSize,
          height: config.statusSize,
          backgroundColor: statusColors[status],
          borderColor: colors.background,
          ...positions[statusPosition],
        },
      ];
    }, [status, config.statusSize, colors.background]);

    const imageStyleCombined = useMemo(() => [
      styles.image,
      {
        width: config.width,
        height: config.height,
        borderRadius: borderRadius === 'full' ? config.width / 2 : borderRadius === 'none' ? 0 : themeTokens.cornerRadii[borderRadius as keyof typeof themeTokens.cornerRadii],
      },
      imageStyle,
    ], [config, borderRadius, imageStyle]);

    const textStyleCombined = useMemo(() => [
      styles.initials,
      {
        fontSize: config.fontSize,
        fontWeight: themeTokens.typography.fontWeight.semibold,
        color: '#FFFFFF',
      },
      textStyle,
    ], [config, textStyle]);

    return (
      <View style={styles.wrapper} testID={testID}>
        <GlassView
          ref={ref}
          elevation={elevation}
          style={containerStyle}
        >
          {source ? (
            <Image source={source} style={imageStyleCombined} />
          ) : children ? (
            <View style={styles.childrenContainer}>{children}</View>
          ) : name ? (
            <View
              style={[
                styles.initialsContainer,
                { backgroundColor, width: config.width, height: config.height },
              ]}
            >
              <Text style={textStyleCombined}>{getInitials(name)}</Text>
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </GlassView>
        {status && (
          <Animated.View style={statusStyle} />
        )}
      </View>
    );
  }
);

GlassAvatar.displayName = 'GlassAvatar';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  childrenContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  initials: {
    textAlign: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  status: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
  },
});

export { GlassAvatar };