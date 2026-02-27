import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MediaItem } from '../../lib/types';

interface MapViewComponentProps {
    mediaItems: MediaItem[];
    onMediaPress?: (media: MediaItem) => void;
    showControls?: boolean;
}

export default function MapViewComponent({
    mediaItems
}: MapViewComponentProps) {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons
                name="map-clock"
                size={64}
                color={theme.colors.onSurfaceVariant}
            />
            <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
                Map View
            </Text>
            <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
            >
                Interactive map is currently optimized for mobile devices.
                Web support coming soon.
            </Text>
            <View style={styles.stats}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                    {mediaItems.length} items loaded
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    stats: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8
    }
});
