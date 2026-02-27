/**
 * Initial route - handles Landing Page (Web) and Auth Redirect (Native/Web Logged in)
 */
import React from 'react';
import { Redirect, Link } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View, Platform, StyleSheet, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import darkTheme from '../src/constants/theme';
import UniversalGlobe from '../components/UniversalGlobe';

export default function Index() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkTheme.colors.background }}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  // If user is logged in, always redirect to dashboard regardless of platform
  if (user) {
    return <Redirect href="/(app)/dashboard" />;
  }

  // If on Native, redirect to Login immediately (Mobile app flow)
  if (Platform.OS !== 'web') {
    return <Redirect href="/(auth)/login" />;
  }

  // WEB LANDING PAGE

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Narratives</Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        <View style={[styles.heroContent, { padding: isLargeScreen ? 60 : 30 }]}>
          <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 56 : 40 }]}>
            Discover the World Through Stories
          </Text>
          <Text style={styles.heroSubtitle}>
            Map your memories, explore narratives, and see the world in a new light.
          </Text>

          <View style={styles.ctaContainer}>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Globe Visualization */}
        <View style={styles.globeContainer}>
          <UniversalGlobe />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    // flexDirection handled dynamically
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 800,
    zIndex: 10,
  },
  heroTitle: {
    color: 'white',
    fontWeight: '800',
    marginBottom: 24,
    lineHeight: 56, // Pixel-based lineHeight required by React Native
    flexWrap: 'wrap',
  },
  heroSubtitle: {
    color: '#bbb',
    fontSize: 20,
    marginBottom: 40,
    maxWidth: 600,
    lineHeight: 30,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
  },
  globeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
