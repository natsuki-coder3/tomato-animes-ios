/**
 * Tomato Animes - Welcome Screen
 * Onboarding/welcome screen with features overview
 */

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GlassButton, GlassView } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing } from 'react-native-reanimated';

const FEATURES = [
  {
    icon: 'videocam-outline',
    title: 'Player Avançado',
    description: 'Suporte a 1080p, legendas múltiplas, velocidades personalizadas e Picture-in-Picture',
  },
  {
    icon: 'download-outline',
    title: 'Downloads Offline',
    description: 'Baixe seus animes favoritos para assistir sem internet, com gerenciamento inteligente de armazenamento',
  },
  {
    icon: 'sync-outline',
    title: 'Sincronização',
    description: 'Continue assistindo de onde parou em qualquer dispositivo com sincronização na nuvem',
  },
  {
    icon: 'search-outline',
    title: 'Busca Inteligente',
    description: 'Encontre animes por gênero, estúdio, ano, popularidade e muito mais',
  },
  {
    icon: 'notifications-outline',
    title: 'Notificações',
    description: 'Receba alertas de novos episódios dos seus animes favoritos',
  },
  {
    icon: 'moon-outline',
    title: 'Design Liquid Glass',
    description: 'Interface moderna com glassmorphism nativo do iOS 26, tema escuro/claro automático',
  },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isReducedMotion } = useTheme();

  const containerOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const featuresTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  React.useEffect(() => {
    if (isReducedMotion) {
      containerOpacity.value = 1;
      logoScale.value = 1;
      logoOpacity.value = 1;
      featuresOpacity.value = 1;
      featuresTranslateY.value = 0;
      buttonOpacity.value = 1;
      buttonTranslateY.value = 0;
      return;
    }

    containerOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 500 });
    featuresOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    featuresTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 150 }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    buttonTranslateY.value = withDelay(600, withSpring(0, { damping: 20, stiffness: 150 }));
  }, [isReducedMotion]);

  const handleGetStarted = () => {
    router.replace('/sign-in');
  };

  const handleSkip = () => {
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Logo */}
        <Animated.View style={logoStyle}>
          <View style={styles.logoContainer}>
            <GlassView elevation="overlay" style={styles.logoGlass} cornerRadius="full">
              <Ionicons name="logo-tomato" size={70} color={colors.primary} />
              {/* <Image source={require('@assets/images/app-icon.png')} style={{ width: 80, height: 80 }} /> */}
            </GlassView>
          </View>
          <Text style={styles.appTitle}>Tomato Animes</Text>
          <Text style={styles.appSubtitle}>Sua nova experiência de anime</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresContainer, featuresStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}
          >
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={styles.featureCard}
                entering={Animated.delay(index * 100, Animated.spring(1, { damping: 20, stiffness: 150 }))}
                exiting={Animated.spring(0, { damping: 20, stiffness: 150 })}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={28} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <GlassButton variant="primary" fullWidth size="lg" onPress={handleGetStarted}>
            <Ionicons name="arrow-forward-outline" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
            Começar
          </GlassButton>
          <GlassButton variant="ghost" fullWidth size="lg" style={{ marginTop: 12 }} onPress={handleSkip}>
            Pular por enquanto
          </GlassButton>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoGlass: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  featuresContainer: {
    flex: 1,
    marginTop: 20,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
});

// Add missing imports
import { Text } from 'react-native';