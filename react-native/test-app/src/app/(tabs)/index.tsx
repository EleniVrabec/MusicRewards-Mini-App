// Home screen - Challenge list (Expo Router)
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChallengeList } from '../../components/challenge/ChallengeList';
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from '../../stores/musicStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../stores/themeStore';
import { useChallenges } from '../../hooks/useChallenges';

export default function HomeScreen() {
  const { challenges, loading, error, refreshChallenges } = useChallenges();
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const THEME = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const styles = useMemo(() => createStyles(THEME), [themeMode]);

  const handleRefresh = useCallback(async () => {
    await refreshChallenges();
  }, [refreshChallenges]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Music Challenges</Text>
      <Text style={styles.subtitle}>
        Complete listening challenges to earn points and unlock achievements
      </Text>
      <ChallengeList
        challenges={challenges}
        loading={loading}
        error={error}
        currentTrackId={currentTrack?.id || null}
        isPlaying={isPlaying}
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    </View>
  );
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});