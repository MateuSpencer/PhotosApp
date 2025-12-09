/**
 * Narrative Detail Screen for Narratives Mobile App
 */
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, StyleSheet, ScrollView, RefreshControl, Image, 
  Dimensions, FlatList, Pressable 
} from 'react-native';
import { 
  Text, useTheme, ActivityIndicator, IconButton, Chip,
  SegmentedButtons, FAB, Portal, Modal
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../shared/api/client';
import { Narrative, MediaItem, MediaDay } from '../../shared/types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 32 - (COLUMN_COUNT - 1) * 4) / COLUMN_COUNT;

type ViewMode = 'grid' | 'timeline' | 'map';

export default function NarrativeDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaDays, setMediaDays] = useState<MediaDay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const loadNarrative = useCallback(async () => {
    if (!id) return;
    
    try {
      const [narrativeData, mediaData, daysData] = await Promise.all([
        api.getNarrative(id),
        api.getNarrativeMedia(id),
        api.getNarrativeDays(id),
      ]);
      setNarrative(narrativeData);
      setMediaItems(mediaData);
      setMediaDays(daysData);
    } catch (error) {
      console.error('Error loading narrative:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadNarrative();
  }, [loadNarrative]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNarrative();
  };

  const getMediaThumbnail = (media: MediaItem) => {
    return media.thumbnail_medium || media.thumbnail_small || media.file;
  };

  const renderGridItem = ({ item }: { item: MediaItem }) => (
    <Pressable 
      style={styles.gridItem}
      onPress={() => setSelectedMedia(item)}
    >
      <Image 
        source={{ uri: getMediaThumbnail(item) }} 
        style={styles.gridImage}
        resizeMode="cover"
      />
      {item.media_type === 'video' && (
        <View style={styles.videoIndicator}>
          <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
        </View>
      )}
    </Pressable>
  );

  const renderTimelineDay = ({ item }: { item: MediaDay }) => (
    <View style={styles.timelineDay}>
      <View style={styles.timelineDayHeader}>
        <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
        <Text variant="titleMedium" style={{ marginLeft: 12 }}>
          {new Date(item.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Chip compact style={{ marginLeft: 8 }}>{item.count}</Chip>
      </View>
      <View style={styles.timelineContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.media_items.map((media) => (
            <Pressable 
              key={media.id} 
              onPress={() => setSelectedMedia(media)}
              style={styles.timelineImage}
            >
              <Image 
                source={{ uri: getMediaThumbnail(media) }} 
                style={styles.timelineImageInner}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!narrative) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
        <Text variant="titleLarge" style={{ marginTop: 16 }}>Narrative not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {narrative.cover_image ? (
          <Image source={{ uri: narrative.cover_image }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="image" size={64} color={theme.colors.onSurfaceVariant} />
          </View>
        )}
        <View style={styles.headerOverlay}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-left"
              iconColor="#fff"
              size={24}
              onPress={() => router.back()}
              style={styles.headerButton}
            />
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="play"
                iconColor="#fff"
                size={24}
                onPress={() => router.push(`/(app)/timeline/${id}`)}
                style={styles.headerButton}
              />
              <IconButton
                icon="dots-vertical"
                iconColor="#fff"
                size={24}
                onPress={() => {}}
                style={styles.headerButton}
              />
            </View>
          </View>
          <View style={styles.headerBottom}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {narrative.title}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {narrative.media_count} photos • {narrative.location_summary || 'No location'}
            </Text>
          </View>
        </View>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewSelector}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: 'grid', icon: 'view-grid', label: 'Grid' },
            { value: 'timeline', icon: 'timeline', label: 'Timeline' },
            { value: 'map', icon: 'map', label: 'Map' },
          ]}
        />
      </View>

      {/* Content based on view mode */}
      {viewMode === 'grid' && (
        <FlatList
          data={mediaItems}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="image-plus" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ marginTop: 16 }}>No photos yet</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Upload some photos to this narrative
              </Text>
            </View>
          }
        />
      )}

      {viewMode === 'timeline' && (
        <FlatList
          data={mediaDays}
          renderItem={renderTimelineDay}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.timelineContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="timeline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ marginTop: 16 }}>No timeline data</Text>
            </View>
          }
        />
      )}

      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <MaterialCommunityIcons name="map" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 16 }}>Map View</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Coming soon...
          </Text>
        </View>
      )}

      {/* FAB for upload */}
      <FAB
        icon="camera-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push({
          pathname: '/(app)/upload',
          params: { narrativeId: id }
        })}
        color={theme.colors.onPrimary}
      />

      {/* Media Preview Modal */}
      <Portal>
        <Modal
          visible={!!selectedMedia}
          onDismiss={() => setSelectedMedia(null)}
          contentContainerStyle={styles.mediaModal}
        >
          {selectedMedia && (
            <View style={styles.mediaModalContent}>
              <Image 
                source={{ uri: selectedMedia.file }} 
                style={styles.mediaModalImage}
                resizeMode="contain"
              />
              <View style={styles.mediaModalInfo}>
                <Text variant="titleMedium">{selectedMedia.title || 'Untitled'}</Text>
                {selectedMedia.capture_date && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(selectedMedia.capture_date).toLocaleString()}
                  </Text>
                )}
                {selectedMedia.description && (
                  <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                    {selectedMedia.description}
                  </Text>
                )}
              </View>
              <IconButton
                icon="close"
                size={28}
                onPress={() => setSelectedMedia(null)}
                style={styles.modalCloseButton}
              />
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  headerBottom: {
    padding: 16,
  },
  headerButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  viewSelector: {
    padding: 16,
  },
  gridContent: {
    padding: 16,
    paddingTop: 0,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 4,
    marginBottom: 4,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  timelineContent: {
    padding: 16,
    paddingLeft: 24,
  },
  timelineDay: {
    marginBottom: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 16,
    marginLeft: 8,
  },
  timelineDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: -25,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineImage: {
    marginRight: 8,
  },
  timelineImageInner: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  mediaModal: {
    margin: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  mediaModalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mediaModalImage: {
    width: '100%',
    height: '70%',
  },
  mediaModalInfo: {
    padding: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
