/**
 * Map Screen - Full screen map view with all media markers
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme, Chip, FAB, Portal, Modal, Card, Button } from 'react-native-paper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import NarrativesMapView from '../../src/components/MapView';
import { supabase } from '../../lib/supabase';
import type { MediaItem, Narrative } from '../../lib/types';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let mediaQuery = supabase.from('media_items').select('*');
      if (selectedNarrative) {
        mediaQuery = mediaQuery.eq('narrative_id', selectedNarrative);
      }

      const [{ data: mediaData }, { data: narrativesData }] = await Promise.all([
        mediaQuery,
        supabase.from('narratives').select('*'),
      ]);
      
      // Filter media items with location data
      const geoMedia = ((mediaData ?? []) as MediaItem[]).filter(
        item => item.latitude && item.longitude
      );
      
      setMediaItems(geoMedia);
      setNarratives((narrativesData ?? []) as Narrative[]);
    } catch (err: any) {
      console.error('Failed to fetch map data:', err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  }, [selectedNarrative]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkerPress = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const handleNarrativeFilter = (narrativeId: string | null) => {
    setSelectedNarrative(narrativeId);
    setShowFilters(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && mediaItems.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Loading map data...
        </Text>
      </View>
    );
  }

  if (error && mediaItems.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="contained" onPress={fetchData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Map */}
      <NarrativesMapView
        mediaItems={mediaItems}
        onMediaPress={handleMarkerPress}
      />
      
      {/* Filter Chip */}
      <View style={styles.filterContainer}>
        <Chip
          icon="filter"
          mode="flat"
          selected={selectedNarrative !== null}
          onPress={() => setShowFilters(true)}
          style={[styles.filterChip, { backgroundColor: theme.colors.surface }]}
        >
          {selectedNarrative
            ? narratives.find(n => n.id === selectedNarrative)?.title || 'Filtered'
            : 'All Narratives'
          }
        </Chip>
        
        <Chip
          icon="image-multiple"
          mode="flat"
          style={[styles.countChip, { backgroundColor: theme.colors.surface }]}
        >
          {mediaItems.length} photos
        </Chip>
      </View>
      
      {/* Refresh FAB */}
      <FAB
        icon="refresh"
        size="small"
        onPress={fetchData}
        style={[styles.refreshFab, { backgroundColor: theme.colors.surface }]}
        loading={loading}
      />
      
      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Filter by Narrative</Text>
          
          <Chip
            mode="flat"
            selected={selectedNarrative === null}
            onPress={() => handleNarrativeFilter(null)}
            style={styles.narrativeChip}
          >
            All Narratives
          </Chip>
          
          {narratives.map(narrative => (
            <Chip
              key={narrative.id}
              mode="flat"
              selected={selectedNarrative === narrative.id}
              onPress={() => handleNarrativeFilter(narrative.id)}
              style={styles.narrativeChip}
            >
              {narrative.title}
            </Chip>
          ))}
        </Modal>
      </Portal>
      
      {/* Selected Media Modal */}
      <Portal>
        <Modal
          visible={selectedMedia !== null}
          onDismiss={() => setSelectedMedia(null)}
          contentContainerStyle={[styles.mediaModalContent, { backgroundColor: theme.colors.surface }]}
        >
          {selectedMedia && (
            <Card style={{ backgroundColor: 'transparent' }} elevation={0}>
              <Image
                source={{ uri: selectedMedia.thumbnail_medium_url || selectedMedia.file_url }}
                style={styles.mediaImage}
                contentFit="cover"
              />
              <Card.Content style={styles.mediaInfo}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {selectedMedia.title || 'Untitled'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDate(selectedMedia.capture_date ?? undefined)}
                </Text>
                {selectedMedia.description && (
                  <Text 
                    variant="bodyMedium" 
                    style={{ color: theme.colors.onSurface, marginTop: 8 }}
                    numberOfLines={3}
                  >
                    {selectedMedia.description}
                  </Text>
                )}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setSelectedMedia(null)}>Close</Button>
                <Button 
                  mode="contained"
                  onPress={() => {
                    setSelectedMedia(null);
                    if (selectedMedia.narrative_id) {
                      router.push(`/(app)/narrative/${selectedMedia.narrative_id}`);
                    }
                  }}
                >
                  View Narrative
                </Button>
              </Card.Actions>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  filterContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    elevation: 4,
  },
  countChip: {
    elevation: 4,
  },
  refreshFab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    marginBottom: 16,
  },
  narrativeChip: {
    marginVertical: 4,
  },
  mediaModalContent: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 250,
  },
  mediaInfo: {
    paddingTop: 16,
  },
});
