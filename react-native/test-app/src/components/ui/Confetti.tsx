// 🎉 Confetti Component
// This component wraps the `react-native-confetti-cannon` library
// and allows you to trigger a confetti animation programmatically.
// Docs: https://www.npmjs.com/package/react-native-confetti-cannon

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

// Get the screen width and height for positioning the confetti origin
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

// Define the available props for the Confetti component
interface ConfettiProps {
  /** Number used to trigger confetti animation (increment to fire again) */
  trigger?: number;
  /** Number of confetti pieces to render */
  count?: number;
  /** Optional array of color hex values */
  colors?: string[];
  /** Optional callback when the confetti animation completes */
  onComplete?: () => void;
  /** Explosion direction: 'center' (burst) or 'top' (falling) */
  origin?: 'center' | 'top';
  /** Speed of explosion in milliseconds (how fast confetti spreads out) */
  explosionSpeed?: number;
  /** Speed of fall in milliseconds (how long it takes to fall down) */
  fallSpeed?: number;
}

// Default color palette for confetti pieces
const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#FFFF00', // Yellow
  '#e67e22', // Orange
  '#2ecc71', // Green
  '#3498db', // Blue
];

export const Confetti: React.FC<ConfettiProps> = ({
  trigger = 0,                 // Each increment fires the confetti
  count = 50,                  // Default number of pieces
  colors = DEFAULT_COLORS,     // Default color palette
  onComplete,                  // Callback after animation ends
  origin = 'center',           // Start from center by default
  explosionSpeed = 350,        // Speed of explosion outward
  fallSpeed = 3000,            // How long confetti takes to fall
}) => {
  // Ref to the ConfettiCannon instance so we can call `.start()`
  const confettiRef = useRef<ConfettiCannon>(null);
  const prevTrigger = useRef(trigger);
  const hasBeenTriggered = useRef(false);

  // Run the confetti animation when `trigger` value changes
  useEffect(() => {
    if (trigger !== prevTrigger.current && trigger > 0) {
      prevTrigger.current = trigger;
      hasBeenTriggered.current = true;
      confettiRef.current?.start();
    }
  }, [trigger]);

  // Don't render anything until triggered to avoid visible container
  if (!hasBeenTriggered.current && trigger === 0) {
    return null;
  }

  // Determine starting position based on the `origin` prop
  const originPosition = origin === 'center'
    ? { x: CENTER_X, y: CENTER_Y } // Middle of the screen
    : { x: CENTER_X, y: 0 };       // Top of the screen for falling effect

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        // Reference to control animation manually
        ref={confettiRef}
        // Number of confetti pieces
        count={count}
        // Starting position of the explosion
        origin={originPosition}
        // Confetti colors
        colors={colors}
        // Don't start automatically — we trigger it via ref
        autoStart={false}
        // Fade out pieces after the animation
        fadeOut
        // Explosion and fall speeds (control animation smoothness)
        explosionSpeed={explosionSpeed}
        fallSpeed={fallSpeed}
        // Callback when animation ends
        onAnimationEnd={onComplete}
      />
    </View>
  );
};

// Full-screen overlay container to display confetti over everything else
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Covers the whole screen
    zIndex: 9999,                     // Ensure it renders on top of other UI
  },
});
