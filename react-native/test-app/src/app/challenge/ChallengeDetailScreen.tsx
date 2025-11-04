// ChallengeDetailScreen - Presentation component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { useTheme } from '../../hooks/useTheme';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import type { MusicChallenge } from '../../types';

interface ChallengeDetailScreenProps {
  challenge: MusicChallenge;
}

export default function ChallengeDetailScreen({ challenge }: ChallengeDetailScreenProps) {
  const THEME = useTheme();
  const styles = createStyles(THEME);
  
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
    ? 'Challenge Completed'
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

  // Format difficulty with capital first letter
  const difficultyDisplay = challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1);
  
  // Get difficulty color
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return THEME.colors.secondary;
      case 'medium': return THEME.colors.accent;
      case 'hard': return THEME.colors.primary;
      default: return THEME.colors.text.primary;
    }
  };
  
  // Format duration
  const durationMinutes = Math.floor(challenge.duration / 60);
  const durationSeconds = challenge.duration % 60;
  const durationDisplay = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  // Calculate time remaining
  const timeRemaining = challenge.completed
    ? 0
    : Math.ceil((challenge.duration * (100 - progressPercent)) / 100);
  const timeRemainingMinutes = Math.floor(timeRemaining / 60);
  const timeRemainingSeconds = timeRemaining % 60;
  const timeRemainingDisplay = timeRemaining > 0
    ? `~${timeRemainingMinutes}:${timeRemainingSeconds.toString().padStart(2, '0')} remaining`
    : null;

  // Format completion date
  const formatCompletionDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `Completed on ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (challenge.completed) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
          <MaterialIcons name="check-circle" size={16} color={THEME.colors.secondary} />
          <Text style={styles.statusBadgeText}>Completed</Text>
        </View>
      );
    }
    if (isThisCurrent && isPlaying) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgePlaying]}>
          <MaterialIcons name="play-circle-filled" size={16} color={THEME.colors.primary} />
          <Text style={styles.statusBadgeText}>Now Playing</Text>
        </View>
      );
    }
    if (progressPercent > 0) {
      return (
        <View style={styles.statusBadge}>
          <MaterialIcons name="schedule" size={16} color={THEME.colors.text.secondary} />
          <Text style={styles.statusBadgeText}>In Progress</Text>
        </View>
      );
    }
    return null;
  };

  // Get button icon
  const getButtonIcon = () => {
    if (challenge.completed) {
      return <MaterialIcons name="check-circle" size={20} color={THEME.colors.text.primary} />;
    }
    if (isThisCurrent && isPlaying) {
      return <MaterialIcons name="pause" size={20} color={THEME.colors.text.primary} />;
    }
    if (isThisCurrent && !isPlaying) {
      return <MaterialIcons name="play-arrow" size={20} color={THEME.colors.text.primary} />;
    }
    return <MaterialIcons name="play-arrow" size={20} color={THEME.colors.text.primary} />;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Section - Title and Artist */}
      <View style={styles.heroSection}>
        {getStatusBadge()}
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.artist}>{challenge.artist}</Text>
        <Text style={styles.description}>{challenge.description}</Text>
      </View>

      {/* Info Card - Stats */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>Challenge Details</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons 
              name="trending-up" 
              size={24} 
              color={getDifficultyColor()} 
              style={styles.metaIcon}
            />
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={[styles.metaValueDifficulty, { color: getDifficultyColor() }]}>
              {difficultyDisplay}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons 
              name="stars" 
              size={24} 
              color={THEME.colors.accent} 
              style={styles.metaIcon}
            />
            <Text style={styles.metaLabel}>Points</Text>
            <Text style={styles.metaValueAccent}>{challenge.points}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons 
              name="timer" 
              size={24} 
              color={THEME.colors.text.secondary} 
              style={styles.metaIcon}
            />
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{durationDisplay}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Progress Card */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progressPercent}%
        </Text>
        {timeRemainingDisplay && (
          <Text style={styles.timeRemaining}>{timeRemainingDisplay}</Text>
        )}
        {challenge.completedAt && (
          <Text style={styles.completedDate}>{formatCompletionDate(challenge.completedAt)}</Text>
        )}
      </GlassCard>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <GlassButton
          title={buttonTitle}
          onPress={handlePrimaryPress}
          variant="primary"
          disabled={challenge.completed}
          icon={getButtonIcon()}
        />
      </View>
    </ScrollView>
  );
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    paddingBottom: THEME.spacing.xl,
  },
  // Hero Section
  heroSection: {
    padding: THEME.spacing.xl,
    paddingBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.glass,
  },
  statusBadgeText: {
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.xs,
  },
  statusBadgeCompleted: {
    backgroundColor: THEME.colors.secondary + '20',
  },
  statusBadgePlaying: {
    backgroundColor: THEME.colors.primary + '20',
  },
  title: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
    textAlign: 'center',
  },
  artist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: THEME.spacing.md,
  },
  completedDate: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginTop: THEME.spacing.sm,
    textAlign: 'center',
  },
  // Card Styles
  card: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  cardTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  // Info Card
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: THEME.spacing.sm,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    marginBottom: THEME.spacing.xs,
  },
  metaLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: THEME.fonts.sizes.xl,
    color: THEME.colors.text.primary,
    fontWeight: 'bold',
  },
  metaValueAccent: {
    fontSize: THEME.fonts.sizes.xl,
    color: THEME.colors.accent,
    fontWeight: 'bold',
  },
  metaValueDifficulty: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
  },
  // Progress Card
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: THEME.colors.glass,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: THEME.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
  },
  progressText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  timeRemaining: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
  },
  // Action Button
  actionSection: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
});
