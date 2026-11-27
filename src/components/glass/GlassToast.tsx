/**
 * GlassToast, GlassAlert, GlassTooltip - Feedback components
 */

import React, { forwardRef, useImperativeHandle, useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Pressable,
  Image,
  ImageStyle,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { GlassButton } from './GlassButton';
import { useGlassStyle, useGlassToastAnimation, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== GlassToast ====================

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom' | 'center';

interface GlassToastProps {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

interface GlassToastRef {
  show: () => void;
  hide: () => void;
}

const GlassToast = forwardRef<GlassToastRef, GlassToastProps>(
  (
    {
      message,
      type = 'default',
      position = 'bottom',
      duration = 4000,
      action,
      icon,
      onClose,
      style,
      textStyle,
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();
    const { show: animateShow, hide: animateHide, animatedStyle } = useGlassToastAnimation();

    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const typeColors: Record<ToastType, { bg: string; text: string; icon: string }> = {
      default: { bg: 'rgba(0, 0, 0, 0.8)', text: '#FFFFFF', icon: '#FFFFFF' },
      success: { bg: 'rgba(52, 199, 89, 0.9)', text: '#FFFFFF', icon: '#FFFFFF' },
      error: { bg: 'rgba(255, 59, 48, 0.9)', text: '#FFFFFF', icon: '#FFFFFF' },
      warning: { bg: 'rgba(255, 159, 10, 0.9)', text: '#000000', icon: '#000000' },
      info: { bg: 'rgba(0, 102, 204, 0.9)', text: '#FFFFFF', icon: '#FFFFFF' },
    };

    const typeConfig = typeColors[type];

    const baseStyle = useGlassStyle({
      elevation: 'overlay',
      cornerRadius: 'lg',
      borderWidth: 0,
      tintColor: typeConfig.bg,
      opacity: isReducedTransparency ? 1 : 0.95,
      shadowLevel: 'level3',
    });

    const containerStyle = useMemo(() => [
      styles.container,
      baseStyle,
      {
        paddingHorizontal: themeTokens.spacing[4],
        paddingVertical: themeTokens.spacing[3],
        marginHorizontal: themeTokens.spacing[4],
        marginBottom: position === 'bottom' ? themeTokens.spacing[6] + (Platform.OS === 'ios' ? 20 : 0) : undefined,
        marginTop: position === 'top' ? themeTokens.spacing[6] + (Platform.OS === 'ios' ? 44 : 0) : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        gap: themeTokens.spacing[3],
        maxWidth: SCREEN_WIDTH - themeTokens.spacing[8],
      },
      style,
    ], [baseStyle, position, style]);

    const show = useCallback(() => {
      setVisible(true);
      animateShow();
      if (duration > 0) {
        hideTimer.current = setTimeout(() => {
          hide();
        }, duration);
      }
    }, [animateShow, duration]);

    const hide = useCallback(() => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      animateHide();
      setTimeout(() => {
        setVisible(false);
        runOnJS(onClose)?.();
      }, reduceMotion ? 0 : 300);
    }, [animateHide, onClose, reduceMotion]);

    useImperativeHandle(ref, () => ({ show, hide }));

    if (!visible) return null;

    return (
      <Animated.View
        style={[
          styles.wrapper,
          position === 'top' && styles.topPosition,
          position === 'center' && styles.centerPosition,
          position === 'bottom' && styles.bottomPosition,
          animatedStyle,
        ]}
        pointerEvents="box-none"
        testID={testID}
      >
        <GlassView
          elevation="overlay"
          style={containerStyle}
        >
          {icon || (
            <View style={styles.iconWrapper}>
              <Image
                source={require(`../../assets/icons/${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info-circle'}.png`)}
                style={[
                  styles.icon,
                  { tintColor: typeConfig.icon },
                ]}
              />
            </View>
          )}
          <Text
            style={[
              styles.text,
              { fontSize: themeTokens.typography.fontSize.md, color: typeConfig.text, flex: 1 },
              textStyle,
            ]}
          >
            {message}
          </Text>
          {action && (
            <GlassButton
              variant="ghost"
              size="sm"
              onPress={action.onPress}
              style={styles.actionButton}
            >
              {action.label}
            </GlassButton>
          )}
        </GlassView>
      </Animated.View>
    );
  }
);

GlassToast.displayName = 'GlassToast';

// ==================== Toast Context & Hook ====================

interface ToastContextValue {
  showToast: (message: string, options?: Partial<GlassToastProps>) => void;
  hideToast: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<GlassToastRef>(null);

  const showToast = useCallback((message: string, options: Partial<GlassToastProps> = {}) => {
    toastRef.current?.show();
    // In a real implementation, this would use a portal or state management
    // For now, we'll just log
    console.log('Toast:', message, options);
  }, []);

  const hideToast = useCallback(() => {
    toastRef.current?.hide();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <GlassToast ref={toastRef} message="" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ==================== GlassAlert ====================

export type AlertType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface GlassAlertProps {
  title: string;
  message?: string;
  type?: AlertType;
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    onPress: () => void;
  }>;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  testID?: string;
}

const GlassAlert: React.FC<GlassAlertProps> = ({
  title,
  message,
  type = 'default',
  actions = [],
  icon,
  closable = false,
  onClose,
  style,
  titleStyle,
  messageStyle,
  testID,
}) => {
  const { colors, isReducedTransparency } = useTheme();

  const typeColors: Record<AlertType, { bg: string; border: string; icon: string }> = {
    default: { bg: 'rgba(0, 102, 204, 0.1)', border: 'rgba(0, 102, 204, 0.3)', icon: colors.primary },
    success: { bg: 'rgba(52, 199, 89, 0.1)', border: 'rgba(52, 199, 89, 0.3)', icon: colors.success },
    error: { bg: 'rgba(255, 59, 48, 0.1)', border: 'rgba(255, 59, 48, 0.3)', icon: colors.error },
    warning: { bg: 'rgba(255, 159, 10, 0.1)', border: 'rgba(255, 159, 10, 0.3)', icon: colors.warning },
    info: { bg: 'rgba(0, 102, 204, 0.1)', border: 'rgba(0, 102, 204, 0.3)', icon: colors.primary },
  };

  const typeConfig = typeColors[type];

  const baseStyle = useGlassStyle({
    elevation: 'surface',
    cornerRadius: 'lg',
    borderWidth: 1,
    borderColor: typeConfig.border,
    tintColor: typeConfig.bg,
    opacity: isReducedTransparency ? 1 : undefined,
    shadowLevel: 'level1',
  });

  const containerStyle = useMemo(() => [
    styles.alertContainer,
    baseStyle,
    {
      padding: themeTokens.spacing[4],
      gap: themeTokens.spacing[3],
    },
    style,
  ], [baseStyle, style]);

  const defaultIcons: Record<AlertType, React.ReactNode> = {
    default: <Image source={require('../../assets/icons/info-circle.png')} style={[styles.alertIcon, { tintColor: typeConfig.icon }]} />,
    success: <Image source={require('../../assets/icons/check-circle.png')} style={[styles.alertIcon, { tintColor: typeConfig.icon }]} />,
    error: <Image source={require('../../assets/icons/x-circle.png')} style={[styles.alertIcon, { tintColor: typeConfig.icon }]} />,
    warning: <Image source={require('../../assets/icons/alert-triangle.png')} style={[styles.alertIcon, { tintColor: typeConfig.icon }]} />,
    info: <Image source={require('../../assets/icons/info-circle.png')} style={[styles.alertIcon, { tintColor: typeConfig.icon }]} />,
  };

  return (
    <GlassView
      elevation="surface"
      style={containerStyle}
      testID={testID}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIconWrapper}>
          {icon ?? defaultIcons[type]}
        </View>
        <View style={styles.alertContent} flex={1}>
          <Text
            style={[
              styles.alertTitle,
              { fontSize: themeTokens.typography.fontSize.md, fontWeight: themeTokens.typography.fontWeight.semibold, color: colors.onSurface },
              titleStyle,
            ]}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={[
                styles.alertMessage,
                { fontSize: themeTokens.typography.fontSize.sm, color: colors.onSurfaceVariant, marginTop: themeTokens.spacing[1] },
                messageStyle,
              ]}
            >
              {message}
            </Text>
          )}
        </View>
        {closable && (
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="Fechar">
            <Image
              source={require('../../assets/icons/x.png')}
              style={[
                styles.closeIcon,
                { tintColor: colors.onSurfaceVariant },
              ]}
            />
          </Pressable>
        )}
      </View>
      {actions.length > 0 && (
        <View style={styles.alertActions}>
          {actions.map((action, index) => (
            <GlassButton
              key={index}
              variant={action.variant ?? 'primary'}
              size="sm"
              onPress={action.onPress}
              style={styles.actionButton}
            >
              {action.label}
            </GlassButton>
          ))}
        </View>
      )}
    </GlassView>
  );
};

GlassAlert.displayName = 'GlassAlert';

// ==================== GlassTooltip ====================

interface GlassTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const GlassTooltip: React.FC<GlassTooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
  style,
  contentStyle,
  textStyle,
  testID,
}) => {
  const { colors, isReducedTransparency } = useTheme();
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const baseStyle = useGlassStyle({
    elevation: 'overlay',
    cornerRadius: 'md',
    borderWidth: 0,
    tintColor: isReducedTransparency ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)',
    opacity: isReducedTransparency ? 1 : undefined,
    shadowLevel: 'level3',
  });

  const tooltipStyle = useMemo(() => [
    styles.tooltipContainer,
    baseStyle,
    {
      paddingHorizontal: themeTokens.spacing[3],
      paddingVertical: themeTokens.spacing[2],
    },
    contentStyle,
  ], [baseStyle, contentStyle]);

  const show = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 100);
  };

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <View style={style} testID={testID}>
      <Pressable
        onHoverIn={show}
        onHoverOut={hide}
        onPressIn={show}
        onPressOut={hide}
        accessibilityRole="tooltip"
      >
        {children}
      </Pressable>
      {visible && (
        <Animated.View
          style={[
            styles.tooltipWrapper,
            position === 'top' && styles.tooltipTop,
            position === 'bottom' && styles.tooltipBottom,
            position === 'left' && styles.tooltipLeft,
            position === 'right' && styles.tooltipRight,
          ]}
          pointerEvents="none"
        >
          <GlassView
            elevation="overlay"
            style={tooltipStyle}
          >
            <Text
              style={[
                styles.tooltipText,
                { fontSize: themeTokens.typography.fontSize.sm, color: '#FFFFFF' },
                textStyle,
              ]}
            >
              {content}
            </Text>
          </GlassView>
          <View style={[
            styles.tooltipArrow,
            position === 'top' && { borderTopColor: isReducedTransparency ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)' },
            position === 'bottom' && { borderBottomColor: isReducedTransparency ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)' },
            position === 'left' && { borderLeftColor: isReducedTransparency ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)' },
            position === 'right' && { borderRightColor: isReducedTransparency ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)' },
          ]} />
        </Animated.View>
      )}
    </View>
  );
};

