/**
 * Projects List Screen for Narratives Mobile App
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, Card, Button, useTheme, ActivityIndicator, FAB, 
  Searchbar, Chip, Portal, Modal, TextInput, HelperText 
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import type { Project } from '../../lib/types';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('date_modified', { ascending: false });
      if (error) throw error;
      setProjects((data ?? []) as Project[]);
      setFilteredProjects((data ?? []) as Project[]);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = projects.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      setCreateError('Project title is required');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          title: newProjectTitle.trim(),
          description: newProjectDescription.trim(),
          owner_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      const project = newProject as Project;
      setProjects(prev => [project, ...prev]);
      setShowCreateModal(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      router.push(`/(app)/project/${project.id}` as any);
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <Card
      style={styles.projectCard}
      onPress={() => router.push(`/(app)/project/${item.id}`)}
    >
      {item.cover_image_url ? (
        <Card.Cover source={{ uri: item.cover_image_url }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons 
            name="folder-image" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
          />
        </View>
      )}
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="titleLarge" numberOfLines={1} style={{ flex: 1 }}>
            {item.title}
          </Text>
          <Chip compact mode="outlined">
            {item.public_status}
          </Chip>
        </View>
        {item.description ? (
          <Text variant="bodyMedium" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="book-open-variant" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ marginLeft: 4 }}>
              narratives
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {new Date(item.date_modified).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="folder-plus-outline" 
        size={80} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text variant="headlineSmall" style={{ marginTop: 16, textAlign: 'center' }}>
        No Projects Yet
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
        Create your first project to organize your narratives
      </Text>
      <Button 
        mode="contained" 
        onPress={() => setShowCreateModal(true)}
        style={{ marginTop: 24 }}
        icon="plus"
      >
        Create Project
      </Button>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search projects..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        color={theme.colors.onPrimary}
      />

      {/* Create Project Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Create New Project</Text>
          
          <TextInput
            label="Project Title"
            value={newProjectTitle}
            onChangeText={setNewProjectTitle}
            mode="outlined"
            style={styles.input}
            error={!!createError && !newProjectTitle.trim()}
          />
          
          <TextInput
            label="Description (optional)"
            value={newProjectDescription}
            onChangeText={setNewProjectDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {createError ? (
            <HelperText type="error" visible={!!createError}>
              {createError}
            </HelperText>
          ) : null}

          <View style={styles.modalActions}>
            <Button 
              mode="text" 
              onPress={() => setShowCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateProject}
              loading={isCreating}
              disabled={isCreating}
            >
              Create
            </Button>
          </View>
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
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  projectCard: {
    marginBottom: 16,
  },
  coverImage: {
    height: 150,
  },
  coverPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
