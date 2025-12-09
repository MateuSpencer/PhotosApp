/**
 * Project Detail Screen for Narratives Mobile App
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Dimensions } from 'react-native';
import { 
  Text, Card, Button, useTheme, ActivityIndicator, IconButton,
  Chip, Menu, Divider, Portal, Modal, Dialog
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../shared/api/client';
import { Project, Narrative } from '../../shared/types';

const { width } = Dimensions.get('window');

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    
    try {
      const [projectData, narrativesData] = await Promise.all([
        api.getProject(id),
        api.getProjectNarratives(id),
      ]);
      setProject(projectData);
      setNarratives(narrativesData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProject();
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      router.back();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const getTotalMedia = () => {
    return narratives.reduce((sum, n) => sum + n.media_count, 0);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
        <Text variant="titleLarge" style={{ marginTop: 16 }}>Project not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 24 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with cover image */}
        <View style={styles.header}>
          {project.cover_image ? (
            <Image source={{ uri: project.cover_image }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons 
                name="folder-image" 
                size={80} 
                color={theme.colors.onSurfaceVariant} 
              />
            </View>
          )}
          <View style={styles.headerOverlay}>
            <View style={styles.headerTop}>
              <IconButton
                icon="arrow-left"
                iconColor="#fff"
                size={24}
                onPress={() => router.back()}
                style={styles.backButton}
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    iconColor="#fff"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  />
                }
              >
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    // Navigate to edit
                  }} 
                  title="Edit Project"
                  leadingIcon="pencil"
                />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    setDeleteDialogVisible(true);
                  }} 
                  title="Delete Project"
                  leadingIcon="delete"
                />
              </Menu>
            </View>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="headlineMedium" style={{ flex: 1, fontWeight: 'bold' }}>
              {project.title}
            </Text>
            <Chip mode="outlined">{project.public_status}</Chip>
          </View>

          {project.description ? (
            <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {project.description}
            </Text>
          ) : null}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={{ marginLeft: 8 }}>
                {narratives.length} Narratives
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="image-multiple" size={20} color={theme.colors.secondary} />
              <Text variant="titleMedium" style={{ marginLeft: 8 }}>
                {getTotalMedia()} Media
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          {/* Narratives Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge">Narratives</Text>
              <Button 
                mode="contained-tonal" 
                icon="plus"
                onPress={() => router.push('/(app)/narratives/create')}
              >
                Add
              </Button>
            </View>

            {narratives.length > 0 ? (
              narratives.map((narrative) => (
                <Card
                  key={narrative.id}
                  style={styles.narrativeCard}
                  onPress={() => router.push(`/(app)/narratives/${narrative.id}`)}
                >
                  <Card.Title
                    title={narrative.title}
                    subtitle={`${narrative.media_count} photos • ${narrative.location_summary || 'No location'}`}
                    left={(props) => 
                      narrative.cover_image ? (
                        <Image 
                          source={{ uri: narrative.cover_image }} 
                          style={styles.narrativeThumb}
                        />
                      ) : (
                        <View style={[styles.narrativeThumbPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                          <MaterialCommunityIcons 
                            name="book-open-page-variant" 
                            size={24} 
                            color={theme.colors.onSurfaceVariant} 
                          />
                        </View>
                      )
                    }
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="chevron-right"
                        onPress={() => router.push(`/(app)/narratives/${narrative.id}`)}
                      />
                    )}
                  />
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons 
                    name="book-plus" 
                    size={48} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                    No narratives in this project yet
                  </Text>
                  <Button 
                    mode="contained" 
                    onPress={() => router.push('/(app)/narratives/create')}
                    style={{ marginTop: 16 }}
                  >
                    Create Narrative
                  </Button>
                </Card.Content>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Project</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onPress={handleDelete} 
              loading={isDeleting}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
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
    height: 250,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  narrativeCard: {
    marginBottom: 8,
  },
  narrativeThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  narrativeThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
