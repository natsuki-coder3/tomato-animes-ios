/**
 * Tomato Animes - Tab Layout
 * Expo Router v4 tab navigation with Liquid Glass tab bar
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { GlassTabBar } from '@components/glass';
import { useColors } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          height: 80,
          borderRadius: 24,
          marginBottom: 16,
          backgroundColor: 'transparent',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Downloads',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'download' : 'download-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}