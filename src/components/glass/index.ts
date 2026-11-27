/**
 * Liquid Glass Design System - Barrel Export
 * iOS 26 glassmorphism components for React Native + Expo
 */

// Theme
export * from '../../theme/tokens';
export * from '../../theme/themeProvider';
export * from '../../theme/hooks';

// Base Components
export { GlassView, GlassSurface } from './GlassView';
export type { GlassViewProps, GlassSurfaceProps } from './GlassView';

// Layout Components
export { GlassCard, GlassCardSection, GlassCardHeader } from './GlassCard';
export type { GlassCardProps, GlassCardSectionProps, GlassCardHeaderProps } from './GlassCard';

export { GlassSheet } from './GlassSheet';
export type { GlassSheetProps, GlassSheetRef } from './GlassSheet';

export { GlassModal } from './GlassModal';
export type { GlassModalProps, GlassModalRef } from './GlassModal';

export { GlassBottomSheet } from './GlassBottomSheet';
export type { GlassBottomSheetProps, GlassBottomSheetRef } from './GlassBottomSheet';

// Navigation Components
export { GlassNavigationBar, GlassNavigationBarBack } from './GlassNavigationBar';
export type { GlassNavigationBarProps, GlassNavigationBarBackProps } from './GlassNavigationBar';

export { GlassTabBar } from './GlassTabBar';
export type { GlassTabBarProps, TabBarItem } from './GlassTabBar';

export { GlassSearchBar } from './GlassSearchBar';
export type { GlassSearchBarProps, GlassSearchBarRef } from './GlassSearchBar';

// Button Components
export { GlassButton, GlassIconButton } from './GlassButton';
export type { GlassButtonProps, GlassIconButtonProps, GlassButtonVariant, GlassButtonSize } from './GlassButton';

// Form Components
export { GlassInput } from './GlassInput';
export type { GlassInputProps, GlassInputRef } from './GlassInput';

export { GlassTextArea } from './GlassTextArea';
export type { GlassTextAreaProps, GlassTextAreaRef } from './GlassTextArea';

export { GlassSelect } from './GlassSelect';
export type { GlassSelectProps, GlassSelectRef, SelectOption } from './GlassSelect';

// Display Components
export { GlassAvatar } from './GlassAvatar';
export type { GlassAvatarProps, GlassAvatarSize, GlassAvatarShape } from './GlassAvatar';

export { GlassBadge, GlassChip, GlassDivider } from './GlassBadge';
export type { GlassBadgeProps, GlassChipProps, GlassDividerProps, BadgeVariant, BadgeSize, ChipVariant } from './GlassBadge';

export { GlassProgress, GlassSlider, GlassSwitch } from './GlassProgress';
export type { GlassProgressProps, GlassSliderProps, GlassSwitchProps, ProgressVariant, ProgressSize } from './GlassProgress';

// Feedback Components
export { GlassToast, GlassAlert, GlassTooltip, ToastProvider, useToast } from './GlassToast';
export type { GlassToastProps, GlassToastRef, GlassAlertProps, GlassTooltipProps, ToastType, ToastPosition, AlertType } from './GlassToast';

// Player Components
export { GlassPlayerControls } from './GlassPlayerControls';
export type { GlassPlayerControlsProps, PlayerControlsRef, PlayerState, SubtitleTrack, AudioTrack } from './GlassPlayerControls';

// Native Module
export { GlassEffectView } from './native/GlassEffectView';
export type { } from './native/GlassEffectView';

// Shaders
export { useGlassShader, GlassShaderView, GlassContainer } from './shaders/glass.skia';
export type { GlassShaderProps, GlassShaderUniforms, GlassShaderViewProps, GlassContainerProps } from './shaders/glass.skia';

// Re-export commonly used types
export type {
  GlassElevation,
  BlurRadius,
  CornerRadius,
  Spacing,
  ShadowLevel,
  ColorScheme,
  Colors,
  ThemeTokens,
} from '../../theme/tokens';

export type {
  GlassStyleOptions,
  GlassShadowStyle,
} from '../../theme/hooks';

// Theme tokens (default export for convenience)
import { themeTokens } from '../../theme/tokens';
export default themeTokens;