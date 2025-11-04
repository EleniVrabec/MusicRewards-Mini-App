// Zustand store for music playback and challenges
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MusicChallenge } from '../types';
import { SAMPLE_CHALLENGES } from '../constants/theme';

interface MusicStore {
  // State
  challenges: MusicChallenge[];
  currentTrack: MusicChallenge | null;
  isPlaying: boolean;
  currentPosition: number;
  
  // Actions
  loadChallenges: () => void;
  resetChallenges: () => void; // Reset challenges for testing
  setCurrentTrack: (track: MusicChallenge) => void;
  updateProgress: (challengeId: string, progress: number) => void;
  markChallengeComplete: (challengeId: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPosition: (position: number) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial state
      challenges: SAMPLE_CHALLENGES,
      currentTrack: null,
      isPlaying: false,
      currentPosition: 0,

      // Actions
      loadChallenges: () => {
        set({ challenges: SAMPLE_CHALLENGES });
      },
      //challenge reset for testing
      resetChallenges: () => {
        // Reset all challenges to initial state (for testing)
        // Also clear playback state to prevent "Resume" button showing after reset
        set({
          challenges: SAMPLE_CHALLENGES.map((challenge) => ({
            ...challenge,
            completed: false,
            progress: 0,
            completedAt: undefined,
          })),
          currentTrack: null,    // Clear current track
          isPlaying: false,       // Clear playing state
          currentPosition: 0,     // Reset position
        });
      },

      setCurrentTrack: (track: MusicChallenge) => {
        set({ currentTrack: track });
      },

      updateProgress: (challengeId: string, progress: number) => {
        // Validate input: clamp between 0 and 100, handle edge cases
        if (typeof progress !== 'number' || isNaN(progress)) {
          console.warn('Invalid progress value:', progress);
          return;
        }
        const clampedProgress = Math.max(0, Math.min(progress, 100));
        set((state) => {
          const updatedChallenges = state.challenges.map((challenge) =>
            challenge.id === challengeId
              ? { ...challenge, progress: clampedProgress }
              : challenge
          );
          const updatedChallenge = updatedChallenges.find(c => c.id === challengeId);
          return {
            challenges: updatedChallenges,
            // Also update currentTrack if it's the same challenge
            currentTrack: state.currentTrack?.id === challengeId && updatedChallenge
              ? updatedChallenge
              : state.currentTrack,
          };
        });
      },

      markChallengeComplete: (challengeId: string) => {
        set((state) => {
          const updatedChallenge = state.challenges.find(c => c.id === challengeId);
          const completedChallenge = updatedChallenge 
            ? { 
                ...updatedChallenge, 
                completed: true, 
                progress: 100,
                completedAt: new Date().toISOString()
              }
            : null;

          return {
            challenges: state.challenges.map((challenge) =>
              challenge.id === challengeId
                ? { 
                    ...challenge, 
                    completed: true, 
                    progress: 100,
                    completedAt: new Date().toISOString()
                  }
                : challenge
            ),
            // Also update currentTrack if it's the same challenge
            currentTrack: state.currentTrack?.id === challengeId && completedChallenge
              ? completedChallenge
              : state.currentTrack,
          };
        });
      },

      setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
      },

      setCurrentPosition: (position: number) => {
        // Validate input: ensure non-negative number
        if (typeof position !== 'number' || isNaN(position) || position < 0) {
          console.warn('Invalid position value:', position);
          return;
        }
        set({ currentPosition: position });
      },
    }),
    {
      name: 'music-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist challenges, not playback state
      partialize: (state) => ({
        challenges: state.challenges,
      }),
    }
  )
);

// Selector functions for performance
export const selectCurrentTrack = (state: MusicStore) => state.currentTrack;
export const selectIsPlaying = (state: MusicStore) => state.isPlaying;
export const selectChallenges = (state: MusicStore) => state.challenges;