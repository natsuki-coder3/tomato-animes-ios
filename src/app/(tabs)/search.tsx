/**
 * Tomato Animes - Search Screen
 * Search functionality with filters and results
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Keyboard, SafeAreaView, FlatList } from 'react-native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { GlassSearchBar, GlassCard, GlassCardSection, GlassDivider, GlassButton, GlassChip, GlassProgress } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { AnimeItem } from '@components/AnimeItem';
import { SectionHeader } from '@components/SectionHeader';

const GENRES = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia',
  'Ficção Científica', 'Terror', 'Mistério', 'Romance',
  'Slice of Life', 'Sobrenatural', 'Esportes', 'Mecha',
  'Musical', 'Psicológico', 'Thriller',
];

const TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
const STATUSES = ['Em Exibição', 'Finalizado', 'Próximos Lançamentos'];
const SORT_OPTIONS = ['Relevância', 'Popularidade', 'Avaliação', 'Mais Recente', 'Alfabética'];

export default function SearchScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState(params.query as string || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('Relevância');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    Keyboard.dismiss();
  }, []);

  const handleFilterPress = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleTypePress = (type: string) => {
    setSelectedType(type === selectedType ? 'Todos' : type);
  };

  const handleStatusPress = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'Todos' : status);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedType('Todos');
    setSelectedStatus('Todos');
    setSortBy('Relevância');
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedType !== 'Todos' || selectedStatus !== 'Todos';

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['search', query, selectedGenres, selectedType, selectedStatus, sortBy],
    queryFn: ({ pageParam = 1 }) => api.searchAnimes({
      query,
      genres: selectedGenres,
      type: selectedType === 'Todos' ? undefined : selectedType,
      status: selectedStatus === 'Todos' ? undefined : selectedStatus,
      sort: sortBy,
      page: pageParam,
      limit: 20,
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: query.length > 0,
    initialPageParam: 1,
  });

  const results = data?.pages.flatMap(page => page.results) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <GlassSearchBar
            placeholder="Buscar animes, personagens, estúdios..."
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSearch}
            onClear={clearFilters}
            leftIcon={<Ionicons name="search" size={24} color={colors.onSurfaceVariant} />}
            rightIcon={hasActiveFilters && (
              <Ionicons name="funnel" size={24} color={colors.primary} />
            )}
            showClearButton={true}
          />
        </View>

        {/* Filter Chips */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
          >
            <GlassChip
              label="Filtros"
              leadingIcon={<Ionicons name="funnel-outline" size={18} color={colors.onSurfaceVariant} />}
              onPress={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'primary' : 'outline'}
            />
            {showFilters && (
              <>
                <GlassChip
                  label="Gêneros"
                  variant="outline"
                  disabled
                />
                {GENRES.map(genre => (
                  <GlassChip
                    key={genre}
                    label={genre}
                    variant={selectedGenres.includes(genre) ? 'primary' : 'outline'}
                    onPress={() => handleFilterPress(genre)}
                  />
                ))}
                <GlassDivider vertical style={{ marginHorizontal: 8 }} />
                <GlassChip
                  label="Tipo"
                  variant="outline"
                  disabled
                />
                {TYPES.map(type => (
                  <GlassChip
                    key={type}
                    label={type}
                    variant={selectedType === type ? 'primary' : 'outline'}
                    onPress={() => handleTypePress(type)}
                  />
                ))}
                <GlassDivider vertical style={{ marginHorizontal: 8 }} />
                <GlassChip
                  label="Status"
                  variant="outline"
                  disabled
                />
                {STATUSES.map(status => (
                  <GlassChip
                    key={status}
                    label={status}
                    variant={selectedStatus === status ? 'primary' : 'outline'}
                    onPress={() => handleStatusPress(status)}
                  />
                ))}
                <GlassDivider vertical style={{ marginHorizontal: 8 }} />
                <GlassChip
                  label="Ordenar"
                  variant="outline"
                  disabled
                />
                {SORT_OPTIONS.map(option => (
                  <GlassChip
                    key={option}
                    label={option}
                    variant={sortBy === option ? 'primary' : 'outline'}
                    onPress={() => setSortBy(option)}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <GlassCard variant="surface" style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {selectedGenres.map(genre => (
                  <GlassChip
                    key={genre}
                    label={genre}
                    variant="primary"
                    size="sm"
                    onPress={() => handleFilterPress(genre)}
                    closable
                  />
                ))}
                {selectedType !== 'Todos' && (
                  <GlassChip
                    key="type"
                    label={selectedType}
                    variant="primary"
                    size="sm"
                    onPress={() => handleTypePress('Todos')}
                    closable
                  />
                )}
                {selectedStatus !== 'Todos' && (
                  <GlassChip
                    key="status"
                    label={selectedStatus}
                    variant="primary"
                    size="sm"
                    onPress={() => handleStatusPress('Todos')}
                    closable
                  />
                )}
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onPress={clearFilters}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="close-outline" size={16} color={colors.onSurfaceVariant} />
                </GlassButton>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Results */}
        {query.length === 0 && !hasActiveFilters && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <Ionicons name="search-outline" size={80} color={colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
            <GlassCard variant="surface" style={{ marginTop: 16, padding: 24, alignItems: 'center' }}>
              <GlassButton variant="primary" onPress={() => setShowFilters(true)}>
                <Ionicons name="funnel-outline" size={20} color={colors.onPrimary} />
              </GlassButton>
            </GlassCard>
          </View>
        )}

        {query.length > 0 && (
          <>
            {isLoading && (
              <View style={{ paddingTop: 40, alignItems: 'center' }}>
                <GlassProgress variant="indeterminate" color={colors.primary} />
              </View>
            )}

            {isError && (
              <GlassCard variant="surface" style={{ margin: 16, padding: 24, alignItems: 'center' }}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} style={{ marginBottom: 12 }} />
                <GlassButton variant="primary" onPress={() => {}}>
                  Tentar Novamente
                </GlassButton>
              </GlassCard>
            )}

            {results.length === 0 && query.length > 0 && !isLoading && (
              <View style={{ paddingTop: 60, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={64} color={colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
                <GlassCard variant="surface" style={{ marginTop: 16, padding: 24, alignItems: 'center' }}>
                  <GlassButton variant="outline" onPress={() => setShowFilters(true)}>
                    Ajustar Filtros
                  </GlassButton>
                </GlassCard>
              </View>
            )}

            {results.length > 0 && (
              <FlatList
                data={results}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <AnimeItem
                    anime={item}
                    variant="card"
                    onPress={() => navigation.navigate('player', { animeId: item.id })}
                  />
                )}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
                ListFooterComponent={
                  isFetchingNextPage && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <GlassProgress variant="indeterminate" size="sm" color={colors.primary} />
                    </View>
                  )
                }
                onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
                onEndReachedThreshold={0.5}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}