/**
 * Tomato Animes - Downloads Screen
 * Manage downloaded episodes for offline viewing
 */

import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, FlatList, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard, GlassCardSection, GlassButton, GlassDivider, GlassProgress, GlassBadge, GlassChip } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation } from 'expo-router';
import { useDownloadsStore } from '@store/downloadsStore';
import { SectionHeader } from '@components/SectionHeader';

export default function DownloadsScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'completed' | 'downloading' | 'failed'>('all');

  const {
    downloads,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteDownload,
    retryDownload,
  } = useDownloadsStore();

  const { data: settings } = useQuery({
    queryKey: ['downloadSettings'],
    queryFn: () => api.getDownloadSettings(),
  });

  // Filter downloads
  const filteredDownloads = downloads.filter(download => {
    if (filter === 'all') return true;
    if (filter === 'completed') return download.status === 'completed';
    if (filter === 'downloading') return download.status === 'downloading';
    if (filter === 'failed') return download.status === 'failed';
    return true;
  });

  const groupedDownloads = filteredDownloads.reduce((acc, download) => {
    const key = download.animeId;
    if (!acc[key]) {
      acc[key] = { anime: download.anime, episodes: [] };
    }
    acc[key].episodes.push(download);
    return acc;
  }, {} as Record<string, { anime: any; episodes: any[] }>);

  const handleStartDownload = async (animeId: string, episodeId: string, quality: string) => {
    try {
      await startDownload(animeId, episodeId, quality);
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o download');
    }
  };

  const handleDelete = (downloadId: string) => {
    Alert.alert(
      'Excluir Download',
      'Tem certeza que deseja excluir este download?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteDownload(downloadId) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'downloading': return colors.primary;
      case 'paused': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'downloading': return 'Baixando';
      case 'paused': return 'Pausado';
      case 'failed': return 'Falhou';
      case 'queued': return 'Na Fila';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Storage Info */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: '700' }}>
              Downloads
            </Text>
            <GlassButton variant="ghost" size="sm" onPress={() => navigation.navigate('settings', { section: 'downloads' })}>
              <Ionicons name="settings-outline" size={22} color={colors.onSurfaceVariant} />
            </GlassButton>
          </View>

          {/* Storage Usage */}
          {settings && (
            <GlassCard variant="surface" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
                  <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '600' }}>
                    Armazenamento
                  </Text>
                </View>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>
                  {formatBytes(settings.used)} / {formatBytes(settings.total)}
                </Text>
              </View>
              <GlassProgress
                variant="linear"
                progress={settings.used / settings.total}
                color={settings.used / settings.total > 0.9 ? colors.error : colors.primary}
                height={8}
                showLabel={false}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                  {downloads.filter(d => d.status === 'completed').length} episódios baixados
                </Text>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                  {downloads.filter(d => d.status === 'downloading').length} baixando
                </Text>
              </View>
            </GlassCard>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[
              { key: 'all', label: 'Todos' },
              { key: 'completed', label: 'Concluídos' },
              { key: 'downloading', label: 'Baixando' },
              { key: 'failed', label: 'Com Erro' },
            ].map(tab => (
              <GlassChip
                key={tab.key}
                label={tab.label}
                variant={filter === tab.key ? 'primary' : 'outline'}
                onPress={() => setFilter(tab.key as typeof filter)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Downloads List */}
        {filteredDownloads.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <Ionicons
              name={filter === 'all' ? 'download-outline' : 'filter-outline'}
              size={64}
              color={colors.onSurfaceVariant}
              style={{ opacity: 0.5, marginBottom: 16 }}
            />
            <GlassCard variant="surface" style={{ padding: 24, alignItems: 'center', width: '80%' }}>
              <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>
                {filter === 'all' ? 'Nenhum download' : `Nenhum download ${getStatusLabel(filter).toLowerCase()}`}
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' }}>
                {filter === 'all'
                  ? 'Baixe episódios para assistir offline'
                  : 'Tente alterar o filtro ou baixe novos episódios'}
              </Text>
              {filter === 'all' && (
                <GlassButton variant="primary" style={{ marginTop: 16 }} onPress={() => navigation.navigate('search')}>
                  <Ionicons name="search-outline" size={18} color={colors.onPrimary} style={{ marginRight: 8 }} />
                  Explorar Animes
                </GlassButton>
              )}
            </GlassCard>
          </View>
        ) : (
          <FlatList
            data={Object.entries(groupedDownloads)}
            keyExtractor={([animeId]) => animeId}
            renderItem={({ item }) => {
              const [animeId, group] = item;
              const anime = group.anime;
              const episodes = group.episodes.sort((a, b) => a.episode - b.episode);

              return (
                <GlassCard variant="elevated" style={{ marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row', gap: 16, padding: 12 }}>
                    <Image
                      source={{ uri: anime.coverImage }}
                      style={{ width: 80, height: 112, borderRadius: 12 }}
                    />
                    <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                      <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '600' }}>
                        {anime.title}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {episodes.slice(0, 3).map(ep => (
                          <GlassBadge
                            key={ep.id}
                            label={`EP ${ep.episode}`}
                            variant={ep.status === 'completed' ? 'success' : ep.status === 'downloading' ? 'primary' : 'warning'}
                            size="xs"
                          />
                        ))}
                        {episodes.length > 3 && (
                          <GlassBadge
                            label={`+${episodes.length - 3}`}
                            variant="outline"
                            size="xs"
                          />
                        )}
                      </View>
                    </View>
                    <GlassButton variant="ghost" size="sm" onPress={() => navigation.navigate('player', { animeId })}>
                      <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
                    </GlassButton>
                  </View>

                  <GlassDivider />

                  <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 8 }}>
                    {episodes.map(ep => (
                      <DownloadEpisodeItem
                        key={ep.id}
                        episode={ep}
                        onPlay={() => navigation.navigate('player', { animeId, episode: ep.episode.toString() })}
                        onPause={() => pauseDownload(ep.id)}
                        onResume={() => resumeDownload(ep.id)}
                        onCancel={() => cancelDownload(ep.id)}
                        onDelete={() => handleDelete(ep.id)}
                        onRetry={() => retryDownload(ep.id)}
                      />
                    ))}
                  </View>
                </GlassCard>
              );
            }}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                  Nenhum download encontrado
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DownloadEpisodeItem = ({ episode, onPlay, onPause, onResume, onCancel, onDelete, onRetry }: any) => {
  const { colors } = useColors();
  const statusColor = episode.status === 'completed' ? colors.success :
    episode.status === 'downloading' ? colors.primary :
    episode.status === 'failed' ? colors.error : colors.warning;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <GlassButton variant="ghost" size="sm" onPress={onPlay} disabled={episode.status !== 'completed'}>
        <Ionicons
          name={episode.status === 'completed' ? 'play-circle' : 'lock-closed-outline'}
          size={24}
          color={episode.status === 'completed' ? colors.primary : colors.onSurfaceVariant}
        />
      </GlassButton>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.onSurface, fontSize: 14, fontWeight: '500' }}>
            Episódio {episode.episode}
          </Text>
          <GlassBadge
            label={getStatusLabel(episode.status)}
            variant={episode.status === 'completed' ? 'success' : episode.status === 'downloading' ? 'primary' : episode.status === 'failed' ? 'danger' : 'warning'}
            size="xs"
          />
        </View>

        {episode.status === 'downloading' && (
          <>
            <GlassProgress
              variant="linear"
              progress={episode.progress / 100}
              color={colors.primary}
              height={4}
              showLabel={false}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 11 }}>
                {formatBytes(episode.downloadedBytes)} / {formatBytes(episode.totalBytes)}
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 11 }}>
                {episode.speed ? `${formatBytes(episode.speed)}/s` : ''}
              </Text>
            </View>
          </>
        )}

        {episode.status === 'failed' && (
          <Text style={{ color: colors.error, fontSize: 11 }}>
            {episode.error || 'Erro desconhecido'}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 4 }}>
        {episode.status === 'downloading' && (
          <GlassButton variant="ghost" size="sm" onPress={onPause}>
            <Ionicons name="pause-outline" size={18} color={colors.onSurfaceVariant} />
          </GlassButton>
        )}
        {episode.status === 'paused' && (
          <GlassButton variant="ghost" size="sm" onPress={onResume}>
            <Ionicons name="play-outline" size={18} color={colors.primary} />
          </GlassButton>
        )}
        {episode.status === 'failed' && (
          <GlassButton variant="ghost" size="sm" onPress={onRetry}>
            <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          </GlassButton>
        )}
        {(episode.status === 'completed' || episode.status === 'failed' || episode.status === 'paused') && (
          <GlassButton variant="ghost" size="sm" onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </GlassButton>
        )}
      </View>
    </View>
  );
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Concluído';
    case 'downloading': return 'Baixando';
    case 'paused': return 'Pausado';
    case 'failed': return 'Falhou';
    case 'queued': return 'Na Fila';
    default: return status;
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add missing imports
import { Text, Image } from 'react-native';