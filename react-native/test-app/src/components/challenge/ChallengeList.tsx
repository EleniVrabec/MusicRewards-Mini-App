// ChallengeList component - Wrapper for challenge list with states
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ChallengeCard } from './ChallengeCard';
import { GlassCard } from '../ui/GlassCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../stores/themeStore';
import type { MusicChallenge } from '../../types';

interface ChallengeListProps {
  challenges: MusicChallenge[];
  loading?: boolean;
  error?: string | null;
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ChallengeListComponent: React.FC<ChallengeListProps> = ({
  challenges,
  loading = false,
  error = null,
  currentTrackId,
  isPlaying = false,
  onRefresh,
  refreshing = false,
}) => {
  const THEME = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const styles = useMemo(() => createStyles(THEME), [themeMode]);

  // Memoize refresh control
  const refreshControl = useMemo(
    () => onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={THEME.colors.accent}
        colors={[THEME.colors.accent]}
      />
    ) : undefined,
    [onRefresh, refreshing, themeMode]
  );

  // Memoize render function
  const renderChallenge = useCallback(({ item }: { item: MusicChallenge }) => (
    <ChallengeCard
      challenge={item}
      isCurrentTrack={currentTrackId === item.id}
      isPlaying={isPlaying}
    />
  ), [currentTrackId, isPlaying]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: MusicChallenge) => item.id, []);

  // Loading state
  if (loading && challenges.length === 0) {
    return (
      <LoadingSpinner
        size="large"
        message="Loading challenges..."
        fullScreen={false}
      />
    );
  }

  // Error state
  if (error && challenges.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <GlassCard style={styles.errorCard}>
          <Text style={styles.errorTitle}>Error Loading Challenges</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          {onRefresh && (
            <Text style={styles.retryText} onPress={onRefresh}>
              Tap to retry
            </Text>
          )}
        </GlassCard>
      </View>
    );
  }

  // Empty state
  if (!loading && challenges.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <GlassCard style={styles.emptyCard}>
          <MaterialIcons name="library-music" size={48} color={THEME.colors.text.secondary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Challenges Available</Text>
          <Text style={styles.emptyMessage}>
            Check back later for new music challenges to complete!
          </Text>
        </GlassCard>
      </View>
    );
  }

  // Memoize footer component
  const ListFooterComponent = useMemo(
    () => loading && challenges.length > 0 ? (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    ) : null,
    [loading, challenges.length, styles.footerLoader]
  );

  return (
    <FlatList
      data={challenges}
      renderItem={renderChallenge}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListFooterComponent={ListFooterComponent}
      removeClippedSubviews={true} // Performance optimization
      maxToRenderPerBatch={10} // Performance optimization
      windowSize={10} // Performance optimization
    />
  );
};

// Memoize component to prevent unnecessary re-renders
export const ChallengeList = React.memo(ChallengeListComponent);

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  listContainer: {
    paddingBottom: THEME.spacing.xl,
  },
  errorCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  errorMessage: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  retryText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.accent,
    fontWeight: '600',
    marginTop: THEME.spacing.sm,
  },
  emptyCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: THEME.spacing.md,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  emptyMessage: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
  },
});
