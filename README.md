# Liquid Glass Design System

**iOS 26 glassmorphism design system for React Native + Expo**

A production-ready, token-driven design system implementing Apple's Liquid Glass (iOS 26) specification with native `UIVisualEffectView` on iOS and Skia shader fallback for Android/Web.

## ✨ Features

- **🎨 Design Tokens** - Complete token system (colors, spacing, typography, shadows, elevations, blur radii, corner radii)
- **🔮 Native iOS Glass** - `UIVisualEffectView` with dynamic blur/tint via native module
- **🎯 Cross-Platform Fallback** - Skia shader for Android/Web with refraction, fresnel, specular highlights
- **♿ Accessibility First** - Reduce transparency, reduce motion, dynamic type support
- **🎬 Animated Transitions** - Theme switching, component animations with Reanimated 3
- **📦 25+ Components** - Cards, sheets, modals, navigation, forms, feedback, player controls
- **🔄 Migration Helper** - Map Material Design/Android styles to Glass equivalents

## 📦 Installation

```bash
# Core dependencies
npm install react-native-reanimated@^3.6.0 react-native-gesture-handler@^2.14.0 expo-blur@^12.0.0 @shopify/react-native-skia@^0.1.200 react-native-svg@^14.1.0

# Install the design system
npm install liquid-glass-design-system
```

### Expo Config Plugin

Add to your `app.config.js`:

```javascript
plugins: [
  'expo-build-properties',
  [
    './node_modules/liquid-glass-design-system/src/components/glass/native/expo-plugin.js',
    {
      moduleName: 'LiquidGlass',
      swiftVersion: '5.9',
    },
  ],
  'react-native-reanimated',
  'react-native-gesture-handler',
],
```

### iOS Setup

```bash
cd ios && pod install
```

Requires iOS 17.0+ for native glass (iOS 26 for full Liquid Glass features).

## 🚀 Quick Start

```tsx
import { ThemeProvider, GlassCard, GlassButton, GlassInput, useColors } from 'liquid-glass-design-system';

export default function App() {
  return (
    <ThemeProvider>
      <MyScreen />
    </ThemeProvider>
  );
}

function MyScreen() {
  const colors = useColors();
  
  return (
    <GlassCard variant="elevated" style={{ padding: 20, margin: 16 }}>
      <GlassInput
        label="Email"
        placeholder="seu@email.com"
        style={{ marginBottom: 16 }}
      />
      <GlassButton variant="primary" fullWidth onPress={() => {}}>
        Entrar
      </GlassButton>
    </GlassCard>
  );
}
```

## 🏗️ Architecture

```
src/
├── theme/
│   ├── tokens.ts          # Design tokens (colors, spacing, typography, etc.)
│   ├── themeProvider.tsx  # Theme context with light/dark/system
│   └── hooks.ts           # useGlassStyle, useTheme, useAnimatedColors, etc.
├── components/glass/
│   ├── GlassView.tsx      # Base glass component (native + expo-blur)
│   ├── GlassCard.tsx      # Elevated cards
│   ├── GlassSheet.tsx     # Bottom sheets
│   ├── GlassModal.tsx     # Centered modals
│   ├── GlassBottomSheet.tsx # iOS-style bottom sheets
│   ├── GlassNavigationBar.tsx
│   ├── GlassTabBar.tsx
│   ├── GlassSearchBar.tsx
│   ├── GlassButton.tsx    # Primary, secondary, ghost, danger, outline
│   ├── GlassIconButton.tsx
│   ├── GlassInput.tsx
│   ├── GlassTextArea.tsx
│   ├── GlassSelect.tsx
│   ├── GlassAvatar.tsx
│   ├── GlassBadge.tsx
│   ├── GlassChip.tsx
│   ├── GlassDivider.tsx
│   ├── GlassProgress.tsx  # Linear, circular, ring
│   ├── GlassSlider.tsx
│   ├── GlassSwitch.tsx
│   ├── GlassToast.tsx
│   ├── GlassAlert.tsx
│   ├── GlassTooltip.tsx
│   ├── GlassPlayerControls.tsx # Custom anime player
│   ├── native/
│   │   ├── GlassEffectView.swift       # Native UIVisualEffectView
│   │   ├── GlassEffectViewManager.m    # RCTViewManager bridge
│   │   ├── GlassEffectViewBridge.swift # Event emitter
│   │   └── expo-plugin.js              # Expo config plugin
│   ├── shaders/
│   │   └── glass.skia.ts   # Skia runtime effect for glass
│   └── index.ts            # Barrel exports
└── utils/
    └── migration.ts        # Material Design → Glass mapping
```

