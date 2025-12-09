import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UniversalGlobe() {
    return (
        <View style={styles.container}>
            <View style={styles.globePlaceholder}>
                <Surface style={styles.globeCircle} elevation={4}>
                    <MaterialCommunityIcons name="earth" size={300} color="#2563eb" />
                </Surface>

                <View style={styles.orbitContainer}>
                    <View style={styles.orbitDot} />
                </View>
            </View>
            <Text style={styles.caption}>Global Narratives</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
    },
    globePlaceholder: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    globeCircle: {
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    orbitContainer: {
        position: 'absolute',
        width: 400,
        height: 100,
        borderRadius: 200,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        transform: [{ rotate: '-15deg' }],
    },
    orbitDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f97316',
        position: 'absolute',
        top: 0,
        left: 40,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    caption: {
        marginTop: 20,
        color: '#64748b',
        fontSize: 16,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
