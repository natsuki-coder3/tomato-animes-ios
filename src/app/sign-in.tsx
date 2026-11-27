/**
 * Tomato Animes - Sign In Screen
 * Authentication screen with email/password and social login
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GlassCardSection, GlassButton, GlassInput, GlassDivider } from '@components/glass';
import { useColors } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/authStore';
import { api } from '@services/api';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing } from 'react-native-reanimated';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const socialOpacity = useSharedValue(0);
  const socialTranslateY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const socialStyle = useAnimatedStyle(() => ({
    opacity: socialOpacity.value,
    transform: [{ translateY: socialTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  React.useEffect(() => {
    containerOpacity.value = withTiming(1, { duration: 400 });
    containerTranslateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    formOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    formTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 150 }));
    socialOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    socialTranslateY.value = withDelay(400, withSpring(0, { damping: 20, stiffness: 150 }));
    footerOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await signIn(email, password, rememberMe);
      router.replace('/(tabs)/home');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/home');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)/home');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, containerStyle]}>
            {/* Header */}
            <View style={styles.header} >
              <GlassButton variant="ghost" size="sm" onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
              </GlassButton>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Entrar</Text>
              <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View
                entering={Animated.timing(1, { duration: 300 })}
                exiting={Animated.timing(0, { duration: 300 })}
                style={styles.errorContainer}
              >
                <GlassCard variant="surface" style={styles.errorCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                    <Text style={{ color: colors.error, flex: 1 }}>{error}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            {/* Form */}
            <Animated.View style={[styles.form, formStyle]}>
              <GlassCard variant="surface" style={styles.formCard}>
                <GlassInput
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Ionicons name="mail-outline" size={22} color={colors.onSurfaceVariant} />}
                  error={error?.includes('email') ? error : undefined}
                  style={{ marginBottom: 16 }}
                />
                <GlassInput
                  label="Senha"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  showTogglePassword={true}
                  autoComplete="password"
                  leftIcon={<Ionicons name="lock-closed-outline" size={22} color={colors.onSurfaceVariant} />}
                  error={error?.includes('senha') || error?.includes('password') ? error : undefined}
                />
              </GlassCard>

              {/* Remember Me & Forgot Password */}
              <View style={styles.rememberRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <GlassInput
                    type="checkbox"
                    value={rememberMe.toString()}
                    onChangeText={(value) => setRememberMe(value === 'true')}
                    style={{ width: 20, height: 20 }}
                  />
                  <Text style={styles.rememberText}>Lembrar-me</Text>
                </View>
                <GlassButton variant="ghost" size="sm" onPress={() => router.push('/forgot-password')}>
                  <Text style={{ color: colors.primary, fontSize: 14 }}>Esqueci a senha</Text>
                </GlassButton>
              </View>

              {/* Sign In Button */}
              <GlassButton
                variant="primary"
                fullWidth
                size="lg"
                loading={isLoading}
                onPress={handleSignIn}
                style={styles.signInButton}
              >
                <Ionicons name="log-in-outline" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
                Entrar
              </GlassButton>
            </Animated.View>

            {/* Divider */}
            <Animated.View style={[styles.dividerContainer, socialStyle]}>
              <GlassDivider style={{ flex: 1 }} />
              <Text style={styles.dividerText}>ou continue com</Text>
              <GlassDivider style={{ flex: 1 }} />
            </Animated.View>

            {/* Social Buttons */}
            <Animated.View style={[styles.socialButtons, socialStyle]}>
              <View style={styles.socialRow}>
                <GlassButton
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  onPress={handleGoogleSignIn}
                  leftIcon={<Ionicons name="logo-google" size={22} color={colors.onSurface} />}
                >
                  Google
                </GlassButton>
                <GlassButton
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  onPress={handleAppleSignIn}
                  leftIcon={<Ionicons name="logo-apple" size={22} color={colors.onSurface} />}
                >
                  Apple
                </GlassButton>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, footerStyle]}>
              <Text style={styles.footerText}>
                Não tem conta?{' '}
                <Text style={styles.footerLink} onPress={() => router.push('/sign-up')}>
                  Cadastre-se
                </Text>
              </Text>
              <Text style={styles.termsText}>
                Ao continuar, você concorda com nossos{' '}
                <Text style={styles.footerLink}>Termos de Uso</Text>{' '}
                e{' '}
                <Text style={styles.footerLink}>Política de Privacidade</Text>
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  content: {
    gap: 24,
  },
  header: {
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  errorContainer: {
    marginBottom: 8,
  },
  errorCard: {
    padding: 12,
  },
  form: {
    gap: 16,
  },
  formCard: {
    padding: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  signInButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  socialButtons: {
    gap: 12,
    marginTop: 8,
  },
  socialRow: {
    gap: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  footerLink: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  termsText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

// Add missing imports
import { Text } from 'react-native';