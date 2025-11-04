// src/hooks/useChallenges.ts
import { useCallback, useState } from 'react';
import { 
  useMusicStore, 
  selectChallenges,
} from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { UseChallengesReturn } from '../types';

export const useChallenges = (): UseChallengesReturn => {
  // read from store
  const challenges = useMusicStore(selectChallenges);
  const markChallengeComplete = useMusicStore((s) => s.markChallengeComplete);

  const completedChallenges = useUserStore((s) => s.completedChallenges);
  const completeUserChallenge = useUserStore((s) => s.completeChallenge);
  const addPoints = useUserStore((s) => s.addPoints);

  // local ui state
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // simulate refresh (in real app → fetch from API)
  // Note: Doesn't reset progress - persistence already handles loading data
  const refreshChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay for UX feedback
      // In a real app, this would fetch new challenges from API while preserving progress
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Failed to refresh challenges');
    } finally {
      setLoading(false);
    }
  }, []);

  // mark 1 challenge as done in BOTH stores
  const completeChallenge = useCallback(
    async (challengeId: string) => {
      try {
        // 1) mark in music store (so progress = 100, completed = true)
        markChallengeComplete(challengeId);

        // 2) find how many points that challenge had (read from store to avoid dependency)
        const currentChallenges = useMusicStore.getState().challenges;
        const challenge = currentChallenges.find((c) => c.id === challengeId);
        if (challenge) {
          // 3) mark in user store
          completeUserChallenge(challengeId);
          addPoints(challenge.points);
        }
      } catch (err) {
        setError('Failed to complete challenge');
      }
    },
    [markChallengeComplete, completeUserChallenge, addPoints]
  );

  return {
    challenges,
    completedChallenges,
    loading,
    error,
    refreshChallenges,
    completeChallenge,
  };
};
