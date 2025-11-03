// useMusicPlayer hook - Integrates react-native-track-player with Zustand
import { useCallback, useEffect, useState } from 'react';
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
    // Some versions of usePlaybackState may return an object, so extract value if needed
    let stateValue: any = playbackState;
    if (typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState) {
      stateValue = playbackState.state;
    }
    const isCurrentlyPlaying = stateValue === State.Playing;
    const isCurrentlyBuffering = stateValue === State.Buffering;
    
    if (isCurrentlyPlaying !== isPlaying) {
      setIsPlaying(isCurrentlyPlaying);
    }
    
    setIsBuffering(isCurrentlyBuffering);
  }, [playbackState, isPlaying, setIsPlaying]);

  // Update position and calculate progress/points
  useEffect(() => {
    if (currentTrack && progress.position > 0) {
      setCurrentPosition(progress.position);
      
      // Calculate progress percentage
      const progressPercentage = (progress.position / progress.duration) * 100;
      updateProgress(currentTrack.id, progressPercentage);
      
      // Check if track is completed (90% threshold to account for small timing issues)
      if (progressPercentage >= 90 && !currentTrack.completed) {
        markChallengeComplete(currentTrack.id);
        completeChallenge(currentTrack.id);
        addPoints(currentTrack.points);
      }
    }
  }, [progress.position, progress.duration, currentTrack, setCurrentPosition, updateProgress, markChallengeComplete, completeChallenge, addPoints]);

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
    //  await TrackPlayer.reset();
    // await TrackPlayer.add({
    await resetPlayer();
    await addTrack({
        id: track.id,
        url: track.audioUrl,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      });
      
      // Start playback
     // await TrackPlayer.play();
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

  // Load initial playback rate on mount
  useEffect(() => {
    const loadInitialRate = async () => {
      try {
        const rate = await getPlaybackRate();
        setPlaybackRateState(rate);
      } catch (err) {
        console.error('Load playback rate error:', err);
      }
    };
    loadInitialRate();
  }, []);

  // Extract value for isPlaying return as well
  let stateValue: any = playbackState;
  if (typeof playbackState === 'object' && playbackState !== null && 'state' in playbackState) {
    stateValue = playbackState.state;
  }
  return {
    isPlaying: stateValue === State.Playing,
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