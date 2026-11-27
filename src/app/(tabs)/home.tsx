/**
 * Tomato Animes - Home Screen
 * Main home screen with anime listings
 */

import React from 'react';
import { View, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { GlassCard, GlassCardSection, GlassButton, GlassSearchBar, GlassDivider, GlassProgress } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation } from 'expo-router';
import { AnimeItem } from '@components/AnimeItem';
import { SectionHeader } from '@components/SectionHeader';

export default function HomeScreen() {
  const colors = useColors();
  const { isReducedMotion } = useTheme();
  const navigation = useNavigation();

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.getFeaturedAnimes(),
  });

  const { data: continueWatching, isLoading: continueLoading } = useQuery({
    queryKey: ['continueWatching'],
    queryFn: () => api.getContinueWatching(),
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => api.getPopularAnimes(),
  });

  const { data: newReleases, isLoading: newReleasesLoading } = useQuery({
    queryKey: ['newReleases'],
    queryFn: () => api.getNewReleases(),
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigation.navigate('search', { query });
    }
  };

  const handleRefresh = () => {
    // Trigger refetch
  };

  if (featuredLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <GlassProgress variant="indeterminate" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={featuredLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <GlassSearchBar
            placeholder="Buscar animes..."
            onSubmit={handleSearch}
            onChangeText={handleSearch}
            leftIcon={<Ionicons name="search" size={24} color={colors.onSurfaceVariant} />}
          />
        </View>

        {/* Featured / Hero Section */}
        {featured && featured.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHeader title="Em Destaque" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {featured.slice(0, 5).map((anime) => (
                <AnimeItem
                  key={anime.id}
                  anime={anime}
                  variant="featured"
                  onPress={() => navigation.navigate('player', { animeId: anime.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <SectionHeader title="Continue Assistindo" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {continueWatching.map((item) => (
                <AnimeItem
                  key={item.anime.id}
                  anime={item.anime}
                  variant="continue"
                  progress={item.progress}
                  episode={item.episode}
                  onPress={() => navigation.navigate('player', { animeId: item.anime.id, episode: item.episode })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular */}
        {popular && popular.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <SectionHeader title="Populares" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {popular.map((anime) => (
                <AnimeItem
                  key={anime.id}
                  anime={anime}
                  variant="card"
                  onPress={() => navigation.navigate('player', { animeId: anime.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* New Releases */}
        {newReleases && newReleases.length > 0 && (
          <View style={{ marginTop: 16, paddingBottom: 20 }}>
            <SectionHeader title="Novos Lançamentos" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {newReleases.map((anime) => (
                <AnimeItem
                  key={anime.id}
                  anime={anime}
                  variant="card"
                  isNew={true}
                  onPress={() => navigation.navigate('player', { animeId: anime.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}