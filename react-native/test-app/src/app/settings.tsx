// Settings screen - App preferences and testing
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useMusicStore, selectChallenges } from '../stores/musicStore';
import { useUserStore, selectTotalPoints, selectCompletedChallenges } from '../stores/userStore';
import { useThemeStore } from '../stores/themeStore';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';

export default function SettingsScreen() {
  const challenges = useMusicStore(selectChallenges);
  const resetChallenges = useMusicStore((state) => state.resetChallenges);
  const totalPoints = useUserStore(selectTotalPoints);
  const completedChallenges = useUserStore(selectCompletedChallenges);
  const resetProgress = useUserStore((state) => state.resetProgress);
  const { showSuccess, showError, showInfo } = useToast();
  const THEME = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const styles = createStyles(THEME);

  const handleResetAll = () => {
    // Check if there's any data to reset
    const hasProgress = totalPoints > 0 || 
                       completedChallenges.length > 0 || 
                       challenges.some(c => c.progress > 0 || c.completed);
    
    if (!hasProgress) {
      // Already reset - no data to clear
      showInfo('No progress to reset. Everything is already at zero.');
      return;
    }

    Alert.alert(
      'Reset All Progress',
      'This will clear all points, completed challenges, and progress. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            try {
              resetChallenges(); // Reset musicStore challenges
              resetProgress(); // Reset userStore (points and completed)
              showSuccess('All progress has been reset successfully');
            } catch (error) {
              showError('Failed to reset progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Appearance Section */}
      <GlassCard style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="palette" size={24} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Appearance</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Switch between light and dark mode
        </Text>
        <GlassButton
          title={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
          onPress={toggleTheme}
          variant="secondary"
          style={styles.button}
          icon={<MaterialIcons 
            name={themeMode === 'dark' ? "dark-mode" : "light-mode"} 
            size={20} 
            color={THEME.colors.text.primary} 
          />}
        />
      </GlassCard>

      {/* Testing Section */}
      <GlassCard style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="bug-report" size={24} color={THEME.colors.accent} />
          <Text style={styles.sectionTitle}>Testing</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Reset all progress and start fresh. This is useful for testing the app.
        </Text>
        <GlassButton
          title="Reset All Progress"
          onPress={handleResetAll}
          variant="secondary"
          style={styles.button}
          icon={<MaterialIcons 
            name="refresh" 
            size={20} 
            color={THEME.colors.text.primary} 
          />}
        />
      </GlassCard>
    </ScrollView>
  );
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  },
  card: {
    marginBottom: THEME.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.sm,
  },
  sectionDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 20,
  },
  button: {
    marginTop: THEME.spacing.xs,
  },
});

