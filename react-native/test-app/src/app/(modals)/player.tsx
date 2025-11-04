// Player modal - Full-screen audio player (Expo Router modal)
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useTheme } from '../../hooks/useTheme';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { PointsCounter } from '../../components/ui/PointsCounter';
import { useToast } from '../../hooks/useToast';
import { hapticService } from '../../utils/hapticFeedback';
import { Confetti } from '../../components/ui/Confetti';

export default function PlayerModal() {
  const { 
    currentPoints,
    pointsEarned,
    progress: pointsProgress,
    isActive,
    startCounting,
    stopCounting,
    resetProgress,  
  } = usePointsCounter();

  const { 
    currentTrack, 
    isPlaying, 
    currentPosition, 
    duration, 
    play, 
    pause, 
    resume, 
    seekTo,
    loading,
    error,
    isBuffering,
    playbackRate,
    setPlaybackRate
  } = useMusicPlayer();
  
  const { showError, showSuccess } = useToast();
  const THEME = useTheme();
  const styles = createStyles(THEME);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevCompletedRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (currentTrack && isPlaying && !isActive) {
      startCounting({
        totalPoints: currentTrack.points,
        durationSeconds: currentTrack.duration,
        challengeId: currentTrack.id,
      });
    }
  
    // if it stops, stop counting
    if ((!isPlaying || !currentTrack) && isActive) {
      stopCounting();
    }
  }, [currentTrack, isPlaying, isActive, startCounting, stopCounting]);

  // Track previous points for milestone detection
  const prevPointsEarnedRef = React.useRef(pointsEarned);

  // Trigger confetti for milestone achievements (25%, 50%, 75%, 100%)
  useEffect(() => {
    if (currentTrack && pointsEarned > prevPointsEarnedRef.current && pointsEarned > 0) {
      const isMilestone = 
        (prevPointsEarnedRef.current < currentTrack.points * 0.25 && pointsEarned >= currentTrack.points * 0.25) ||
        (prevPointsEarnedRef.current < currentTrack.points * 0.5 && pointsEarned >= currentTrack.points * 0.5) ||
        (prevPointsEarnedRef.current < currentTrack.points * 0.75 && pointsEarned >= currentTrack.points * 0.75) ||
        (prevPointsEarnedRef.current < currentTrack.points && pointsEarned >= currentTrack.points);
      
      if (isMilestone) {
        setConfettiTrigger((prev) => prev + 1);
      }
      
      prevPointsEarnedRef.current = pointsEarned;
    }
  }, [pointsEarned, currentTrack]);

  // Trigger confetti and toast when challenge completes
  useEffect(() => {
    if (currentTrack?.completed && !prevCompletedRef.current) {
      // Challenge just completed - trigger big confetti celebration!
      setConfettiTrigger((prev) => prev + 1);
      // Show success toast with delay so it appears above confetti, and longer duration
      setTimeout(() => {
        showSuccess(`Challenge completed! You earned ${currentTrack.points} points! 🎉`, 5000);
      }, 300); // Small delay to ensure toast appears above confetti animation
      prevCompletedRef.current = true;
    } else if (!currentTrack?.completed) {
      prevCompletedRef.current = false;
    }
  }, [currentTrack?.completed, currentTrack?.points, showSuccess]);
  

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!duration || duration === 0) return 0;
    return (currentPosition / duration) * 100;
  };

  const handleSeek = (percentage: number) => {
    if (duration) {
      const newPosition = (percentage / 100) * duration;
      seekTo(newPosition);
    }
  };

  const handlePlayPause = async () => {
    hapticService.playPause();
    if (isPlaying) {
      pause();
    } else {
      if (currentTrack) {
        resume();
      }
    }
  };

  // Show error toast when there's a playback error
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.noTrackCard}>
          <Text style={styles.noTrackText}>No track selected</Text>
          <Text style={styles.noTrackSubtext}>
            Go back and select a challenge to start playing music
          </Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay - Shows when track is loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <GlassCard style={styles.loadingCard}>
            <LoadingSpinner size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Loading track...</Text>
          </GlassCard>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Track Info */}
        <GlassCard style={styles.trackInfoCard}>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          <Text style={styles.trackDescription}>{currentTrack.description}</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Challenge Points</Text>
            <Text style={styles.pointsValue}>{currentTrack.points}</Text>
          </View>
        </GlassCard>

        {/* Progress Section */}
        <GlassCard style={styles.progressCard}>
          <Text style={styles.progressLabel}>Listening Progress</Text>
          
          {/* Progress Bar */}
          <TouchableOpacity 
            style={styles.progressTrack}
            onPress={(event) => {
              const { locationX } = event.nativeEvent;
              // Get width from the layout measurement
              event.currentTarget.measure((x, y, width) => {
                const percentage = (locationX / width) * 100;
                handleSeek(percentage);
              });
            }}
            disabled={loading || isBuffering}
            accessibilityRole="adjustable"
            accessibilityLabel={`Audio progress: ${Math.round(getProgress())}%`}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(getProgress()), text: `${formatTime(currentPosition)} of ${formatTime(duration)}` }}
            accessibilityHint="Double tap and drag to seek to a different position in the track"
            accessibilityState={{ disabled: loading || isBuffering }}
          >
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgress()}%` }
                ]} 
              />
            </View>
          </TouchableOpacity>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
            {isBuffering && (
              <View style={styles.bufferingBadge}>
                <Text style={styles.bufferingText}>Buffering...</Text>
              </View>
            )}
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Progress Percentage */}
          {!isBuffering && (
            <Text style={styles.progressPercentage}>
              {Math.round(getProgress())}% Complete
            </Text>
          )}
        </GlassCard>

        {/* Points Counter - Remove outer GlassCard wrapper */}
        {currentTrack && (
          <PointsCounter
            targetPoints={currentTrack.points}
            earnedPoints={pointsEarned}
            progressPercent={pointsProgress}
            isActive={isActive}
          />
        )}

        {/* Controls */}
        <GlassCard style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            <GlassButton
              title=""
              onPress={() => handleSeek(Math.max(0, getProgress() - (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
              icon={<MaterialIcons name="replay-10" size={24} color={THEME.colors.text.primary} />}
              accessibilityLabel="Rewind 10 seconds"
              accessibilityHint="Double tap to go back 10 seconds in the track"
            />
            
            <GlassButton
              title={loading ? "..." : isPlaying ? "Pause" : "Play"}
              onPress={handlePlayPause}
              variant="primary"
              style={styles.mainControlButton}
              loading={loading}
              icon={!loading && (isPlaying ? (
                <MaterialIcons name="pause" size={24} color={THEME.colors.text.primary} />
              ) : (
                <MaterialIcons name="play-arrow" size={24} color={THEME.colors.text.primary} />
              ))}
              accessibilityLabel={loading ? "Loading" : isPlaying ? "Pause playback" : "Play audio"}
              accessibilityHint={loading ? "Audio is loading" : isPlaying ? "Double tap to pause the current track" : "Double tap to start playback"}
            />
            
            <GlassButton
              title=""
              onPress={() => handleSeek(Math.min(100, getProgress() + (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
              icon={<MaterialIcons name="forward-10" size={24} color={THEME.colors.text.primary} />}
              accessibilityLabel="Forward 10 seconds"
              accessibilityHint="Double tap to skip forward 10 seconds in the track"
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </GlassCard>

        {/* Playback Speed Selector */}
        <GlassCard style={styles.speedCard}>
          <Text style={styles.speedLabel}>Playback Speed</Text>
          <View style={styles.speedButtons}>
            {[0.5, 1.0, 1.25, 2.0].map((rate) => (
              <GlassButton
                key={rate}
                title={rate === 1.0 ? '1x' : `${rate}x`}
                onPress={() => {
                  hapticService.selection();
                  setPlaybackRate(rate);
                }}
                variant={playbackRate === rate ? 'primary' : 'secondary'}
                style={styles.speedButton}
                accessibilityLabel={`Playback speed ${rate === 1.0 ? '1x' : `${rate}x`}${playbackRate === rate ? ', currently selected' : ''}`}
                accessibilityHint="Double tap to change playback speed"
              />
            ))}
          </View>
          <Text style={styles.currentSpeedText}>
            Current: {playbackRate === 1.0 ? '1x' : `${playbackRate}x`}
          </Text>
        </GlassCard>

        {/* Challenge Progress */}
        <GlassCard style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>Challenge Status</Text>
          <View style={styles.challengeInfo}>
            <View style={styles.challengeStatusRow}>
              <MaterialIcons 
                name={currentTrack.completed ? "check-circle" : "headphones"} 
                size={20} 
                color={currentTrack.completed ? THEME.colors.secondary : THEME.colors.accent}
                style={styles.statusIcon}
              />
              <Text style={[
                styles.challengeStatus,
                { color: currentTrack.completed ? THEME.colors.secondary : THEME.colors.accent }
              ]}>
                {currentTrack.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
            <Text style={styles.challengeProgress}>
              {Math.round(currentTrack.progress)}% of challenge complete
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
      {/* Confetti celebration on challenge completion */}
      <Confetti
          trigger={confettiTrigger}   // triggers the animation when this number changes
          count={150}                 // number of confetti pieces
          origin="center"             // explosion from center (use "top" for falling rain)
          explosionSpeed={400}        // speed of the burst
          fallSpeed={3000}            // how long the confetti stays on screen
          onComplete={() => {}}
        />

    </SafeAreaView>
  );
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  },
  noTrackCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  trackInfoCard: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  pointsValue: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  progressCard: {
    marginBottom: THEME.spacing.md,
  },
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    marginBottom: THEME.spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: THEME.colors.glass,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  timeText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  progressPercentage: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    textAlign: 'center',
  },
  controlsCard: {
    marginBottom: THEME.spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  controlButton: {
    //width: 48, // Fixed width for icon-only buttons (square 48x48)
    marginHorizontal: THEME.spacing.xs,
    flex: 0, // Don't flex, use fixed width
    alignSelf: 'center', // Prevent height stretching
    maxHeight: '100%', // Prevent button from stretching in height
    maxWidth: '100%', // Prevent button from stretching in width
  },
  mainControlButton: {
   flex: 1,
   // marginHorizontal: THEME.spacing.xs,
  //  minWidth: 0,
    alignSelf: 'center', // Prevent height stretching
    maxHeight: '100%', // Prevent button from stretching in height
    maxWidth: '100%', // Prevent button from stretching in width
   
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
  challengeCard: {
    marginBottom: THEME.spacing.md,
  },
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  challengeInfo: {
    alignItems: 'center',
  },
  challengeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  statusIcon: {
    marginRight: THEME.spacing.xs,
  },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
  },
  challengeProgress: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.colors.background + 'E6', // 90% opacity (E6 hex)
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
  },
  bufferingBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.sm,
  },
  bufferingText: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  speedCard: {
    marginBottom: THEME.spacing.md,
  },
  speedLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  speedButton: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
    minWidth: 0, // Allow flex to shrink below content size
  },
  currentSpeedText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
  },
});