GlassTooltip.displayName = 'GlassTooltip';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: themeTokens.zIndex.toast,
    pointerEvents: 'none',
  },
  topPosition: {
    top: 0,
    alignItems: 'center',
  },
  centerPosition: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPosition: {
    bottom: 0,
    alignItems: 'center',
  },
  container: {
    borderRadius: themeTokens.cornerRadii.lg,
  },
  iconWrapper: {
    flexShrink: 0,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    flex: 1,
  },
  actionButton: {
    marginLeft: themeTokens.spacing[1],
  },
  alertContainer: {
    borderRadius: themeTokens.cornerRadii.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: themeTokens.spacing[3],
  },
  alertIconWrapper: {
    flexShrink: 0,
    marginTop: 2,
  },
  alertIcon: {
    width: 24,
    height: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {},
  alertMessage: {},
  closeButton: {
    padding: themeTokens.spacing[1],
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: themeTokens.spacing[2],
    marginTop: themeTokens.spacing[2],
    paddingTop: themeTokens.spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tooltipWrapper: {
    position: 'absolute',
    zIndex: themeTokens.zIndex.tooltip,
  },
  tooltipTop: {
    bottom: '100%',
    left: '50%',
    marginLeft: -80,
    marginBottom: 8,
  },
  tooltipBottom: {
    top: '100%',
    left: '50%',
    marginLeft: -80,
    marginTop: 8,
  },
  tooltipLeft: {
    right: '100%',
    top: '50%',
    marginRight: 8,
    marginTop: -16,
  },
  tooltipRight: {
    left: '100%',
    top: '50%',
    marginLeft: 8,
    marginTop: -16,
  },
  tooltipContainer: {
    borderRadius: themeTokens.cornerRadii.md,
    minWidth: 160,
    maxWidth: 280,
  },
  tooltipText: {
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: 6,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export { GlassToast, GlassAlert, GlassTooltip, ToastProvider, useToast };