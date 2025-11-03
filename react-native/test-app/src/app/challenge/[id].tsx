// Challenge Detail Route Handler - Data fetching and error handling
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { THEME } from '../../constants/theme';
import { useMusicStore, selectChallenges } from '../../stores/musicStore';
import ChallengeDetailScreen from './ChallengeDetailScreen';

export default function ChallengeDetail() {
  // Get challenge ID from dynamic route parameter
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenges = useMusicStore(selectChallenges);

  // Find challenge in store (single source of truth)
  const challenge = useMemo(
    () => challenges.find((c) => c.id === id),
    [challenges, id]
  );

  // Handle invalid challenge ID
  if (!id) {
    return (
      <ScrollView style={styles.container}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Invalid Challenge</Text>
          <Text style={styles.description}>
            No challenge ID provided.
          </Text>
          <GlassButton title="Go Back" onPress={() => router.back()} />
        </GlassCard>
      </ScrollView>
    );
  }

  // Loading state (in case we add async fetching later)
  if (!challenge && challenges.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading challenge...</Text>
      </View>
    );
  }

  // Challenge not found
  if (!challenge) {
    return (
      <ScrollView style={styles.container}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Challenge not found</Text>
          <Text style={styles.description}>
            The challenge you opened doesn't exist anymore.
          </Text>
          <Text style={styles.idText}>ID: {id}</Text>
          <GlassButton title="Go Back" onPress={() => router.back()} />
        </GlassCard>
      </ScrollView>
    );
  }

  // Render the detail screen with challenge data
  return <ChallengeDetailScreen challenge={challenge} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
  },
  card: {
    padding: THEME.spacing.lg,
    margin: THEME.spacing.lg,
  },
  title: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 20,
  },
  idText: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.md,
  },
});
