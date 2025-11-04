// ChallengeCard component - Individual challenge display
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { useTheme } from '../../hooks/useTheme';
import type { MusicChallenge } from '../../types';
import { router } from 'expo-router';

interface ChallengeCardProps {
  challenge: MusicChallenge;
  onPlay: (challenge: MusicChallenge) => void;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
}

const ChallengeCardComponent: React.FC<ChallengeCardProps> = ({
  challenge,
  onPlay,
  isCurrentTrack = false,
  isPlaying = false,
}) => {
  const THEME = useTheme();
  const styles = useMemo(() => createStyles(THEME), [THEME]);
  
  const openDetail = useCallback(() => {
    router.push(`/challenge/${challenge.id}`);
  }, [challenge.id]);

  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const difficultyColor = useMemo(() => {
    switch (challenge.difficulty) {
      case 'easy': return THEME.colors.secondary;
      case 'medium': return THEME.colors.accent;
      case 'hard': return THEME.colors.primary;
      default: return THEME.colors.text.secondary;
    }
  }, [challenge.difficulty, THEME.colors]);

  const buttonTitle = useMemo(() => {
    if (challenge.completed) return 'Completed';
    if (isCurrentTrack && isPlaying) return 'Playing...';
    if (isCurrentTrack && !isPlaying) return 'Resume';
    return 'Play Challenge';
  }, [challenge.completed, isCurrentTrack, isPlaying]);

  const buttonIcon = useMemo(() => {
    if (challenge.completed) {
      return <MaterialIcons name="check-circle" size={20} color={THEME.colors.text.primary} />;
    }
    return null;
  }, [challenge.completed, THEME.colors.text.primary]);

  const handlePlayPress = useCallback(() => {
    onPlay(challenge);
  }, [onPlay, challenge]);

  const formattedDuration = useMemo(
    () => formatDuration(challenge.duration),
    [formatDuration, challenge.duration]
  );

  const gradientColors = useMemo(
    () => isCurrentTrack
      ? THEME.glass.gradientColors.primary
      : THEME.glass.gradientColors.card,
    [isCurrentTrack, THEME.glass.gradientColors]
  );

  const cardStyle = useMemo(
    () => StyleSheet.flatten([
      styles.card,
      isCurrentTrack && styles.currentTrackCard
    ]),
    [styles.card, styles.currentTrackCard, isCurrentTrack]
  );

  const difficultyBadgeStyle = useMemo(
    () => StyleSheet.flatten([
      styles.difficultyBadge,
      { backgroundColor: difficultyColor }
    ]),
    [styles.difficultyBadge, difficultyColor]
  );

  const progressFillStyle = useMemo(
    () => [
      styles.progressFill,
      { width: `${challenge.progress}%` as const }
    ],
    [styles.progressFill, challenge.progress]
  );

  return (
    <GlassCard
      style={cardStyle}
      gradientColors={gradientColors}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={openDetail}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.artist}>{challenge.artist}</Text>
        </View>
        <View style={difficultyBadgeStyle}>
          <Text style={styles.difficultyText}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{formattedDuration}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Points</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.accent }]}> 
            {challenge.points}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Progress</Text>
          <Text style={styles.infoValue}>{Math.round(challenge.progress)}%</Text>
        </View>
      </View>

      {challenge.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={progressFillStyle} />
          </View>
        </View>
      )}

      <GlassButton
        title={buttonTitle}
        onPress={handlePlayPress}
        variant={isCurrentTrack ? 'primary' : 'secondary'}
        disabled={challenge.completed}
        style={styles.playButton}
        icon={buttonIcon}
      />
      </TouchableOpacity>
    </GlassCard>
  );
};

// Memoize component to prevent unnecessary re-renders
export const ChallengeCard = React.memo(ChallengeCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.challenge.id === nextProps.challenge.id &&
    prevProps.challenge.progress === nextProps.challenge.progress &&
    prevProps.challenge.completed === nextProps.challenge.completed &&
    prevProps.isCurrentTrack === nextProps.isCurrentTrack &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.onPlay === nextProps.onPlay
  );
});

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: THEME.spacing.md,
  },
  currentTrackCard: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  difficultyText: {
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: 'bold',
    color: THEME.colors.background,
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: THEME.colors.glass,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  playButton: {
    marginTop: THEME.spacing.sm,
  },
});