/**
 * Timeline Screen - Swipeable photo timeline with gestures
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  useTheme,
  IconButton,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../../lib/supabase';
import type { MediaItem } from '../../../lib/types';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

export default function TimelineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { narrativeId } = useLocalSearchParams<{ narrativeId: string }>();
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const playInterval = useRef<NodeJS.Timeout | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;

  // Fetch media items
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('media_items')
          .select('*')
          .eq('narrative_id', narrativeId)
          .order('capture_date', { ascending: true });

        if (fetchError) throw fetchError;
        setMediaItems((data ?? []) as MediaItem[]);
      } catch (err: any) {
        console.error('Failed to fetch timeline media:', err);
        setError('Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    if (narrativeId) {
      fetchMedia();
    }
  }, [narrativeId]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && mediaItems.length > 1) {
      playInterval.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= mediaItems.length) {
            setIsPlaying(false);
            return prev;
          }
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, 3000);
    }

    return () => {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    };
  }, [isPlaying, mediaItems.length]);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
        // Swipe right - go back
        goToPrevious();
      } else if (gestureState.dx < -SWIPE_THRESHOLD && currentIndex < mediaItems.length - 1) {
        // Swipe left - go forward
        goToNext();
      }
      
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  const goToNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleControls}
      style={styles.imageContainer}
      {...panResponder.panHandlers}
    >
      <Image
        source={{ uri: item.file_url }}
        style={styles.image}
        contentFit="contain"
        transition={200}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading timeline...
        </Text>
      </View>
    );
  }

  if (error || mediaItems.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>
          {error || 'No media items in this narrative'}
        </Text>
        <IconButton
          icon="arrow-left"
          size={32}
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const currentItem = mediaItems[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar style="light" />
      
      {/* Full-screen image carousel */}
      <FlatList
        ref={flatListRef}
        data={mediaItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Controls Overlay */}
      {showControls && (
        <>
          {/* Top Bar */}
          <SafeAreaView style={styles.topBar}>
            <IconButton
              icon="close"
              iconColor="#fff"
              size={28}
              onPress={() => router.back()}
            />
            <Text variant="titleMedium" style={styles.title}>
              {currentIndex + 1} / {mediaItems.length}
            </Text>
            <View style={{ width: 48 }} />
          </SafeAreaView>

          {/* Bottom Info & Controls */}
          <View style={styles.bottomBar}>
            <Surface style={[styles.infoSurface, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Text variant="titleMedium" style={styles.infoTitle}>
                {currentItem.title || 'Untitled'}
              </Text>
              <Text variant="bodySmall" style={styles.infoDate}>
                {formatDate(currentItem.capture_date ?? undefined)}
              </Text>
              {currentItem.description && (
                <Text variant="bodyMedium" style={styles.infoDescription} numberOfLines={2}>
                  {currentItem.description}
                </Text>
              )}
            </Surface>

            {/* Playback Controls */}
            <View style={styles.controls}>
              <IconButton
                icon="skip-previous"
                iconColor="#fff"
                size={32}
                onPress={goToPrevious}
                disabled={currentIndex === 0}
              />
              <IconButton
                icon={isPlaying ? 'pause' : 'play'}
                iconColor="#fff"
                size={48}
                onPress={togglePlayback}
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
              />
              <IconButton
                icon="skip-next"
                iconColor="#fff"
                size={32}
                onPress={goToNext}
                disabled={currentIndex === mediaItems.length - 1}
              />
            </View>

            {/* Timeline Indicator */}
            <View style={styles.timelineIndicator}>
              {mediaItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentIndex
                        ? theme.colors.primary
                        : 'rgba(255,255,255,0.4)',
                      width: index === currentIndex ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </>
      )}
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
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoSurface: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  infoDate: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  infoDescription: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  playButton: {
    borderRadius: 28,
  },
  timelineIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
