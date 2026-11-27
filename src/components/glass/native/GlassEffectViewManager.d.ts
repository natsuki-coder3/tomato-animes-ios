/**
 * TypeScript declarations for Liquid Glass Native Module
 */

import { ViewProps } from 'react-native';

export interface GlassEffectViewProps extends ViewProps {
  /** Blur style for the glass effect */
  blurStyle?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chrome';

  /** Blur radius in points (maps to blur style) */
  blurRadius?: number;

  /** Tint color for the glass (rgba string) */
  tintColor?: string;

  /** Corner radius in points */
  cornerRadius?: number;

  /** Whether the view handles touch events */
  interactive?: boolean;

  /** Whether to enable vibrancy effect for content */
  vibrancyEnabled?: boolean;

  /** Shadow level (0-4 matching iOS 26 spec) */
  shadowLevel?: 0 | 1 | 2 | 3 | 4;
}

declare global {
  namespace ReactNative {
    interface NativeModulesStatic {
      LiquidGlass: {
        isReduceTransparencyEnabled(): Promise<boolean>;
        isReduceMotionEnabled(): Promise<boolean>;
        constants: {
          BlurStyles: {
            ultraThin: string;
            thin: string;
            regular: string;
            thick: string;
            chrome: string;
          };
          ShadowLevels: {
            level0: number;
            level1: number;
            level2: number;
            level3: number;
            level4: number;
          };
          isIOS26OrLater: boolean;
        };
      };
    }
  }
}

export {};