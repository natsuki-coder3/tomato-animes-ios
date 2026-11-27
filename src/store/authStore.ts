/**
 * Tomato Animes - Auth Store
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@services/api';
import { storage } from '@services/storage';
import { analyticsService } from '@services/analytics';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  showEmail: boolean;
  showWatchHistory: boolean;
  showFavorites: boolean;
  createdAt: string;
}

interface AuthState {
  // State
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (avatarUri: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize from storage
      initialize: async () => {
        const token = storage.getAuthToken();
        const refreshToken = storage.getRefreshToken();
        const userProfile = storage.getUserProfile();

        if (token && userProfile) {
          set({
            accessToken: token,
            refreshToken,
            user: userProfile,
            isAuthenticated: true,
          });
          api.setAuthToken(token);
        }
      },

      // Sign in with email/password
      signIn: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password, rememberMe);

          const { accessToken, refreshToken, user } = response;

          storage.setAuthToken(accessToken);
          storage.setRefreshToken(refreshToken);
          storage.setUserProfile(user);

          api.setAuthToken(accessToken);

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          await analyticsService.trackSignIn('email');
        } catch (error: any) {
          const errorMessage = error.message || 'Falha ao entrar';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Sign up with email/password
      signUp: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register(name, email, password);

          const { accessToken, refreshToken, user } = response;

          storage.setAuthToken(accessToken);
          storage.setRefreshToken(refreshToken);
          storage.setUserProfile(user);

          api.setAuthToken(accessToken);

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          await analyticsService.trackSignUp('email');
        } catch (error: any) {
          const errorMessage = error.message || 'Falha ao cadastrar';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          // Implement Google Sign-In
          // const { idToken } = await GoogleSignin.signIn();
          // const response = await api.socialLogin('google', idToken);

          // For now, simulate
          throw new Error('Google Sign-In not implemented yet');
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Sign in with Apple
      signInWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
          // Implement Apple Sign-In
          // const credential = await AppleAuthentication.signInAsync({...});
          // const response = await api.socialLogin('apple', credential.identityToken);

          // For now, simulate
          throw new Error('Apple Sign-In not implemented yet');
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch (error) {
          console.warn('[Auth] Logout API call failed:', error);
        } finally {
          storage.clearUserData();
          api.setAuthToken(null);

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return;

        try {
          const response = await api.refreshToken(refreshToken);

          const { accessToken, refreshToken: newRefreshToken, user } = response;

          storage.setAuthToken(accessToken);
          storage.setRefreshToken(newRefreshToken);
          storage.setUserProfile(user);

          api.setAuthToken(accessToken);

          set({
            accessToken,
            refreshToken: newRefreshToken,
            user,
          });
        } catch (error) {
          // Refresh failed, sign out
          await get().signOut();
          throw error;
        }
      },

      // Update profile
      updateProfile: async (data: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const updatedUser = await api.updateProfile(data);

          storage.setUserProfile(updatedUser);

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Update avatar
      updateAvatar: async (avatarUri: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          // Upload avatar to server
          // const updatedUser = await api.uploadAvatar(avatarUri);

          // For now, update locally
          const updatedUser = { ...currentUser, avatar: avatarUri };
          storage.setUserProfile(updatedUser);

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set loading
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) || null,
        setItem: (name, value) => storage.setString(name, value),
        removeItem: (name) => storage.delete(name),
      })),
      partialize: (state) => ({
        // Don't persist loading/error states
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuthStore = useAuthStore;
export default useAuthStore;