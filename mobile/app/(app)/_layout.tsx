/**
 * App group layout - authenticated screens with Drawer navigation (Sidebar)
 */
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import darkTheme from '../../src/constants/theme';
import { Platform } from 'react-native';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true, // Show header with hamburger
          drawerStyle: {
            backgroundColor: darkTheme.colors.surface,
            width: 280,
          },
          drawerLabelStyle: {
            color: 'white',
          },
          drawerActiveBackgroundColor: darkTheme.colors.primary,
          drawerActiveTintColor: 'white',
          drawerInactiveTintColor: darkTheme.colors.onSurfaceVariant,
          headerStyle: {
            backgroundColor: darkTheme.colors.surface,
          },
          headerTintColor: 'white',
          drawerType: Platform.OS === 'web' && window.innerWidth >= 900 ? 'permanent' : 'front',
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            title: 'Home',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="projects"
          options={{
            title: 'Projects',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="folder" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="upload"
          options={{
            title: 'Upload',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="camera-plus" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="map"
          options={{
            title: 'Map',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden screens */}
        <Drawer.Screen
          name="project/[id]"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Project Details'
          }}
        />
        <Drawer.Screen
          name="narrative/[id]"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Narrative'
          }}
        />
        <Drawer.Screen
          name="timeline/[narrativeId]"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Timeline'
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
