/**
 * GlassTextArea - Multiline text input with glass morphism
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
  Platform,
  Animated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useGlassStyle, useGlassFocusRing, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

interface GlassTextAreaProps extends Omit<TextInputProps, 'onChangeText' | 'value' | 'multiline' | 'numberOfLines'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  minLines?: number;
  maxLines?: number;
  grow?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  containerStyle?: ViewStyle;
  testID?: string;
}

interface GlassTextAreaRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
}

const GlassTextArea = forwardRef<GlassTextAreaRef, GlassTextAreaProps>(
  (
    {
      label,
      placeholder,
      value: controlledValue,
      onChangeText,
      error,
      helperText,
      minLines = 3,
      maxLines = 8,
      grow = true,
      showCharacterCount = false,
      maxLength,
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
    const [height, setHeight] = useState(minLines * 24);
    const isControlled = controlledValue !== undefined;

    const value = isControlled ? controlledValue : uncontrolledValue;
    const hasError = !!error;
    const charCount = value.length;

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
      if (maxLength && text.length > maxLength) return;
      if (!isControlled) {
        setUncontrolledValue(text);
      }
      onChangeText?.(text);
    };

    const handleContentSizeChange = (e: any) => {
      if (grow) {
        const newHeight = Math.min(
          Math.max(e.nativeEvent.contentSize.height, minLines * 24),
          maxLines * 24
        );
        setHeight(newHeight);
      }
    };

    const handleClear = () => {
      if (!isControlled) {
        setUncontrolledValue('');
      }
      onChangeText?.('');
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
        minHeight: height,
        maxHeight: maxLines * 24,
      },
      containerStyle,
    ], [baseStyle, focusRingStyle, containerAnimatedStyle, height, containerStyle]);

    const inputStyleCombined = useMemo(() => [
      styles.input,
      {
        fontSize: themeTokens.typography.fontSize.md,
        fontWeight: themeTokens.typography.fontWeight.regular,
        color: colors.onSurface,
        textAlignVertical: 'top',
        paddingVertical: themeTokens.spacing[1],
        minHeight: minLines * 24,
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

    const countStyleCombined = useMemo(() => [
      styles.charCount,
      {
        fontSize: themeTokens.typography.fontSize.xs,
        fontWeight: themeTokens.typography.fontWeight.regular,
        color: maxLength && charCount >= maxLength ? colors.error : colors.onSurfaceVariant,
        marginTop: themeTokens.spacing[1],
        textAlign: 'right',
      },
    ], [charCount, maxLength, colors.error, colors.onSurfaceVariant]);

    return (
      <View style={[styles.wrapper, style]}>
        {label && <Text style={labelStyleCombined}>{label}</Text>}
        <GlassView
          elevation="surface"
          style={containerStyleCombined}
          testID={testID}
        >
          <TextInput
            style={inputStyleCombined}
            placeholder={placeholder}
            placeholderTextColor={colors.onSurfaceVariant}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onContentSizeChange={handleContentSizeChange}
            multiline
            numberOfLines={maxLines}
            autoCapitalize="sentences"
            autoCorrect={true}
            spellCheck={true}
            {...props}
          />
        </GlassView>
        <Animated.View style={[styles.errorWrapper, errorAnimatedStyle]}>
          {(error || helperText) && (
            <Text style={errorHelperStyleCombined}>
              {error ?? helperText}
            </Text>
          )}
        </Animated.View>
        {showCharacterCount && maxLength && (
          <Text style={countStyleCombined}>
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
    );
  }
);

GlassTextArea.displayName = 'GlassTextArea';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    paddingTop: themeTokens.spacing[2],
    paddingBottom: themeTokens.spacing[2],
  },
  input: {
    textAlignVertical: 'top',
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
  charCount: {
    marginRight: themeTokens.spacing[1],
  },
});

export { GlassTextArea };