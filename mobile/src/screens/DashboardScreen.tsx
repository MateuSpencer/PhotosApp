/**
 * Dashboard/Home Screen for Narratives Mobile App
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, FAB, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import type { Narrative, Project } from '../../lib/types';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    narratives: 0,
    media: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentNarratives, setRecentNarratives] = useState<Narrative[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [{ data: projects }, { data: narratives }, { count: mediaCount }] = await Promise.all([
        supabase.from('projects').select('*').order('date_modified', { ascending: false }),
        supabase.from('narratives').select('*').order('date_modified', { ascending: false }),
        supabase.from('media_items').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        projects: projects?.length ?? 0,
        narratives: narratives?.length ?? 0,
        media: mediaCount ?? 0,
      });

      setRecentProjects((projects ?? []).slice(0, 3) as Project[]);
      setRecentNarratives((narratives ?? []).slice(0, 5) as Narrative[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Here's your storytelling overview
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="folder-multiple" size={32} color={theme.colors.primary} />
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {stats.projects}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                Projects
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="book-open-variant" size={32} color={theme.colors.secondary} />
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                {stats.narratives}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
                Narratives
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="image-multiple" size={32} color={theme.colors.tertiary} />
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                {stats.media}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>
                Media Items
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge">Recent Projects</Text>
            <Button mode="text" onPress={() => router.push('/(app)/projects')}>
              View All
            </Button>
          </View>
          
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <Card
                key={project.id}
                style={styles.projectCard}
                onPress={() => router.push(`/(app)/project/${project.id}`)}
              >
                <Card.Title
                  title={project.title}
                  subtitle={`${(project as any).narratives_count ?? 0} narratives`}
                  left={(props) => (
                    <MaterialCommunityIcons 
                      {...props} 
                      name="folder" 
                      size={40} 
                      color={theme.colors.primary} 
                    />
                  )}
                  right={(props) => (
                    <Chip compact style={{ marginRight: 8 }}>
                      {project.public_status}
                    </Chip>
                  )}
                />
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons 
                  name="folder-plus" 
                  size={48} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  No projects yet
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(app)/projects')}
                  style={{ marginTop: 16 }}
                >
                  Create Your First Project
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Recent Narratives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge">Recent Narratives</Text>
            <Button mode="text" onPress={() => router.push('/(app)/dashboard' as any)}>
              View All
            </Button>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.narrativesScroll}
          >
            {recentNarratives.length > 0 ? (
              recentNarratives.map((narrative) => (
                <Card
                  key={narrative.id}
                  style={styles.narrativeCard}
                  onPress={() => router.push(`/(app)/narrative/${narrative.id}`)}
                >
                  {narrative.cover_image_url ? (
                    <Card.Cover source={{ uri: narrative.cover_image_url }} style={styles.narrativeCover} />
                  ) : (
                    <View style={[styles.narrativePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <MaterialCommunityIcons 
                        name="image" 
                        size={48} 
                        color={theme.colors.onSurfaceVariant} 
                      />
                    </View>
                  )}
                  <Card.Content style={styles.narrativeContent}>
                    <Text variant="titleMedium" numberOfLines={1}>{narrative.title}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {narrative.location_summary || 'No location'}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Card style={[styles.narrativeCard, styles.emptyNarrativeCard]}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons 
                    name="book-plus" 
                    size={40} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                    Start a narrative
                  </Text>
                </Card.Content>
              </Card>
            )}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Button 
              mode="outlined" 
              icon="camera"
              onPress={() => router.push('/(app)/upload')}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Upload Photos
            </Button>
            <Button 
              mode="outlined" 
              icon="map-marker"
              onPress={() => router.push('/(app)/map')}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Explore Map
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* FAB for quick upload */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(app)/upload')}
        color={theme.colors.onPrimary}
      />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 3,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectCard: {
    marginBottom: 8,
  },
  emptyCard: {
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  narrativesScroll: {
    paddingRight: 16,
  },
  narrativeCard: {
    width: 200,
    marginRight: 12,
  },
  narrativeCover: {
    height: 120,
  },
  narrativePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  narrativeContent: {
    paddingVertical: 8,
  },
  emptyNarrativeCard: {
    justifyContent: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
