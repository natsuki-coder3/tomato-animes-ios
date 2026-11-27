/**
 * Tomato Animes - Auth Hooks
 * Convenience hooks for authentication
 */

import { useAuthStore } from '@store/authStore';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    refreshAccessToken,
    updateProfile,
    updateAvatar,
    clearError,
    setLoading,
    initialize,
  } = useAuthStore();
  const router = useRouter();

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    await signIn(email, password, rememberMe);
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [signIn, isAuthenticated, router]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    await signUp(name, email, password);
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [signUp, isAuthenticated, router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/welcome');
  }, [signOut, router]);

  const handleUpdateProfile = useCallback(async (data: Parameters<typeof updateProfile>[0]) => {
    await updateProfile(data);
  }, [updateProfile]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle,
    signInWithApple,
    signOut: handleSignOut,
    refreshAccessToken,
    updateProfile: handleUpdateProfile,
    updateAvatar,
    clearError,
    setLoading,
    initialize,
  };
};

export const useUser = () => {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
};

export const useAuthActions = () => {
  const { signIn, signUp, signOut, signInWithGoogle, signInWithApple } = useAuthStore();
  return { signIn, signUp, signOut, signInWithGoogle, signInWithApple };
};