/**
 * GlassSearchBar - Search bar with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TextInput,
  TextInputProps,
  Image,
  ImageStyle,
  Platform,
  Animated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { GlassIconButton } from './GlassButton';
import { useGlassStyle, useGlassFocusRing, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

interface GlassSearchBarProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  showsCancelButton?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  placeholderTextColor?: string;
  autoFocus?: boolean;
  testID?: string;
}

interface GlassSearchBarRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

const GlassSearchBar = forwardRef<GlassSearchBarRef, GlassSearchBarProps>(
  (
    {
      placeholder = 'Buscar',
      value: controlledValue,
      onChangeText,
      onSubmit,
      onFocus,
      onBlur,
      leftIcon,
      rightIcon,
      onLeftIconPress,
      onRightIconPress,
      showsCancelButton = false,
      cancelText = 'Cancelar',
      onCancel,
      style,
      inputStyle,
      placeholderTextColor,
      autoFocus = false,
      testID,
      ...props
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const [uncontrolledValue, setUncontrolledValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const isControlled = controlledValue !== undefined;

    const value = isControlled ? controlledValue : uncontrolledValue;
    const hasValue = value.length > 0;

    const animatedFocus = useSharedValue(0);
    const animatedCancelWidth = useSharedValue(0);
    const animatedCancelOpacity = useSharedValue(0);

    const baseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: 'full',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowLevel: 'level1',
    });

    const focusRingStyle = useGlassFocusRing(isFocused, colors.primary);

    const containerAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolateColor(animatedFocus.value, [0, 1], [1, 1.01]);
      const borderColor = interpolateColor(
        animatedFocus.value,
        [0, 1],
        [colors.border, colors.primary]
      );
      return {
        transform: [{ scale }],
        borderColor,
        borderWidth: interpolateColor(animatedFocus.value, [0, 1], [StyleSheet.hairlineWidth, 2]),
      };
    });

    const cancelAnimatedStyle = useAnimatedStyle(() => ({
      width: animatedCancelWidth.value,
      opacity: animatedCancelOpacity.value,
    }));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      animatedFocus.value = withSpring(1, springConfig);
      if (showsCancelButton) {
        animatedCancelWidth.value = withSpring(60, springConfig);
        animatedCancelOpacity.value = withTiming(1, { duration: 150 });
      }
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      animatedFocus.value = withSpring(0, springConfig);
      if (showsCancelButton) {
        animatedCancelWidth.value = withSpring(0, springConfig);
        animatedCancelOpacity.value = withTiming(0, { duration: 150 });
      }
      onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      if (!isControlled) {
        setUncontrolledValue(text);
      }
      onChangeText?.(text);
    };

    const handleSubmit = (e: any) => {
      onSubmit?.(value);
    };

    const handleClear = () => {
      if (!isControlled) {
        setUncontrolledValue('');
      }
      onChangeText?.('');
    };

    const handleCancel = () => {
      handleClear();
      handleBlur({});
      onCancel?.();
    };

    const handleLeftIconPress = () => {
      onLeftIconPress?.();
    };

    const handleRightIconPress = () => {
      if (hasValue) {
        handleClear();
      } else {
        onRightIconPress?.();
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus is handled by TextInput internally
      },
      blur: () => {
        // Blur is handled by TextInput internally
      },
      clear: handleClear,
      setValue: (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onChangeText?.(newValue);
      },
    }));

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      focusRingStyle,
      containerAnimatedStyle,
      {
        paddingHorizontal: themeTokens.spacing[3],
        paddingVertical: themeTokens.spacing[2],
      },
      style,
    ], [baseStyle, focusRingStyle, containerAnimatedStyle, style]);

    return (
      <GlassView
        elevation="surface"
        style={containerStyle}
        testID={testID}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {leftIcon ? (
              <Pressable onPress={handleLeftIconPress} style={styles.iconWrapper}>
                {leftIcon}
              </Pressable>
            ) : (
              <Image
                source={require('../../assets/icons/search.png')}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? colors.primary : colors.onSurfaceVariant },
                ]}
              />
            )}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                fontSize: themeTokens.typography.fontSize.md,
                fontWeight: themeTokens.typography.fontWeight.regular,
                color: colors.onSurface,
                flex: 1,
              },
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor ?? colors.onSurfaceVariant}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            {...props}
          />
          <View style={styles.rightSection}>
            {hasValue && rightIcon ? (
              <Pressable onPress={handleRightIconPress} style={styles.iconWrapper}>
                {rightIcon}
              </Pressable>
            ) : hasValue ? (
              <Pressable onPress={handleClear} style={styles.iconWrapper} accessibilityLabel="Limpar busca">
                <Image
                  source={require('../../assets/icons/x-circle.png')}
                  style={[
                    styles.icon,
                    { tintColor: colors.onSurfaceVariant },
                  ]}
                />
              </Pressable>
            ) : rightIcon ? (
              <Pressable onPress={handleRightIconPress} style={styles.iconWrapper}>
                {rightIcon}
              </Pressable>
            ) : null}
          </View>
        </View>
        {showsCancelButton && (
          <Animated.View style={[styles.cancelWrapper, cancelAnimatedStyle]} pointerEvents="box-none">
            <Pressable
              onPress={handleCancel}
              style={styles.cancelButton}
              accessibilityLabel="Cancelar busca"
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>
          </Animated.View>
        )}
      </GlassView>
    );
  }
);

GlassSearchBar.displayName = 'GlassSearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: themeTokens.spacing[2],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: themeTokens.spacing[1],
  },
  icon: {
    width: 22,
    height: 22,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: themeTokens.spacing[1],
  },
  cancelWrapper: {
    overflow: 'hidden',
    marginLeft: themeTokens.spacing[2],
  },
  cancelButton: {
    paddingHorizontal: themeTokens.spacing[3],
    paddingVertical: themeTokens.spacing[2],
  },
  cancelText: {
    fontSize: themeTokens.typography.fontSize.md,
    fontWeight: themeTokens.typography.fontWeight.medium,
  },
});

export { GlassSearchBar };