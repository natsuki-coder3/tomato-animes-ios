/**
 * Jest Setup for Liquid Glass Design System
 * Mocks native modules and provides test utilities
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Add missing APIs for testing
  Reanimated.useSharedValue = jest.fn((initial) => ({
    value: initial,
  }));

  Reanimated.useAnimatedStyle = jest.fn((callback) => callback());
  Reanimated.useAnimatedGestureHandler = jest.fn((handlers) => handlers);
  Reanimated.withTiming = jest.fn((to, config) => to);
  Reanimated.withSpring = jest.fn((to, config) => to);
  Reanimated.interpolateColor = jest.fn((value, input, output) => output[0]);
  Reanimated.runOnJS = jest.fn((fn) => fn);
  Reanimated.useAnimatedReaction = jest.fn();
  Reanimated.useDerivedValue = jest.fn((fn) => fn());

  return Reanimated;
});

// Mock Expo Blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style, intensity, ...props }) => (
    <View style={style} {...props}>
      {children}
    </View>
  ),
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureDetector: ({ children, gesture, ...props }) => (
      <View {...props}>{children}</View>
    ),
    Gesture: {
      Pan: () => ({
        onStart: jest.fn(),
        onActive: jest.fn(),
        onEnd: jest.fn(),
      }),
      Tap: () => ({
        onStart: jest.fn(),
        onEnd: jest.fn(),
      }),
    },
    Directions: {},
    State: {},
  };
});

// Mock React Native SVG
jest.mock('react-native-svg', () => {
  const View = require('react-native').View;
  return {
    Svg: View,
    Circle: View,
    Rect: View,
    Path: View,
    G: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Image: View,
    Symbol: View,
    Use: View,
    Marker: View,
    Mask: View,
    ClipPath: View,
    Pattern: View,
    ForeignObject: View,
  };
});

// Mock React Native Skia
jest.mock('@shopify/react-native-skia', () => {
  const View = require('react-native').View;
  return {
    Canvas: View,
    Group: View,
    Path: View,
    Rect: View,
    Circle: View,
    RoundedRect: View,
    Paint: jest.fn(() => ({
      setAntiAlias: jest.fn(),
      setStyle: jest.fn(),
      setColor: jest.fn(),
      setShader: jest.fn(),
      setMaskFilter: jest.fn(),
    })),
    Skia: {
      Path: jest.fn(() => ({
        addRect: jest.fn(),
        addRRect: jest.fn(),
        addCircle: jest.fn(),
      })),
      XYWHRect: jest.fn((x, y, w, h) => ({ x, y, w, h })),
      RRect: jest.fn((rect, radius) => ({ rect, radius })),
      RuntimeEffect: {
        Make: jest.fn(() => ({
          makeShader: jest.fn(() => ({})),
        })),
      },
      MaskFilter: {
        MakeBlur: jest.fn(() => ({})),
      },
      BlurStyle: {
        Normal: 'normal',
        Solid: 'solid',
        Outer: 'outer',
        Inner: 'inner',
      },
    },
    useValue: jest.fn((initial) => ({ current: initial })),
    useComputedValue: jest.fn((fn) => ({ current: fn() })),
    useClockValue: jest.fn(() => ({ current: 0 })),
    useTouchHandler: jest.fn(),
    vec: jest.fn(),
    vec2: jest.fn(),
    vec3: jest.fn(),
    vec4: jest.fn(),
  };
});

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  useFonts: jest.fn(() => [true, null]),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  createAssetAsync: jest.fn(),
  getAssetsAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
  Video: {
    View: 'VideoView',
  },
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children, style, ...props }) => (
    <View style={style} {...props}>
      {children}
    </View>
  ),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  modelName: 'iPhone 15 Pro',
  osName: 'iOS',
  osVersion: '17.0',
  manufacturer: 'Apple',
  brand: 'Apple',
  deviceName: 'iPhone',
  deviceYearClass: 2023,
  totalMemory: 8 * 1024 * 1024 * 1024,
  supportedCpuArchitectures: ['arm64'],
  getDeviceTypeAsync: jest.fn(() => Promise.resolve('phone')),
  getManufacturerAsync: jest.fn(() => Promise.resolve('Apple')),
  getModelNameAsync: jest.fn(() => Promise.resolve('iPhone 15 Pro')),
  getOsVersionAsync: jest.fn(() => Promise.resolve('17.0')),
}));

jest.mock('expo-application', () => ({
  applicationId: 'com.tomatoanimes.app',
  applicationName: 'Tomato Animes',
  buildVersion: '1',
  version: '1.0.0',
  nativeApplicationVersion: '1',
  nativeBuildVersion: '1',
  installationId: 'test-installation-id',
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'Tomato Animes',
    slug: 'tomato-animes',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tomatoanimes.app',
      buildNumber: '1',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.tomatoanimes.app',
      versionCode: 1,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      liquidGlass: {
        useNativeBlur: true,
        useSkiaFallback: true,
        defaultElevation: 'surface',
        animationDuration: 250,
        respectReduceTransparency: true,
        respectReduceMotion: true,
      },
    },
  },
  getWebViewUserAgentAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `myapp://${path}`),
  parse: jest.fn((url) => ({ path: url })),
  parseInitialURLAsync: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-share-intent', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn(),
  resolveActivityAsync: jest.fn(),
  getIntentAsync: jest.fn(),
}));

jest.mock('expo-background-task', () => ({
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  getRegisteredTasksAsync: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  getRegisteredTasksAsync: jest.fn(),
  getTaskOptionsAsync: jest.fn(),
  TaskManager: {},
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  bundleDirectory: '/mock/bundle/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  downloadAsync: jest.fn(),
  createDownloadResumable: jest.fn(),
  getInfoAsync: jest.fn(),
  getFreeDiskStorageAsync: jest.fn(),
  getTotalDiskCapacityAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn(),
  digestStringAsync: jest.fn(),
  randomUUID: jest.fn(() => 'test-uuid'),
}));

jest.mock('expo-random', () => ({
  getRandomBytes: jest.fn(),
  getRandomValues: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  locale: 'pt-BR',
  locales: ['pt-BR', 'en-US'],
  region: 'BR',
  isoCurrencyCode: 'BRL',
  timezone: 'America/Sao_Paulo',
  getCalendars: jest.fn(),
  getNumberFormatSettings: jest.fn(),
  getTemperatureUnit: jest.fn(() => 'celsius'),
}));

// Mock React Native AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      announceForAccessibility: jest.fn(),
      setAccessibilityFocus: jest.fn(),
    },
    Appearance: {
      getColorScheme: jest.fn(() => 'light'),
      addChangeListener: jest.fn(),
      removeChangeListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      Version: '17.0',
      select: jest.fn((obj) => obj.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    StyleSheet: {
      hairlineWidth: 0.5,
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
      absoluteFill: {},
      absoluteFillObject: {},
    },
  };
});

// Global test utilities
global.__TEST__ = true;

// Silence console.warn for specific warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes?.('react-native-reanimated') ||
    args[0]?.includes?.('expo-blur') ||
    args[0]?.includes?.('react-native-gesture-handler')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};