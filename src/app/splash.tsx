/**
 * Tomato Animes - Splash Screen
 * Initial loading screen with logo animation
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassView, GlassProgress } from '@components/glass';
import { useColors } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence, Easing } from 'react-native-reanimated';
import { useAuthStore } from '@store/authStore';
import { initializeApp } from '@services/appInit';

export default function SplashScreen() {
  const colors = useColors();
  const router = useRouter();
  const { initializeAuth } = useAuthStore();

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  useEffect(() => {
    const initApp = async () => {
      // Animate logo entrance
      logoScale.value = withTiming(1.1, { duration: 600, easing: Easing.out(Easing.quad) });
      logoOpacity.value = withTiming(1, { duration: 600 });

      // Animate text
      textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

      // Simulate loading progress
      progress.value = withTiming(30, { duration: 800 });
      await new Promise(r => setTimeout(r, 800));

      progress.value = withTiming(60, { duration: 600 });

      // Initialize app services
      await initializeApp();
      await initializeAuth();

      progress.value = withTiming(100, { duration: 400 });
      await new Promise(r => setTimeout(r, 400));

      // Navigate to next screen
      logoScale.value = withTiming(0.8, { duration: 300, easing: Easing.in(Easing.quad) });
      logoOpacity.value = withTiming(0, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 200 });

      await new Promise(r => setTimeout(r, 300));

      router.replace('/welcome');
    };

    initApp();
  }, [router]);

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <View style={styles.logoContainer}>
          <Ionicons name="logo-tomato" size={100} color={colors.primary} />
          {/* Or use an actual logo image */}
          {/* <Image source={require('@assets/images/splash-logo.png')} style={{ width: 120, height: 120 }} /> */}
        </View>
        <Animated.View style={[styles.appName, textStyle]}>
          <Text style={styles.appNameText}>Tomato Animes</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      <View style={styles.versionText}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
          Versão 1.6.1
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  appName: {
    marginTop: 16,
  },
  appNameText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 48,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 2,
  },
  versionText: {
    position: 'absolute',
    bottom: 60,
  },
});

// Add missing imports
import { Text } from 'react-native';