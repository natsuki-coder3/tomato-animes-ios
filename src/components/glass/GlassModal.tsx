/**
 * GlassModal - Modal with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Platform,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useGlassModalAnimation, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

interface GlassModalProps {
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayPress?: boolean;
  closeOnBackdropPress?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

interface GlassModalRef {
  open: () => void;
  close: () => void;
}

const sizeMap = {
  sm: 0.85,
  md: 0.9,
  lg: 0.95,
  xl: 0.98,
  full: 1,
};

const GlassModal = forwardRef<GlassModalRef, GlassModalProps>(
  (
    {
      visible,
      children,
      onClose,
      size = 'md',
      closeOnOverlayPress = true,
      closeOnBackdropPress = true,
      backdropOpacity = 0.4,
      style,
      contentStyle,
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();
    const { open: animateOpen, close: animateClose, animatedStyle: modalAnimatedStyle } = useGlassModalAnimation();

    const animatedOpacity = useSharedValue(0);
    const animatedScale = useSharedValue(0.9);
    const isMounted = useSharedValue(false);

    const widthRatio = sizeMap[size];

    const baseStyle = useGlassStyle({
      elevation: 'overlay',
      cornerRadius: size === 'full' ? 0 : 'xl',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    });

    const open = () => {
      isMounted.value = true;
      Keyboard.dismiss();
      animateOpen();
      animatedOpacity.value = withTiming(1, { duration: 150 });
      if (!reduceMotion) {
        animatedScale.value = withSpring(1, springConfig);
      } else {
        animatedScale.value = 1;
      }
    };

    const close = () => {
      animateClose();
      animatedOpacity.value = withTiming(0, { duration: 150 });
      if (!reduceMotion) {
        animatedScale.value = withSpring(0.9, springConfig);
      } else {
        animatedScale.value = 0.9;
      }
      setTimeout(() => {
        isMounted.value = false;
        runOnJS(onClose)();
      }, reduceMotion ? 0 : 200);
    };

    useImperativeHandle(ref, () => ({ open, close }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: animatedOpacity.value,
      transform: [{ scale: animatedScale.value }],
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      opacity: animatedOpacity.value * backdropOpacity,
    }));

    if (!isMounted.value && !visible) {
      return null;
    }

    return (
      <Modal
        visible={visible || isMounted.value}
        transparent
        animationType="none"
        onRequestClose={close}
        testID={testID}
      >
        <Animated.View style={[styles.container, containerAnimatedStyle]} pointerEvents="box-none">
          <Animated.View
            style={[styles.backdrop, backdropAnimatedStyle]}
            onTouchStart={closeOnBackdropPress ? close : undefined}
            pointerEvents={closeOnBackdropPress ? 'auto' : 'none'}
          />
          <Animated.View style={styles.centerWrapper} pointerEvents="box-none">
            <GlassView
              style={[
                baseStyle,
                styles.modal,
                {
                  width: Platform.OS === 'web' ? `${widthRatio * 100}%` : undefined,
                  maxWidth: Platform.OS !== 'web' ? `${widthRatio * 100}%` : undefined,
                  maxHeight: size === 'full' ? '100%' : '90%',
                },
                style,
              ]}
            >
              <View style={[styles.content, contentStyle]}>
                {children}
              </View>
            </GlassView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);

GlassModal.displayName = 'GlassModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeTokens.spacing[4],
  },
  modal: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});

export { GlassModal };