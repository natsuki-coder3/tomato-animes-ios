/**
 * GlassSelect - Select dropdown with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Pressable,
  FlatList,
  FlatListProps,
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
import { GlassBottomSheet } from './GlassBottomSheet';
import { useGlassStyle, useGlassFocusRing, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface GlassSelectProps<T = string> {
  label?: string;
  placeholder?: string;
  value?: T;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  containerStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  selectedOptionStyle?: ViewStyle;
  selectedOptionTextStyle?: TextStyle;
  testID?: string;
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => React.ReactNode;
}

interface GlassSelectRef<T = string> {
  focus: () => void;
  blur: () => void;
  open: () => void;
  close: () => void;
  setValue: (value: T) => void;
  getValue: () => T | undefined;
}

const GlassSelect = forwardRef<GlassSelectRef, GlassSelectProps>(
  (
    {
      label,
      placeholder = 'Selecionar',
      value,
      onChange,
      options,
      error,
      helperText,
      disabled = false,
      searchable = false,
      searchPlaceholder = 'Buscar...',
      onSearch,
      style,
      inputStyle,
      labelStyle,
      errorStyle,
      helperStyle,
      containerStyle,
      optionStyle,
      optionTextStyle,
      selectedOptionStyle,
      selectedOptionTextStyle,
      testID,
      renderOption,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);

    const hasError = !!error;
    const selectedOption = options.find((opt) => opt.value === value);

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

    const handleFocus = () => {
      if (!disabled) {
        setIsFocused(true);
        animatedFocus.value = withSpring(1, springConfig);
        setIsOpen(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      animatedFocus.value = withSpring(0, springConfig);
    };

    const handleOptionPress = (option: SelectOption<T>) => {
      if (!option.disabled) {
        onChange?.(option.value);
        setIsOpen(false);
        handleBlur();
      }
    };

    const handleSearch = (text: string) => {
      setSearchQuery(text);
      if (onSearch) {
        onSearch(text);
      } else {
        const filtered = options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(text.toLowerCase()) ||
            (opt.value as string).toLowerCase().includes(text.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    };

    const handleClear = () => {
      onChange?.(undefined as any);
      setSearchQuery('');
      setFilteredOptions(options);
    };

    useImperativeHandle(ref, () => ({
      focus: handleFocus,
      blur: handleBlur,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      setValue: (newValue: T) => onChange?.(newValue),
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
        justifyContent: 'space-between',
        opacity: disabled ? 0.5 : 1,
      },
      containerStyle,
    ], [baseStyle, focusRingStyle, containerAnimatedStyle, disabled, containerStyle]);

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

    const inputTextStyle = useMemo(() => [
      styles.inputText,
      {
        fontSize: themeTokens.typography.fontSize.md,
        fontWeight: themeTokens.typography.fontWeight.regular,
        color: value ? colors.onSurface : colors.onSurfaceVariant,
        flex: 1,
      },
      inputStyle,
    ], [value, inputStyle]);

    return (
      <View style={[styles.wrapper, style]}>
        {label && <Text style={labelStyleCombined}>{label}</Text>}
        <Pressable
          onPress={handleFocus}
          onHoverIn={handleFocus}
          onHoverOut={handleBlur}
          disabled={disabled}
          accessibilityRole="combobox"
          accessibilityState={{ disabled, expanded: isOpen }}
          accessibilityLabel={label}
          testID={testID}
          style={containerStyleCombined}
        >
          <Text style={inputTextStyle}>
            {selectedOption?.label ?? placeholder}
          </Text>
          <View style={styles.chevronWrapper}>
            <Animated.Image
              source={require('../../assets/icons/chevron-down.png')}
              style={[
                styles.chevron,
                {
                  tintColor: colors.onSurfaceVariant,
                  transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
                },
              ]}
            />
          </View>
        </Pressable>
        <Animated.View style={[styles.errorWrapper, errorAnimatedStyle]}>
          {(error || helperText) && (
            <Text style={errorHelperStyleCombined}>
              {error ?? helperText}
            </Text>
          )}
        </Animated.View>
        <GlassBottomSheet
          snapPoints={[0.4, 0.6, 0.9]}
          initialSnap={1}
          showHandle={false}
          backdropEnabled={true}
        >
          {searchable && (
            <GlassInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              leftElement={
                <Image
                  source={require('../../assets/icons/search.png')}
                  style={[
                    styles.searchIcon,
                    { tintColor: colors.onSurfaceVariant },
                  ]}
                />
              }
              style={styles.searchInput}
            />
          )}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              if (renderOption) {
                return renderOption(item, isSelected);
              }
              return (
                <Pressable
                  onPress={() => handleOptionPress(item)}
                  disabled={item.disabled}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    item.disabled && styles.optionDisabled,
                    optionStyle,
                  ]}
                >
                  {item.icon && <View style={styles.optionIcon}>{item.icon}</View>}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      item.disabled && styles.optionTextDisabled,
                      optionTextStyle,
                      isSelected && selectedOptionTextStyle,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Image
                      source={require('../../assets/icons/check.png')}
                      style={[
                        styles.checkIcon,
                        { tintColor: colors.primary },
                      ]}
                    />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </GlassBottomSheet>
      </View>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronWrapper: {
    padding: themeTokens.spacing[1],
  },
  chevron: {
    width: 20,
    height: 20,
  },
  inputText: {
    flex: 1,
    textAlign: 'left',
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
  searchInput: {
    marginBottom: themeTokens.spacing[2],
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  listContent: {
    paddingBottom: themeTokens.spacing[4],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: themeTokens.spacing[3],
    paddingHorizontal: themeTokens.spacing[4],
    gap: themeTokens.spacing[3],
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
  optionText: {
    fontSize: themeTokens.typography.fontSize.md,
    fontWeight: themeTokens.typography.fontWeight.regular,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: themeTokens.typography.fontWeight.semibold,
    color: colors.primary,
  },
  optionTextDisabled: {
    color: colors.onSurfaceVariant,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  emptyState: {
    padding: themeTokens.spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: themeTokens.typography.fontSize.md,
    color: colors.onSurfaceVariant,
  },
});

export { GlassSelect };