/**
 * Tomato Animes - App Router
 * Expo Router v4 with typed routes
 */

import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@theme/themeProvider';
import { ToastProvider } from '@components/glass';

// Screens
import SplashScreen from '@screens/SplashScreen';
import WelcomeScreen from '@screens/WelcomeScreen';
import SignInScreen from '@screens/SignInScreen';
import SignUpScreen from '@screens/SignUpScreen';
import HomeScreen from '@screens/HomeScreen';
import SearchScreen from '@screens/SearchScreen';
import PlayerScreen from '@screens/PlayerScreen';
import ProfileScreen from '@screens/ProfileScreen';
import SettingsScreen from '@screens/SettingsScreen';
import DownloadsScreen from '@screens/DownloadsScreen';
import WebViewScreen from '@screens/WebViewScreen';
import ProfileEditScreen from '@screens/ProfileEditScreen';

export default function AppRouter() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider defaultColorScheme="system">
        <ToastProvider>
          <Stack>
            <Stack.Screen
              name="splash"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
              }}
            >
              {SplashScreen}
            </Stack.Screen>

            <Stack.Screen
              name="welcome"
              options={{ headerShown: false }}
            >
              {WelcomeScreen}
            </Stack.Screen>

            <Stack.Screen
              name="sign-in"
              options={{ headerShown: false }}
            >
              {SignInScreen}
            </Stack.Screen>

            <Stack.Screen
              name="sign-up"
              options={{ headerShown: false }}
            >
              {SignUpScreen}
            </Stack.Screen>

            <Stack.Screen
              name="webview"
              options={{ headerShown: false }}
            >
              {WebViewScreen}
            </Stack.Screen>

            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0A84FF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 90,
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Tabs.Screen
                name="(tabs)/home"
                options={{
                  title: 'Início',
                }}
              >
                {HomeScreen}
              </Tabs.Screen>

              <Tabs.Screen
                name="(tabs)/search"
                options={{
                  title: 'Buscar',
                }}
              >
                {SearchScreen}
              </Tabs.Screen>

              <Tabs.Screen
                name="(tabs)/downloads"
                options={{
                  title: 'Downloads',
                }}
              >
                {DownloadsScreen}
              </Tabs.Screen>

              <Tabs.Screen
                name="(tabs)/profile"
                options={{
                  title: 'Perfil',
                }}
              >
                {ProfileScreen}
              </Tabs.Screen>
            </Tabs>

            <Stack.Screen
              name="player"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                gestureEnabled: false,
              }}
            >
              {PlayerScreen}
            </Stack.Screen>

            <Stack.Screen
              name="settings"
              options={{ headerShown: false }}
            >
              {SettingsScreen}
            </Stack.Screen>

            <Stack.Screen
              name="profile-edit"
              options={{ headerShown: false }}
            >
              {ProfileEditScreen}
            </Stack.Screen>
          </Stack>
          <StatusBar style="auto" />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}