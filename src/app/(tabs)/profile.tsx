/**
 * Tomato Animes - Profile Screen
 * User profile with watch history, favorites, and settings
 */

import React from 'react';
import { View, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { GlassCard, GlassCardSection, GlassButton, GlassAvatar, GlassBadge, GlassDivider, GlassProgress } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { SectionHeader } from '@components/SectionHeader';

export default function ProfileScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => api.getUserStats(user!.id),
    enabled: !!user,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['watchHistory', user?.id],
    queryFn: () => api.getWatchHistory(user!.id, { limit: 10 }),
    enabled: !!user,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => api.getFavorites(user!.id),
    enabled: !!user,
  });

  const handleSignOut = () => {
    // Handle sign out
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <GlassAvatar
            size="xl"
            source={require('@assets/images/avatar-placeholder.png')}
            style={{ marginBottom: 24 }}
          />
          <GlassCard variant="elevated" style={{ padding: 32, alignItems: 'center', width: '90%' }}>
            <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '600', marginBottom: 8 }}>
              Bem-vindo ao Tomato Animes
            </Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
              Faça login para acessar seu histórico, favoritos e sincronizar entre dispositivos.
            </Text>
            <GlassButton variant="primary" fullWidth onPress={() => navigation.navigate('sign-in')}>
              Entrar
            </GlassButton>
            <GlassButton variant="outline" fullWidth style={{ marginTop: 12 }} onPress={() => navigation.navigate('sign-up')}>
              Criar Conta
            </GlassButton>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{ padding: 24, paddingBottom: 16 }}>
          <GlassCard variant="elevated" style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <GlassAvatar
                size="xl"
                source={user?.avatar ? { uri: user.avatar } : require('@assets/images/avatar-placeholder.png')}
                name={user?.name}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: '600' }}>
                  {user?.name || 'Usuário'}
                </Text>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>
                  {user?.email || 'email@exemplo.com'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <GlassBadge
                    label={`Nível ${user?.level || 1}`}
                    variant="primary"
                    size="sm"
                  />
                  <GlassBadge
                    label={`${user?.xp || 0} XP`}
                    variant="outline"
                    size="sm"
                  />
                </View>
              </View>
              <GlassButton variant="ghost" size="sm" onPress={() => navigation.navigate('profile-edit')}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </GlassButton>
            </View>
          </GlassCard>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <GlassCard variant="surface" style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <StatItem
                icon="play-circle-outline"
                label="Assistidos"
                value={stats?.watchedEpisodes || 0}
                color={colors.primary}
              />
              <GlassDivider vertical />
              <StatItem
                icon="heart-outline"
                label="Favoritos"
                value={stats?.favorites || 0}
                color={colors.accent}
              />
              <GlassDivider vertical />
              <StatItem
                icon="time-outline"
                label="Horas"
                value={`${Math.floor((stats?.watchTime || 0) / 60)}h`}
                color={colors.secondary}
              />
              <GlassDivider vertical />
              <StatItem
                icon="download-outline"
                label="Downloads"
                value={stats?.downloads || 0}
                color={colors.success}
              />
            </View>
          </GlassCard>
        </View>

        {/* Continue Watching */}
        {history && history.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <SectionHeader
              title="Continue Assistindo"
              action={{ label: 'Ver Todos', onPress: () => {/* Navigate to history */} }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {history.slice(0, 5).map((item) => (
                <ContinueWatchItem
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('player', { animeId: item.animeId, episode: item.episode })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Favorites */}
        {favorites && favorites.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <SectionHeader
              title="Meus Favoritos"
              action={{ label: 'Ver Todos', onPress: () => {/* Navigate to favorites */} }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            >
              {favorites.slice(0, 5).map((anime) => (
                <FavoriteItem
                  key={anime.id}
                  anime={anime}
                  onPress={() => navigation.navigate('player', { animeId: anime.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Settings Menu */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <SectionHeader title="Configurações" />
          <GlassCard variant="surface">
            <SettingsItem
              icon="person-outline"
              label="Editar Perfil"
              onPress={() => navigation.navigate('profile-edit')}
            />
            <GlassDivider />
            <SettingsItem
              icon="notifications-outline"
              label="Notificações"
              onPress={() => navigation.navigate('settings', { section: 'notifications' })}
            />
            <GlassDivider />
            <SettingsItem
              icon="download-outline"
              label="Downloads"
              onPress={() => navigation.navigate('settings', { section: 'downloads' })}
            />
            <GlassDivider />
            <SettingsItem
              icon="moon-outline"
              label="Aparência"
              onPress={() => navigation.navigate('settings', { section: 'appearance' })}
            />
            <GlassDivider />
            <SettingsItem
              icon="shield-outline"
              label="Privacidade e Segurança"
              onPress={() => navigation.navigate('settings', { section: 'privacy' })}
            />
            <GlassDivider />
            <SettingsItem
              icon="help-outline"
              label="Ajuda e Suporte"
              onPress={() => navigation.navigate('settings', { section: 'help' })}
            />
            <GlassDivider />
            <SettingsItem
              icon="information-outline"
              label="Sobre o App"
              onPress={() => navigation.navigate('settings', { section: 'about' })}
            />
          </GlassCard>
        </View>

        {/* Sign Out */}
        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>
          <GlassButton variant="danger" fullWidth onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.onAccent} style={{ marginRight: 8 }} />
            Sair da Conta
          </GlassButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const StatItem = ({ icon, label, value, color }: any) => {
  const { colors } = useColors();
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: '600' }}>
        {value}
      </Text>
      <Text style={{ color: colors.onSurfaceVariant, fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
};

const ContinueWatchItem = ({ item, onPress }: any) => {
  const { colors } = useColors();
  const progress = (item.position / item.duration) * 100;
  return (
    <TouchableOpacity onPress={onPress} style={{ width: 140 }}>
      <GlassCard variant="elevated" style={{ overflow: 'hidden' }}>
        <Image
          source={{ uri: item.anime?.coverImage }}
          style={{ width: 140, height: 196, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}>
          <GlassProgress
            variant="linear"
            progress={progress / 100}
            color={colors.primary}
            height={4}
            style={{ borderRadius: 2 }}
          />
        </View>
        <View style={{ padding: 8, gap: 4 }}>
          <Text style={{ color: colors.onSurface, fontSize: 12, fontWeight: '600', numberOfLines: 2 }}>
            {item.anime?.title}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 10 }}>
            EP {item.episode} - {Math.round(progress)}%
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const FavoriteItem = ({ anime, onPress }: any) => {
  const { colors } = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={{ width: 120 }}>
      <GlassCard variant="elevated" style={{ overflow: 'hidden' }}>
        <Image
          source={{ uri: anime.coverImage }}
          style={{ width: 120, height: 168, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        <View style={{ padding: 8, gap: 4 }}>
          <Text style={{ color: colors.onSurface, fontSize: 12, fontWeight: '600', numberOfLines: 2 }}>
            {anime.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 10 }}>
              {anime.rating || 'N/A'}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const SettingsItem = ({ icon, label, onPress, trailing }: any) => {
  const { colors } = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 }}>
      <Ionicons name={icon} size={24} color={colors.onSurfaceVariant} style={{ width: 28 }} />
      <Text style={{ color: colors.onSurface, fontSize: 16, flex: 1 }}>
        {label}
      </Text>
      {trailing || <Ionicons name="chevron-forward-outline" size={20} color={colors.onSurfaceVariant} />}
    </TouchableOpacity>
  );
};

// Add missing imports
import { Text } from 'react-native';