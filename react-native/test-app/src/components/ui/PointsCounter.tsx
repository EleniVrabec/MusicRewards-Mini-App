import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { hapticService } from '../../utils/hapticFeedback';

interface PointsCounterProps {
  targetPoints: number;          // e.g. 300 from the challenge
  earnedPoints: number;          // e.g. 120 from hook
  progressPercent: number;       // 0-100 from hook
  isActive?: boolean;            // playing or paused
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: THEME.spacing.md,
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
    backgroundColor: THEME.colors.glass,
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

const PointsCounterComponent: React.FC<PointsCounterProps> = ({
  targetPoints,
  earnedPoints,
  progressPercent,
  isActive = false,
}) => {
  const THEME = useTheme();
  const styles = useMemo(() => createStyles(THEME), [THEME]);
  
  // Animation for points increase
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevEarnedRef = useRef(earnedPoints);
  
  // Animate when points increase
  useEffect(() => {
    if (earnedPoints > prevEarnedRef.current && earnedPoints > 0) {
      // Trigger haptic feedback on points increase
      hapticService.pointsIncrease();
      
      // Scale animation on points increase
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 100,
          friction: 4,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 4,
        }),
      ]).start();
      
      prevEarnedRef.current = earnedPoints;
    }
  }, [earnedPoints, scaleAnim]);

  // Progress bar width animation
  const progressAnim = useRef(new Animated.Value(progressPercent)).current;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(progressPercent, 100),
      duration: 300,
      useNativeDriver: false, // Width animation requires layout animations
    }).start();
  }, [progressPercent, progressAnim]);
  
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Points progress</Text>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.value}>
            {earnedPoints} / {targetPoints}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              opacity: isActive ? 1 : 0.5 
            },
          ]}
        />
      </View>

      <Text style={styles.statusText}>
        {isActive ? 'Counting…' : 'Paused'}
      </Text>
    </GlassCard>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PointsCounter = React.memo(PointsCounterComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if actual values change
  return (
    prevProps.targetPoints === nextProps.targetPoints &&
    prevProps.earnedPoints === nextProps.earnedPoints &&
    prevProps.progressPercent === nextProps.progressPercent &&
    prevProps.isActive === nextProps.isActive
  );
});
