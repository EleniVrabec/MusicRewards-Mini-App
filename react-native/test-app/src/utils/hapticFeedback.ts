// Haptic feedback utility - Centralized haptic feedback service
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback types for different user actions
 */
export enum HapticType {
  // Light feedback for standard button presses
  Light = 'light',
  // Medium feedback for significant actions
  Medium = 'medium',
  // Heavy feedback for important actions
  Heavy = 'heavy',
  // Success notification for achievements
  Success = 'success',
  // Warning notification
  Warning = 'warning',
  // Error notification
  Error = 'error',
  // Selection feedback (for pickers, toggles)
  Selection = 'selection',
}

/**
 * Trigger haptic feedback based on type
 * @param type - The type of haptic feedback to trigger
 */
export const triggerHaptic = async (type: HapticType = HapticType.Light): Promise<void> => {
  try {
    // Trigger the appropriate haptic feedback
    // Note: expo-haptics functions are async and should be awaited
    switch (type) {
      case HapticType.Light:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case HapticType.Medium:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case HapticType.Heavy:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case HapticType.Success:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case HapticType.Warning:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case HapticType.Error:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case HapticType.Selection:
        await Haptics.selectionAsync();
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics not available (e.g., simulator, unsupported device)
    // No logging needed
  }
};

/**
 * Convenience functions for common haptic patterns
 * Note: These are fire-and-forget (don't await) for UI responsiveness
 */
export const hapticService = {
  // Button press feedback
  buttonPress: () => {
    triggerHaptic(HapticType.Light).catch(() => {}); // Fire and forget
  },
  
  // Points increase feedback
  pointsIncrease: () => {
    triggerHaptic(HapticType.Medium).catch(() => {}); // Fire and forget
  },
  
  // Challenge completion feedback
  challengeComplete: () => {
    triggerHaptic(HapticType.Success).catch(() => {}); // Fire and forget
  },
  
  // Play/pause action feedback
  playPause: () => {
    triggerHaptic(HapticType.Medium).catch(() => {}); // Fire and forget
  },
  
  // Selection feedback (speed buttons, etc.)
  selection: () => {
    triggerHaptic(HapticType.Selection).catch(() => {}); // Fire and forget
  },
  
  // Error feedback
  error: () => {
    triggerHaptic(HapticType.Error).catch(() => {}); // Fire and forget
  },
  
  // Warning feedback
  warning: () => {
    triggerHaptic(HapticType.Warning).catch(() => {}); // Fire and forget
  },
};