## 🎨 Design Tokens

### Glass Elevations
```typescript
surface:   { blurRadius: 40, opacity: 0.72, tintColor: 'rgba(255,255,255,0.18)' }
elevated:  { blurRadius: 60, opacity: 0.80, tintColor: 'rgba(255,255,255,0.24)' }
overlay:   { blurRadius: 80, opacity: 0.88, tintColor: 'rgba(255,255,255,0.32)' }
```

### Blur Radii
```typescript
ultraThin: 10, thin: 20, regular: 40, thick: 60, chrome: 80
```

### Corner Radii
```typescript
xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999
```

### Shadows (iOS 26 Spec)
```typescript
level0: none
level1: 2px blur 8px, 4% opacity
level2: 8px blur 24px, 8% opacity
level3: 16px blur 40px, 12% opacity
level4: 24px blur 56px, 16% opacity
```

## 🧩 Components

### GlassView (Base)
```tsx
<GlassView
  elevation="surface"      // surface | elevated | overlay
  blurRadius="regular"     // ultraThin | thin | regular | thick | chrome
  cornerRadius="md"        // xs | sm | md | lg | xl | full
  tintColor="rgba(...)"    // Custom tint
  opacity={0.8}
  interactive={true}
  shadowLevel="level1"
>
  <Content />
</GlassView>
```

### GlassCard
```tsx
<GlassCard
  variant="elevated"       // surface | elevated | outlined
  padding={4}              // spacing token
  pressable={true}
  onPress={handlePress}
  hoverable={false}
>
  <GlassCardSection grow>Content</GlassCardSection>
  <GlassCardSection>Actions</GlassCardSection>
</GlassCard>
```

### GlassSheet / GlassBottomSheet
```tsx
<GlassBottomSheet
  snapPoints={[0.3, 0.6, 0.9]}
  initialSnap={1}
  showHandle={true}
  backdropEnabled={true}
  onClose={handleClose}
  onSnapChange={handleSnapChange}
>
  <Content />
</GlassBottomSheet>
```

### GlassButton
```tsx
<GlassButton
  variant="primary"        // primary | secondary | ghost | danger | outline
  size="md"                // sm | md | lg
  fullWidth={false}
  loading={false}
  disabled={false}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  onPress={handlePress}
>
  Button Text
</GlassButton>
```

### GlassInput
```tsx
<GlassInput
  label="Email"
  placeholder="seu@email.com"
  value={value}
  onChangeText={setValue}
  error={error}
  helperText="Helper text"
  leftElement={<Icon />}
  rightElement={<Icon />}
  secureTextEntry={false}
  showTogglePassword={true}
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
```

### GlassPlayerControls (Custom)
```tsx
<GlassPlayerControls
  state={{
    isPlaying: true,
    currentTime: 45,
    duration: 1200,
    buffered: 0.5,
    volume: 0.8,
    muted: false,
    fullscreen: false,
    playbackRate: 1,
    quality: '1080p',
    qualities: ['480p', '720p', '1080p'],
    subtitles: [],
    selectedSubtitle: -1,
    audioTracks: [],
    selectedAudioTrack: 0,
  }}
  onPlayPause={togglePlay}
  onSeek={seek}
  onSeekComplete={seekComplete}
  onVolumeChange={setVolume}
  onMuteToggle={toggleMute}
  onFullscreenToggle={toggleFullscreen}
  onPlaybackRateChange={setRate}
  onQualityChange={setQuality}
  onSubtitleChange={setSubtitle}
  onAudioTrackChange={setAudioTrack}
  onNextEpisode={nextEp}
  onPreviousEpisode={prevEp}
  onSkipForward={skipForward}
  onSkipBackward={skipBackward}
  onPictureInPicture={pip}
  onAirPlay={airplay}
  onDownload={download}
  onShare={share}
  autoHideDelay={3000}
/>
```

## 🪝 Hooks

