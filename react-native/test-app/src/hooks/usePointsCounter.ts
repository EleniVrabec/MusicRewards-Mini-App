// Points counter hook - Tracks points earned during playback
import { useState, useEffect, useCallback, useRef } from 'react';
import { useProgress } from 'react-native-track-player';
import type { UsePointsCounterReturn, PointsCounterConfig } from '../types';

export const usePointsCounter = (): UsePointsCounterReturn => {
  // Local state
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [config, setConfig] = useState<PointsCounterConfig | null>(null);
  
  // TrackPlayer progress hook
  const progress = useProgress();
  
  // Track previous earned points to prevent decreasing
  const prevEarnedRef = useRef<number>(0);
  
  // Start counting function
  const startCounting = useCallback((newConfig: PointsCounterConfig) => {
    setConfig(newConfig);
    setIsActive(true);
    setCurrentPoints(0);
    setPointsEarned(0);
    prevEarnedRef.current = 0;
  }, []);
  
  // Stop counting function
  const stopCounting = useCallback(() => {
    setIsActive(false);
  }, []);
  
  // Reset progress function
  const resetProgress = useCallback(() => {
    setCurrentPoints(0);
    setPointsEarned(0);
    prevEarnedRef.current = 0;
    setIsActive(false);
    setConfig(null);
  }, []);
  
  // Calculate points based on progress
  useEffect(() => {
    if (!isActive || !config || progress.duration === 0) {
      return;
    }
    
    // Calculate progress percentage
    const progressPercentage = (progress.position / progress.duration) * 100;
    
    // Calculate earned points proportionally
    const earnedPoints = Math.floor((progressPercentage / 100) * config.totalPoints);
    
    // Only update if earned more than before (prevent decreasing)
    if (earnedPoints > prevEarnedRef.current) {
      setPointsEarned(earnedPoints);
      setCurrentPoints(earnedPoints);
      prevEarnedRef.current = earnedPoints;
    }
  }, [progress.position, progress.duration, isActive, config]);
  
  // Calculate current progress percentage
  const progressPercentage = config && progress.duration > 0
    ? (progress.position / progress.duration) * 100
    : 0;
  
  return {
    currentPoints,
    pointsEarned,
    progress: progressPercentage,
    isActive,
    startCounting,
    stopCounting,
    resetProgress,
  };
};

