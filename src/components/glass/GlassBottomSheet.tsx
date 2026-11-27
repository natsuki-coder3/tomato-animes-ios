/**
 * GlassBottomSheet - iOS-style bottom sheet with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Platform,
  Keyboard,
  Dimensions,
  Animated,
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
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlassBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: ('auto' | number)[];
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
  enableOverDrag?: boolean;
  testID?: string;
}

interface GlassBottomSheetRef {
  open: (index?: number) => void;
  close: () => void;
  snapTo: (index: number) => void;
  expand: () => void;
  collapse: () => void;
  currentSnap: number;
  isOpen: boolean;
}

const GlassBottomSheet = forwardRef<GlassBottomSheetRef, GlassBottomSheetProps>(
  (
    {
      children,
      snapPoints = ['auto', 0.5, 0.9],
      initialSnap = 1,
      backdropEnabled = true,
      backdropOpacity = 0.3,
      onClose,
      onSnapChange,
      style,
      contentStyle,
      handleStyle,
      showHandle = true,
      keyboardBehavior = 'extend',
      enableOverDrag = true,
      testID,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const animatedTranslateY = useSharedValue(SCREEN_HEIGHT);
    const animatedBackdropOpacity = useSharedValue(0);
    const currentSnapIndex = useSharedValue(initialSnap);
    const isOpen = useSharedValue(false);
    const contentHeight = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);

    const snapPointsValues = useMemo(() => {
      return snapPoints.map((point, index) => {
        if (point === 'auto') {
          return SCREEN_HEIGHT;
        }
        if (typeof point === 'number' && point <= 1) {
          return SCREEN_HEIGHT * (1 - point);
        }
        return point;
      });
    }, [snapPoints]);

    const handleKeyboardShow = (e: any) => {
      keyboardHeight.value = e.endCoordinates.height;
    };

    const handleKeyboardHide = () => {
      keyboardHeight.value = 0;
    };

    React.useEffect(() => {
      const showListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        handleKeyboardShow
      );
      const hideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        handleKeyboardHide
      );
      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }, []);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startY = animatedTranslateY.value;
      },
      onActive: (event, ctx: any) => {
        let translationY = ctx.startY + event.translationY;
        const minY = snapPointsValues[snapPointsValues.length - 1];
        const maxY = SCREEN_HEIGHT;

        if (enableOverDrag) {
          const overscroll = Math.max(0, translationY - maxY) * 0.3;
          translationY = Math.min(translationY, maxY + overscroll);
        } else {
          translationY = Math.min(Math.max(translationY, minY), maxY);
        }

        animatedTranslateY.value = translationY;
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

        if (velocity < -800 && targetIndex < snapPointsValues.length - 1) {
          targetIndex += 1;
        } else if (velocity > 800 && targetIndex > 0) {
          targetIndex -= 1;
        }

        if (targetIndex === 0 && currentY > SCREEN_HEIGHT * 0.4) {
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
      const clampedIndex = Math.max(0, Math.min(index, snapPointsValues.length - 1));
      const targetY = snapPointsValues[clampedIndex];
      currentSnapIndex.value = clampedIndex;
      isOpen.value = clampedIndex > 0;

      if (reduceMotion) {
        animatedTranslateY.value = targetY;
      } else {
        animatedTranslateY.value = withSpring(targetY, springConfig);
      }

      runOnJS(onSnapChange)?.(clampedIndex);
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

    const expand = () => {
      snapTo(snapPointsValues.length - 1);
    };

    const collapse = () => {
      snapTo(1);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
      snapTo,
      expand,
      collapse,
      get currentSnap() {
        return currentSnapIndex.value;
      },
      get isOpen() {
        return isOpen.value;
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
      opacity: 0.4,
    });

    if (!isOpen.value && animatedTranslateY.value >= SCREEN_HEIGHT) {
      return null;
    }

    return (
      <GestureDetector gesture={Gesture.Pan().onHandler(gestureHandler)}>
        <Animated.View style={styles.container} pointerEvents="box-none">
          {backdropEnabled && (
            <Animated.View
              style={[styles.backdrop, backdropStyle]}
              onTouchStart={close}
              pointerEvents={animatedBackdropOpacity.value > 0.01 ? 'auto' : 'none'}
            />
          )}
          <Animated.View style={[styles.sheetWrapper, sheetStyle]} pointerEvents="box-none">
            <GlassView
              style={[
                baseStyle,
                styles.sheet,
                { maxHeight: SCREEN_HEIGHT - (keyboardBehavior === 'resize' ? keyboardHeight.value : 0) },
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
                  accessibilityLabel="Expandir painel"
                >
                  <Animated.View style={[styles.handle, handleBaseStyle]} />
                </View>
              )}
              <View
                style={[
                  styles.content,
                  contentStyle,
                  { paddingBottom: themeTokens.spacing[4] + (Platform.OS === 'ios' ? 20 : 0) },
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

GlassBottomSheet.displayName = 'GlassBottomSheet';

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
  },
});

export { GlassBottomSheet };