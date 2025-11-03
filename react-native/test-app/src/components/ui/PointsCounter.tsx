import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { THEME } from '../../constants/theme';

interface PointsCounterProps {
  targetPoints: number;          // e.g. 300 from the challenge
  earnedPoints: number;          // e.g. 120 from hook
  progressPercent: number;       // 0-100 from hook
  isActive?: boolean;            // playing or paused
}

export const PointsCounter: React.FC<PointsCounterProps> = ({
  targetPoints,
  earnedPoints,
  progressPercent,
  isActive = false,
}) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Points progress</Text>
        <Text style={styles.value}>
          {earnedPoints} / {targetPoints}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(progressPercent, 100)}%`, opacity: isActive ? 1 : 0.5 },
          ]}
        />
      </View>

      <Text style={styles.statusText}>
        {isActive ? 'Counting…' : 'Paused'}
      </Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  value: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.accent,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME.colors.secondary,
    borderRadius: 3,
  },
  statusText: {
    marginTop: THEME.spacing.xs,
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.secondary,
  },
});
