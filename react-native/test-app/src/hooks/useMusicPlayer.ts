// useMusicPlayer hook - Integrates react-native-track-player with Zustand
import { useCallback, useEffect, useState, useRef } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { MusicChallenge, UseMusicPlayerReturn } from '../types';
import {
  resetPlayer,
  addTrack,
  playTrack,
  pauseTrack,
  seekToPosition,
  setPlaybackRate as setPlaybackRateService,
  getPlaybackRate,
} from '../services/audioService';
import { hapticService } from '../utils/hapticFeedback';

export const useMusicPlayer = (): UseMusicPlayerReturn => {
  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  
  // Zustand store selectors
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const setCurrentPosition = useMusicStore((state) => state.setCurrentPosition);
  const updateProgress = useMusicStore((state) => state.updateProgress);
  const markChallengeComplete = useMusicStore((state) => state.markChallengeComplete);
  const addPoints = useUserStore((state) => state.addPoints);
  const completeChallenge = useUserStore((state) => state.completeChallenge);

  // Track playback state changes
  useEffect(() => {
    // Extract state value (usePlaybackState returns State enum directly)
    const stateValue: State = typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState
      ? (playbackState as { state: State }).state
      : (playbackState as State);
    const isCurrentlyPlaying = stateValue === State.Playing;
    const isCurrentlyBuffering = stateValue === State.Buffering;
    
    if (isCurrentlyPlaying !== isPlaying) {
      setIsPlaying(isCurrentlyPlaying);
    }
    
    setIsBuffering(isCurrentlyBuffering);
  }, [playbackState, isPlaying, setIsPlaying]);

  // Update position (always live)
  useEffect(() => {
    if (currentTrack && progress.position > 0) {
      setCurrentPosition(progress.position);
    }
  }, [progress.position, currentTrack, setCurrentPosition]);

  // Track previous isPlaying state to detect pause transitions
  const prevIsPlayingRef = useRef(isPlaying);

  // Update challenge progress percentage when paused
  useEffect(() => {
    if (currentTrack && progress.position > 0 && progress.duration > 0) {
      // Calculate progress percentage
      const progressPercentage = (progress.position / progress.duration) * 100;
      
      // Always check for completion (even while playing)
      if (progressPercentage >= 90 && !currentTrack.completed) {
        // Trigger success haptic feedback for challenge completion
        hapticService.challengeComplete();
        
        markChallengeComplete(currentTrack.id);
        completeChallenge(currentTrack.id);
        addPoints(currentTrack.points);
        // Update progress to 100% when completed
        updateProgress(currentTrack.id, 100);
      }
    }
  }, [progress.position, progress.duration, currentTrack, updateProgress, markChallengeComplete, completeChallenge, addPoints]);

  // Update progress when transitioning from playing to paused
  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    const nowPlaying = isPlaying;
    
    // If we transitioned from playing to paused, update progress
    if (wasPlaying && !nowPlaying && currentTrack && progress.position > 0 && progress.duration > 0) {
      const progressPercentage = (progress.position / progress.duration) * 100;
      updateProgress(currentTrack.id, progressPercentage);
    }
    
    // Update ref for next comparison
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, currentTrack, progress.position, progress.duration, updateProgress]);

  // Handle track player events
  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    }
  });

  const play = useCallback(async (track: MusicChallenge) => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset and add new track
      await resetPlayer();
      await addTrack({
        id: track.id,
        url: track.audioUrl,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      });
      
      // Restore saved position if track has progress
      // Calculate position in seconds from progress percentage
      if (track.progress > 0 && track.progress < 100 && track.duration > 0) {
        const savedPosition = (track.progress / 100) * track.duration;
        // Seek to saved position before starting playback
        await seekToPosition(savedPosition);
      }
      
      // Start playback
      await playTrack();
      setCurrentTrack(track);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Playback failed';
      setError(errorMessage);
      console.error('TrackPlayer error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCurrentTrack]);

  const pause = useCallback(async () => {
    try {
     // await TrackPlayer.pause();
      await pauseTrack();
    } catch (err) {
      console.error('Pause error:', err);
    }
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    try {
     // await TrackPlayer.seekTo(seconds);
      await seekToPosition(seconds);
    } catch (err) {
      console.error('Seek error:', err);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
     // await TrackPlayer.play();
      await playTrack();
    } catch (err) {
      console.error('Resume error:', err);
    }
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    try {
      await setPlaybackRateService(rate);
      setPlaybackRateState(rate);
    } catch (err) {
      console.error('Set playback rate error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to set playback rate';
      setError(errorMessage);
    }
  }, []);

  // Load initial playback rate when a track is loaded
  // Don't load on mount since TrackPlayer might not be initialized yet
  useEffect(() => {
    if (!currentTrack) return; // Wait until we have a track
    
    const loadInitialRate = async () => {
      try {
        const rate = await getPlaybackRate();
        setPlaybackRateState(rate);
      } catch (err) {
        // Silently fail - default to 1.0 (already set in state)
        // Error is expected if TrackPlayer isn't initialized yet
      }
    };
    loadInitialRate();
  }, [currentTrack]);

  // Extract value for isPlaying return as well
  const finalStateValue: State = typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState
    ? (playbackState as { state: State }).state
    : (playbackState as State);
  return {
    isPlaying: finalStateValue === State.Playing,
    currentTrack,
    currentPosition: progress.position,
    duration: progress.duration,
    play,
    pause,
    seekTo,
    resume,
    loading,
    error,
    isBuffering,
    playbackRate,
    setPlaybackRate,
  };
};