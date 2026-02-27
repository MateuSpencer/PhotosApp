/**
 * Map View Component for Narratives Mobile App
 * Displays media items on a map based on their GPS coordinates
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import { Text, useTheme, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MediaItem } from '../../lib/types';

const { width, height } = Dimensions.get('window');

interface MapViewComponentProps {
  mediaItems: MediaItem[];
  onMediaPress?: (media: MediaItem) => void;
  initialRegion?: Region;
  showControls?: boolean;
}

const DEFAULT_REGION: Region = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 50,
  longitudeDelta: 50,
};

export default function MapViewComponent({ 
  mediaItems, 
  onMediaPress,
  initialRegion,
  showControls = true,
}: MapViewComponentProps) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState<Region>(initialRegion || DEFAULT_REGION);
  const [selectedMarker, setSelectedMarker] = useState<MediaItem | null>(null);

  // Filter media items that have GPS coordinates
  const geotaggedMedia = mediaItems.filter(
    (m) => m.latitude !== null && m.longitude !== null
  );

  useEffect(() => {
    if (geotaggedMedia.length > 0 && !initialRegion) {
      // Calculate bounds to fit all markers
      const lats = geotaggedMedia.map((m) => m.latitude!);
      const lngs = geotaggedMedia.map((m) => m.longitude!);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const newRegion: Region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
        longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
      };
      
      setRegion(newRegion);
      
      // Animate to the new region
      setTimeout(() => {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }, 500);
    }
    setIsLoading(false);
  }, [geotaggedMedia.length]);

  const handleMarkerPress = (media: MediaItem) => {
    setSelectedMarker(media);
    
    // Center on the marker
    if (media.latitude && media.longitude) {
      mapRef.current?.animateToRegion({
        latitude: media.latitude,
        longitude: media.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const fitAllMarkers = () => {
    if (geotaggedMedia.length === 0) return;
    
    const coordinates = geotaggedMedia.map((m) => ({
      latitude: m.latitude!,
      longitude: m.longitude!,
    }));
    
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  const getMediaThumbnail = (media: MediaItem) => {
    return media.thumbnail_small_url || media.thumbnail_medium_url || media.file_url;
  };

  if (geotaggedMedia.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons 
          name="map-marker-off" 
          size={64} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
          No geotagged photos
        </Text>
        <Text 
          variant="bodyMedium" 
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
        >
          Photos with GPS data will appear on the map
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onMapReady={() => setIsLoading(false)}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
      >
        {geotaggedMedia.map((media) => (
          <Marker
            key={media.id}
            coordinate={{
              latitude: media.latitude!,
              longitude: media.longitude!,
            }}
            onPress={() => handleMarkerPress(media)}
          >
            <View style={[
              styles.markerContainer,
              selectedMarker?.id === media.id && styles.selectedMarker,
              { borderColor: theme.colors.primary }
            ]}>
              <Image
                source={{ uri: getMediaThumbnail(media) }}
                style={styles.markerImage}
              />
            </View>
            <Callout onPress={() => onMediaPress?.(media)}>
              <View style={styles.callout}>
                <Text variant="titleSmall" numberOfLines={1}>
                  {media.title || 'Untitled'}
                </Text>
                {media.capture_date && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(media.capture_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          <IconButton
            icon="crosshairs-gps"
            mode="contained"
            size={24}
            onPress={fitAllMarkers}
            style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
          />
        </View>
      )}

      {/* Selected media preview */}
      {selectedMarker && (
        <Pressable 
          style={styles.previewCard}
          onPress={() => onMediaPress?.(selectedMarker)}
        >
          <Card>
            <Card.Content style={styles.previewContent}>
              <Image
                source={{ uri: getMediaThumbnail(selectedMarker) }}
                style={styles.previewImage}
              />
              <View style={styles.previewInfo}>
                <Text variant="titleMedium" numberOfLines={1}>
                  {selectedMarker.title || 'Untitled'}
                </Text>
                {selectedMarker.capture_date && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(selectedMarker.capture_date).toLocaleString()}
                  </Text>
                )}
                {selectedMarker.description && (
                  <Text variant="bodySmall" numberOfLines={2} style={{ marginTop: 4 }}>
                    {selectedMarker.description}
                  </Text>
                )}
              </View>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSelectedMarker(null)}
              />
            </Card.Content>
          </Card>
        </Pressable>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Media count badge */}
      <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
        <Text variant="labelMedium" style={{ color: '#fff', marginLeft: 4 }}>
          {geotaggedMedia.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectedMarker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  callout: {
    width: 150,
    padding: 8,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  controlButton: {
    marginBottom: 8,
  },
  previewCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
