/**
 * GlassSheet - Bottom sheet with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { GlassView } from './GlassView';
import { useGlassStyle, useGlassSheetAnimation, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  backdropEnabled?: boolean;
  backdropOpacity?: number;
  onClose?: () => void;
  onSnapChange?: (index: number) => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  handleStyle?: ViewStyle;
  showHandle?: boolean;
  keyboardBehavior?: 'extend' | 'resize' | 'none';
  testID?: string;
}

interface GlassSheetRef {
  open: (index?: number) => void;
  close: () => void;
  snapTo: (index: number) => void;
  currentSnap: number;
}

const GlassSheet = forwardRef<GlassSheetRef, GlassSheetProps>(
  (
    {
      children,
      snapPoints = [0.5, 0.9],
      initialSnap = 0,
      backdropEnabled = true,
      backdropOpacity = 0.4,
      onClose,
      onSnapChange,
      style,
      contentStyle,
      handleStyle,
      showHandle = true,
      keyboardBehavior = 'extend',
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();
    const { open: animateOpen, close: animateClose, animatedStyle: sheetAnimatedStyle } = useGlassSheetAnimation();

    const animatedTranslateY = useSharedValue(SCREEN_HEIGHT);
    const animatedBackdropOpacity = useSharedValue(0);
    const currentSnapIndex = useSharedValue(initialSnap);
    const isOpen = useSharedValue(false);
    const contentHeight = useSharedValue(0);

    const snapPointsValues = useMemo(() =>
      snapPoints.map((p) => SCREEN_HEIGHT * (1 - p)),
      [snapPoints]
    );

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startY = animatedTranslateY.value;
      },
      onActive: (event, ctx: any) => {
        animatedTranslateY.value = ctx.startY + event.translationY;
      },
      onEnd: (event) => {
        const velocity = event.velocityY;
        const currentY = animatedTranslateY.value;

        let targetIndex = 0;
        let minDistance = Infinity;

        snapPointsValues.forEach((point, index) => {
          const distance = Math.abs(currentY - point);
          if (distance < minDistance) {
            minDistance = distance;
            targetIndex = index;
          }
        });

        if (velocity < -500 && targetIndex < snapPointsValues.length - 1) {
          targetIndex += 1;
        } else if (velocity > 500 && targetIndex > 0) {
          targetIndex -= 1;
        }

        if (targetIndex === 0 && currentY > SCREEN_HEIGHT * 0.3) {
          runOnJS(close)();
          return;
        }

        runOnJS(snapTo)(targetIndex);
      },
    });

    const handlePress = () => {
      const nextIndex = (currentSnapIndex.value + 1) % snapPointsValues.length;
      snapTo(nextIndex);
    };

    const snapTo = (index: number) => {
      const targetY = snapPointsValues[index];
      currentSnapIndex.value = index;
      isOpen.value = index > 0;

      if (reduceMotion) {
        animatedTranslateY.value = targetY;
      } else {
        animatedTranslateY.value = withSpring(targetY, springConfig);
      }

      runOnJS(onSnapChange)?.(index);
    };

    const open = (index = snapPointsValues.length - 1) => {
      isOpen.value = true;
      Keyboard.dismiss();
      snapTo(index);
      if (backdropEnabled) {
        animatedBackdropOpacity.value = withTiming(backdropOpacity, { duration: 200 });
      }
    };

    const close = () => {
      isOpen.value = false;
      animatedTranslateY.value = withSpring(SCREEN_HEIGHT, springConfig);
      animatedBackdropOpacity.value = withTiming(0, { duration: 200 });
      runOnJS(onClose)?.();
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
      snapTo,
      get currentSnap() {
        return currentSnapIndex.value;
      },
    }));

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: animatedTranslateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: animatedBackdropOpacity.value,
    }));

    const baseStyle = useGlassStyle({
      elevation: 'overlay',
      cornerRadius: 'xl',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    });

    const handleBaseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: 'full',
      opacity: 0.5,
    });

    if (!isOpen.value && animatedTranslateY.value === SCREEN_HEIGHT) {
      return null;
    }

    return (
      <GestureDetector gesture={Gesture.Pan().onHandler(gestureHandler)}>
        <Animated.View style={styles.container} pointerEvents="box-none">
          {backdropEnabled && (
            <Animated.View
              style={[styles.backdrop, backdropStyle]}
              onTouchStart={close}
              pointerEvents={animatedBackdropOpacity.value > 0 ? 'auto' : 'none'}
            />
          )}
          <Animated.View style={[styles.sheetWrapper, sheetStyle]} pointerEvents="box-none">
            <GlassView
              style={[
                baseStyle,
                styles.sheet,
                { maxHeight: SCREEN_HEIGHT * 0.95 },
                style,
              ]}
              testID={testID}
            >
              {showHandle && (
                <View
                  style={[styles.handleContainer, handleStyle]}
                  onTouchStart={handlePress}
                  onClick={handlePress}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir painel"
                >
                  <Animated.View style={[styles.handle, handleBaseStyle]} />
                </View>
              )}
              <View
                style={[
                  styles.content,
                  contentStyle,
                ]}
                onLayout={(e) => {
                  contentHeight.value = e.nativeEvent.layout.height;
                }}
              >
                {children}
              </View>
            </GlassView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

GlassSheet.displayName = 'GlassSheet';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: themeTokens.zIndex.modal,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  sheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: themeTokens.cornerRadii.xl,
    borderTopRightRadius: themeTokens.cornerRadii.xl,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: themeTokens.spacing[2],
  },
  handle: {
    width: 36,
    height: 5,
  },
  content: {
    paddingHorizontal: themeTokens.spacing[4],
    paddingBottom: themeTokens.spacing[4] + (Platform.OS === 'ios' ? 20 : 0),
  },
});

export { GlassSheet };