// app/(modals)/challenge-detail.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { THEME } from '../../constants/theme';
import { useMusicStore, selectChallenges } from '../../stores/musicStore';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';

export default function ChallengeDetailModal() {
  // id can be "challenge-1" or ["challenge-1"] depending on how you navigate
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const challengeId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;

  const challenges = useMusicStore(selectChallenges);

  // player state
  const {
    play,
    resume,
    currentTrack,
    isPlaying,
  } = useMusicPlayer();

  // find challenge in store
  const challenge = useMemo(
    () => challenges.find((c) => c.id === challengeId),
    [challenges, challengeId]
  );

  // if invalid id
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Challenge not found</Text>
          <Text style={styles.description}>
            The challenge you opened doesn’t exist anymore.
          </Text>
          <GlassButton title="Close" onPress={() => router.back()} />
        </GlassCard>
      </SafeAreaView>
    );
  }

  // derive UI state
  const isThisCurrent = currentTrack?.id === challenge.id;
  const progressPercent = Math.round(challenge.progress);

  // decide button label 
  const buttonTitle = challenge.completed
    ? 'Completed ✓'
    : isThisCurrent && isPlaying
    ? 'Playing...'
    : isThisCurrent && !isPlaying
    ? 'Resume'
    : 'Play this challenge';

  const handlePrimaryPress = async () => {
    // already completed -> do nothing
    if (challenge.completed) return;

    // if it's the same track but paused -> just resume
    if (isThisCurrent && !isPlaying) {
      await resume();
      router.push('/(modals)/player');
      return;
    }

    // otherwise start this challenge
    await play(challenge);
    router.push('/(modals)/player');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Challenge detail</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.card}>
        {/* title / artist / desc */}
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.artist}>{challenge.artist}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        {/* meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={styles.metaValue}>{challenge.difficulty}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Points</Text>
            <Text style={[styles.metaValue, { color: THEME.colors.accent }]}>
              {challenge.points}
            </Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>
              {Math.floor(challenge.duration / 60)}:
              {(challenge.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* progress */}
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progressPercent}% completed
        </Text>

        {/* main action */}
        <GlassButton
          title={buttonTitle}
          onPress={handlePrimaryPress}
          variant="primary"
          disabled={challenge.completed}
          style={{ marginTop: THEME.spacing.lg }}
        />
      </GlassCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerText: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  closeText: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
  },
  card: {
    flex: 1,
  },
  title: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  metaLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
  },
  metaValue: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
  },
  progressText: {
    marginTop: THEME.spacing.xs,
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
});
