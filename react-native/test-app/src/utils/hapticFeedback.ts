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
export const triggerHaptic = (type: HapticType = HapticType.Light): void => {
  try {
    switch (type) {
      case HapticType.Light:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case HapticType.Medium:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case HapticType.Heavy:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case HapticType.Success:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case HapticType.Warning:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case HapticType.Error:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case HapticType.Selection:
        Haptics.selectionAsync();
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics not available (e.g., simulator, unsupported device)
    // In production, you might want to log this for debugging
    if (__DEV__) {
      console.warn('Haptic feedback not available:', error);
    }
  }
};

/**
 * Convenience functions for common haptic patterns
 */
export const hapticService = {
  // Button press feedback
  buttonPress: () => triggerHaptic(HapticType.Light),
  
  // Points increase feedback
  pointsIncrease: () => triggerHaptic(HapticType.Medium),
  
  // Challenge completion feedback
  challengeComplete: () => triggerHaptic(HapticType.Success),
  
  // Play/pause action feedback
  playPause: () => triggerHaptic(HapticType.Medium),
  
  // Selection feedback (speed buttons, etc.)
  selection: () => triggerHaptic(HapticType.Selection),
  
  // Error feedback
  error: () => triggerHaptic(HapticType.Error),
  
  // Warning feedback
  warning: () => triggerHaptic(HapticType.Warning),
};

