/**
 * GlassInput - Text input with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TextInput,
  TextInputProps,
  Text,
  TextStyle,
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

interface GlassInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  secureTextEntry?: boolean;
  showTogglePassword?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  containerStyle?: ViewStyle;
  testID?: string;
}

interface GlassInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
}

const GlassInput = forwardRef<GlassInputRef, GlassInputProps>(
  (
    {
      label,
      placeholder,
      value: controlledValue,
      onChangeText,
      error,
      helperText,
      leftElement,
      rightElement,
      onLeftPress,
      onRightPress,
      secureTextEntry = false,
      showTogglePassword = false,
      style,
      inputStyle,
      labelStyle,
      errorStyle,
      helperStyle,
      containerStyle,
      testID,
      ...props
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const [uncontrolledValue, setUncontrolledValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const isControlled = controlledValue !== undefined;

    const value = isControlled ? controlledValue : uncontrolledValue;
    const hasError = !!error;

    const animatedFocus = useSharedValue(0);
    const animatedError = useSharedValue(0);

    const baseStyle = useGlassStyle({
      elevation: 'surface',
      cornerRadius: 'lg',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: hasError ? colors.error : colors.border,
      shadowLevel: 'level1',
    });

    const focusRingStyle = useGlassFocusRing(isFocused, hasError ? colors.error : colors.primary);

    const containerAnimatedStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        animatedFocus.value,
        [0, 1],
        [hasError ? colors.error : colors.border, hasError ? colors.error : colors.primary]
      );
      const borderWidth = interpolateColor(
        animatedFocus.value,
        [0, 1],
        [StyleSheet.hairlineWidth, 2]
      );
      return {
        borderColor,
        borderWidth,
      };
    });

    const errorAnimatedStyle = useAnimatedStyle(() => ({
      opacity: animatedError.value,
      height: animatedError.value * 20,
    }));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      animatedFocus.value = withSpring(1, springConfig);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      animatedFocus.value = withSpring(0, springConfig);
      props.onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      if (!isControlled) {
        setUncontrolledValue(text);
      }
      onChangeText?.(text);
    };

    const handleClear = () => {
      if (!isControlled) {
        setUncontrolledValue('');
      }
      onChangeText?.('');
    };

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    const handleLeftPress = () => {
      onLeftPress?.();
    };

    const handleRightPress = () => {
      if (showTogglePassword) {
        handleTogglePassword();
      } else if (hasError) {
        handleClear();
      } else {
        onRightPress?.();
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus handled by TextInput
      },
      blur: () => {
        // Blur handled by TextInput
      },
      clear: handleClear,
      setValue: (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onChangeText?.(newValue);
      },
      getValue: () => value,
    }));

    const containerStyleCombined = useMemo(() => [
      styles.container,
      baseStyle,
      focusRingStyle,
      containerAnimatedStyle,
      {
        paddingHorizontal: themeTokens.spacing[3],
        paddingVertical: themeTokens.spacing[2],
        flexDirection: 'row',
        alignItems: 'center',
      },
      containerStyle,
    ], [baseStyle, focusRingStyle, containerAnimatedStyle, containerStyle]);

    const inputStyleCombined = useMemo(() => [
      styles.input,
      {
        fontSize: themeTokens.typography.fontSize.md,
        fontWeight: themeTokens.typography.fontWeight.regular,
        color: colors.onSurface,
        flex: 1,
        paddingVertical: themeTokens.spacing[1],
      },
      inputStyle,
    ], [inputStyle]);

    const labelStyleCombined = useMemo(() => [
      styles.label,
      {
        fontSize: themeTokens.typography.fontSize.sm,
        fontWeight: themeTokens.typography.fontWeight.medium,
        color: colors.onSurface,
        marginBottom: themeTokens.spacing[1],
      },
      labelStyle,
    ], [labelStyle]);

    const errorHelperStyleCombined = useMemo(() => [
      styles.helperText,
      {
        fontSize: themeTokens.typography.fontSize.xs,
        fontWeight: themeTokens.typography.fontWeight.regular,
        color: hasError ? colors.error : colors.onSurfaceVariant,
        marginTop: themeTokens.spacing[1],
      },
      hasError ? errorStyle : helperStyle,
    ], [errorStyle, helperStyle, hasError, colors.error, colors.onSurfaceVariant]);

    return (
      <View style={[styles.wrapper, style]}>
        {label && <Text style={labelStyleCombined}>{label}</Text>}
        <GlassView
          elevation="surface"
          style={containerStyleCombined}
          testID={testID}
        >
          {leftElement && (
            <Pressable onPress={handleLeftPress} style={styles.elementWrapper}>
              {leftElement}
            </Pressable>
          )}
          <TextInput
            style={inputStyleCombined}
            placeholder={placeholder}
            placeholderTextColor={colors.onSurfaceVariant}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            {...props}
          />
          {(rightElement || showTogglePassword || hasError) && (
            <Pressable onPress={handleRightPress} style={styles.elementWrapper} accessibilityLabel={showTogglePassword ? (showPassword ? 'Ocultar senha' : 'Mostrar senha') : hasError ? 'Limpar' : undefined}>
              {rightElement ?? (showTogglePassword ? (
                <Image
                  source={require('../../assets/icons/' + (showPassword ? 'eye-slash.png' : 'eye.png'))}
                  style={[
                    styles.icon,
                    { tintColor: colors.onSurfaceVariant },
                  ]}
                />
              ) : hasError ? (
                <Image
                  source={require('../../assets/icons/x-circle.png')}
                  style={[
                    styles.icon,
                    { tintColor: colors.error },
                  ]}
                />
              ) : null)}
            </Pressable>
          )}
        </GlassView>
        <Animated.View style={[styles.errorWrapper, errorAnimatedStyle]}>
          {(error || helperText) && (
            <Text style={errorHelperStyleCombined}>
              {error ?? helperText}
            </Text>
          )}
        </Animated.View>
      </View>
    );
  }
);

GlassInput.displayName = 'GlassInput';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
  elementWrapper: {
    padding: themeTokens.spacing[1],
  },
  icon: {
    width: 22,
    height: 22,
  },
  label: {
    marginLeft: themeTokens.spacing[1],
  },
  helperText: {
    marginLeft: themeTokens.spacing[1],
  },
  errorWrapper: {
    overflow: 'hidden',
  },
});

export { GlassInput };