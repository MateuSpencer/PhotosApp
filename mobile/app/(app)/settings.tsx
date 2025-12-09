/**
 * Settings Screen - User preferences and account management
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import {
  Text,
  useTheme,
  List,
  Switch,
  Divider,
  Button,
  Avatar,
  Card,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  
  // Settings state
  const [autoUpload, setAutoUpload] = useState(false);
  const [highQualityThumbnails, setHighQualityThumbnails] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
            Settings
          </Text>
        </View>

        {/* User Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={64}
              label={getInitials(user?.username)}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {user?.username || 'User'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.email || 'No email'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Media Settings */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Media Settings
          </List.Subheader>
          
          <List.Item
            title="Auto-upload photos"
            description="Automatically upload new photos to your narratives"
            left={props => <List.Icon {...props} icon="cloud-upload" />}
            right={() => (
              <Switch
                value={autoUpload}
                onValueChange={setAutoUpload}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
          
          <Divider />
          
          <List.Item
            title="High quality thumbnails"
            description="Use higher resolution thumbnails (uses more data)"
            left={props => <List.Icon {...props} icon="image-size-select-large" />}
            right={() => (
              <Switch
                value={highQualityThumbnails}
                onValueChange={setHighQualityThumbnails}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </List.Section>

        {/* Privacy Settings */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Privacy
          </List.Subheader>
          
          <List.Item
            title="Location services"
            description="Allow app to access photo location data"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
          
          <Divider />
          
          <List.Item
            title="Notifications"
            description="Receive push notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </List.Section>

        {/* Storage */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Storage
          </List.Subheader>
          
          <List.Item
            title="Clear cache"
            description="Remove cached images and data"
            left={props => <List.Icon {...props} icon="cached" />}
            onPress={() => {
              Alert.alert(
                'Clear Cache',
                'This will remove all cached images. You can reload them from the server.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Cache cleared'),
                  },
                ]
              );
            }}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </List.Section>

        {/* About */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            About
          </List.Subheader>
          
          <List.Item
            title="Version"
            description={Constants.expoConfig?.version || '1.0.0'}
            left={props => <List.Icon {...props} icon="information" />}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Linking.openURL('https://example.com/privacy')}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Linking.openURL('https://example.com/terms')}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </List.Section>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            textColor={theme.colors.error}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          >
            Log Out
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Narratives © 2024
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to log out? You'll need to sign in again to access your narratives.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={confirmLogout} textColor={theme.colors.error}>
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  listItem: {
    paddingHorizontal: 16,
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 32,
  },
  logoutButton: {
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
});