```tsx
import { useTheme, useColors, useGlassStyle, useGlassAnimation } from 'liquid-glass-design-system';

function MyComponent() {
  const { colors, tokens, setColorScheme, toggleColorScheme } = useTheme();
  const colors = useColors();
  const isDark = useResolvedColorScheme() === 'dark';
  const reducedTransparency = useIsReducedTransparency();
  
  const glassStyle = useGlassStyle({
    elevation: 'elevated',
    blurRadius: 'regular',
    cornerRadius: 'lg',
  });
  
  const animatedStyle = useAnimatedGlassStyle({ elevation: 'overlay' });
  
  const { timing, spring, timingConfig, springConfig, reduceMotion } = useGlassAnimation();
  const { onPressIn, onPressOut, animatedStyle: pressStyle } = useGlassPressAnimation(0.96);
  const { onHoverIn, onHoverOut, animatedStyle: hoverStyle } = useGlassHoverAnimation(-2);
  
  return <GlassView style={glassStyle} {...pressStyle} />;
}
```

## 🌙 Theming

```tsx
import { ThemeProvider, useTheme } from 'liquid-glass-design-system';

// Light/Dark/System with animated transitions
<ThemeProvider defaultColorScheme="system">
  <App />
</ThemeProvider>

// In component
const { colorScheme, setColorScheme, toggleColorScheme } = useTheme();
// colorScheme: 'light' | 'dark' | 'system'
// setColorScheme('dark') | toggleColorScheme()
```

## ♿ Accessibility

- **Reduce Transparency** - Automatically detects and disables blur/opacity
- **Reduce Motion** - Disables spring animations, uses instant transitions
- **Dynamic Type** - Supports system font scaling
- **VoiceOver/TalkBack** - Proper accessibility labels and roles
- **High Contrast** - Semantic colors adapt automatically

```tsx
const isReducedTransparency = useIsReducedTransparency();
const reduceMotion = useReducedMotion();

// Components automatically respect these settings
<GlassView elevation="surface" /> // Opacity becomes 1 if reduce transparency
<GlassButton onPress={fn} />      // No spring animation if reduce motion
```

## 🔄 Migration from Material Design

```typescript
import { migrateStyle, createGlassViewProps, componentNameMap } from 'liquid-glass-design-system/utils/migration';

// Convert Android elevation to Glass elevation
const glassElevation = elevationMap[4]; // 'elevated'

// Convert StyleSheet
const glassStyles = migrateStyleSheet(materialStyles);

// Map component names
const glassComponent = componentNameMap['Card']; // 'GlassCard'
```

### Common Mappings

| Material Component | Glass Component |
|-------------------|-----------------|
| `Card` (elevation 4) | `GlassCard variant="elevated"` |
| `FAB` | `GlassButton variant="primary" size="lg"` |
| `TextField` | `GlassInput` |
| `BottomNavigation` | `GlassTabBar` |
| `Dialog` | `GlassModal` |
| `BottomSheet` | `GlassBottomSheet` |
| `Snackbar` | `GlassToast` |
| `Slider` | `GlassSlider` |
| `Switch` | `GlassSwitch` |
| `Avatar` | `GlassAvatar` |
| `Chip` | `GlassChip` |

## 🎨 Customization

### Extend Tokens

```typescript
import { themeTokens } from 'liquid-glass-design-system';

const customTokens = {
  ...themeTokens,
  lightColors: {
    ...themeTokens.lightColors,
    primary: '#MY_BRAND_COLOR',
  },
  darkColors: {
    ...themeTokens.darkColors,
    primary: '#MY_BRAND_COLOR_DARK',
  },
};
```

### Custom Glass Shader

```tsx
import { GlassShaderView } from 'liquid-glass-design-system/shaders/glass.skia';

<GlassShaderView
  elevation="overlay"
  blurRadius={60}
  tintColor="rgba(255, 0, 0, 0.2)"
  borderRadius={24}
  animated={true}
  style={{ width: 300, height: 200 }}
>
  <CustomContent />
</GlassShaderView>
```

## 📱 Platform Support

| Platform | Native Blur | Skia Shader | Expo Blur | Status |
|----------|-------------|-------------|-----------|--------|
| iOS 17+ | ✅ UIVisualEffectView | ✅ | ✅ | Full |
| iOS 26+ | ✅ Liquid Glass | ✅ | ✅ | Full + New APIs |
| Android 14+ | ❌ | ✅ | ✅ | Full |
| Web | ❌ | ✅ (WebGL) | ✅ CSS backdrop-filter | Full |

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new components
4. Ensure accessibility compliance
5. Submit PR

## 📚 Resources

- [iOS 26 Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [React Native Reanimated 3](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)

---

Built with ❤️ for Tomato Animes