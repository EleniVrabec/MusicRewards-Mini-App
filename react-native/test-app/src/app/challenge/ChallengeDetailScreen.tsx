// ChallengeDetailScreen - Presentation component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { THEME } from '../../constants/theme';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import type { MusicChallenge } from '../../types';

interface ChallengeDetailScreenProps {
  challenge: MusicChallenge;
}

export default function ChallengeDetailScreen({ challenge }: ChallengeDetailScreenProps) {
  // Get player state
  const {
    play,
    resume,
    currentTrack,
    isPlaying,
  } = useMusicPlayer();

  // Derive UI state
  const isThisCurrent = currentTrack?.id === challenge.id;
  const progressPercent = Math.round(challenge.progress);

  // Determine button label based on state
  const buttonTitle = challenge.completed
    ? 'Completed ✓'
    : isThisCurrent && isPlaying
    ? 'Playing...'
    : isThisCurrent && !isPlaying
    ? 'Resume'
    : 'Play this challenge';

  const handlePrimaryPress = async () => {
    // Already completed -> do nothing
    if (challenge.completed) return;

    // If it's the same track but paused -> just resume
    if (isThisCurrent && !isPlaying) {
      await resume();
      router.push('/(modals)/player');
      return;
    }

    // Otherwise start this challenge and open player modal
    await play(challenge);
    router.push('/(modals)/player');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <GlassCard style={styles.card}>
        {/* Challenge info */}
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.artist}>{challenge.artist}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        {/* Meta information */}
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

        {/* Progress */}
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

        {/* Main action button */}
        <GlassButton
          title={buttonTitle}
          onPress={handlePrimaryPress}
          variant="primary"
          disabled={challenge.completed}
          style={styles.playButton}
        />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    padding: THEME.spacing.lg,
  },
  card: {
    padding: THEME.spacing.lg,
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
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  metaLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.xs,
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
    marginBottom: THEME.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
  },
  progressText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.lg,
  },
  playButton: {
    marginTop: THEME.spacing.md,
  },
});

