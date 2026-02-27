/**
 * Media Upload Screen for Narratives Mobile App
 * Allows users to select and upload photos from camera or gallery
 */
import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, ScrollView, Image, Pressable, 
  FlatList, Dimensions, Alert 
} from 'react-native';
import { 
  Text, Button, useTheme, ActivityIndicator, ProgressBar,
  Card, IconButton, TextInput, Portal, Modal, Chip
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import type { Narrative } from '../../lib/types';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 3;

interface SelectedAsset {
  uri: string;
  fileName: string;
  fileSize?: number;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

export default function UploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { narrativeId } = useLocalSearchParams<{ narrativeId?: string }>();
  const { user } = useAuth();
  
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(narrativeId || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number } | null>(null);
  const [showNarrativeModal, setShowNarrativeModal] = useState(false);

  useEffect(() => {
    loadNarratives();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are needed to upload photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadNarratives = async () => {
    try {
      const { data } = await supabase
        .from('narratives')
        .select('*')
        .order('date_modified', { ascending: false });
      setNarratives((data ?? []) as Narrative[]);
    } catch (error) {
      console.error('Error loading narratives:', error);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets) {
      const newAssets: SelectedAsset[] = result.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
      }));
      setSelectedAssets((prev) => [...prev, ...newAssets]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedAssets((prev) => [
        ...prev,
        {
          uri: asset.uri,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          type: asset.type === 'video' ? 'video' : 'image',
          width: asset.width,
          height: asset.height,
        },
      ]);
    }
  };

  const removeAsset = (index: number) => {
    setSelectedAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedAssets.length === 0) {
      Alert.alert('No Photos', 'Please select at least one photo to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < selectedAssets.length; i++) {
      const asset = selectedAssets[i];
      
      try {
        // Read file as array buffer for Supabase Storage
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const fileExt = asset.fileName.split('.').pop() || 'jpg';
        const filePath = `${user!.id}/${Date.now()}_${i}.${fileExt}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, blob, {
            contentType: asset.type === 'video' ? 'video/mp4' : `image/${fileExt}`,
            upsert: false,
          });
        if (uploadError) throw uploadError;

        // 2. Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // 3. Insert media_items row
        const { error: insertError } = await supabase.from('media_items').insert({
          title: asset.fileName.replace(/\.[^/.]+$/, ''),
          file_url: publicUrlData.publicUrl,
          media_type: asset.type === 'video' ? 'video' : 'photo',
          narrative_id: selectedNarrative || null,
          owner_id: user!.id,
        });
        if (insertError) throw insertError;

        successCount++;
      } catch (error) {
        console.error(`Error uploading ${asset.fileName}:`, error);
        failedCount++;
      }
      
      setUploadProgress((i + 1) / selectedAssets.length);
    }

    setIsUploading(false);
    setUploadResults({ success: successCount, failed: failedCount });

    if (successCount > 0) {
      Alert.alert(
        'Upload Complete',
        `Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''}${failedCount > 0 ? `. ${failedCount} failed.` : '.'}`,
        [
          {
            text: 'View Photos',
            onPress: () => {
              if (selectedNarrative) {
                router.push(`/(app)/narrative/${selectedNarrative}`);
              } else {
                router.back();
              }
            },
          },
          {
            text: 'Upload More',
            onPress: () => {
              setSelectedAssets([]);
              setUploadResults(null);
            },
          },
        ]
      );
    }
  };

  const renderSelectedAsset = ({ item, index }: { item: SelectedAsset; index: number }) => (
    <View style={styles.assetItem}>
      <Image source={{ uri: item.uri }} style={styles.assetImage} />
      {item.type === 'video' && (
        <View style={styles.videoIndicator}>
          <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
        </View>
      )}
      <IconButton
        icon="close-circle"
        size={24}
        iconColor={theme.colors.error}
        style={styles.removeButton}
        onPress={() => removeAsset(index)}
      />
    </View>
  );

  const selectedNarrativeData = narratives.find((n) => n.id === selectedNarrative);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Upload Photos
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Add photos to your narratives
          </Text>
        </View>

        {/* Narrative Selector */}
        <Pressable 
          style={[styles.narrativeSelector, { borderColor: theme.colors.outline }]}
          onPress={() => setShowNarrativeModal(true)}
        >
          <MaterialCommunityIcons 
            name="book-open-variant" 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.narrativeSelectorText}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Upload to Narrative
            </Text>
            <Text variant="bodyLarge">
              {selectedNarrativeData?.title || 'No narrative selected'}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={theme.colors.onSurfaceVariant} 
          />
        </Pressable>

        {/* Upload Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="camera"
            onPress={takePhoto}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Take Photo
          </Button>
          <Button
            mode="contained-tonal"
            icon="image-multiple"
            onPress={pickFromGallery}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Choose from Gallery
          </Button>
        </View>

        {/* Selected Assets */}
        {selectedAssets.length > 0 && (
          <View style={styles.selectedSection}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium">
                Selected ({selectedAssets.length})
              </Text>
              <Button 
                mode="text" 
                onPress={() => setSelectedAssets([])}
                compact
              >
                Clear All
              </Button>
            </View>
            <FlatList
              data={selectedAssets}
              renderItem={renderSelectedAsset}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.assetsGrid}
            />
          </View>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card style={styles.progressCard}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                Uploading...
              </Text>
              <ProgressBar progress={uploadProgress} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center' }}>
                {Math.round(uploadProgress * 100)}%
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {selectedAssets.length === 0 && !isUploading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="image-plus" 
              size={80} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
              No photos selected
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Take a photo or choose from your gallery
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Upload Button */}
      {selectedAssets.length > 0 && !isUploading && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <Button
            mode="contained"
            onPress={handleUpload}
            style={styles.uploadButton}
            contentStyle={styles.uploadButtonContent}
            icon="cloud-upload"
          >
            Upload {selectedAssets.length} Photo{selectedAssets.length > 1 ? 's' : ''}
          </Button>
        </View>
      )}

      {/* Narrative Selection Modal */}
      <Portal>
        <Modal
          visible={showNarrativeModal}
          onDismiss={() => setShowNarrativeModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Select Narrative
          </Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Pressable
              style={[
                styles.narrativeOption,
                !selectedNarrative && styles.narrativeOptionSelected,
                { borderColor: theme.colors.outline }
              ]}
              onPress={() => {
                setSelectedNarrative(null);
                setShowNarrativeModal(false);
              }}
            >
              <MaterialCommunityIcons 
                name="folder-outline" 
                size={24} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text variant="bodyLarge" style={{ marginLeft: 12 }}>
                No narrative (upload to library)
              </Text>
            </Pressable>
            {narratives.map((narrative) => (
              <Pressable
                key={narrative.id}
                style={[
                  styles.narrativeOption,
                  selectedNarrative === narrative.id && styles.narrativeOptionSelected,
                  { borderColor: theme.colors.outline }
                ]}
                onPress={() => {
                  setSelectedNarrative(narrative.id);
                  setShowNarrativeModal(false);
                }}
              >
                {narrative.cover_image_url ? (
                  <Image 
                    source={{ uri: narrative.cover_image_url }} 
                    style={styles.narrativeThumb} 
                  />
                ) : (
                  <View style={[styles.narrativeThumbPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons 
                      name="book-open-page-variant" 
                      size={20} 
                      color={theme.colors.onSurfaceVariant} 
                    />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyLarge">{narrative.title}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    photos
                  </Text>
                </View>
                {selectedNarrative === narrative.id && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <Button 
            mode="text" 
            onPress={() => setShowNarrativeModal(false)}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  narrativeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  narrativeSelectorText: {
    flex: 1,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  selectedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetsGrid: {
    gap: 8,
  },
  assetItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  progressCard: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  uploadButton: {
    borderRadius: 8,
  },
  uploadButtonContent: {
    paddingVertical: 8,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
    maxHeight: '80%',
  },
  narrativeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  narrativeOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366f1',
  },
  narrativeThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  narrativeThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
