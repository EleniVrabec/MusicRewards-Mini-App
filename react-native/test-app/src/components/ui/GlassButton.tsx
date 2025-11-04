// Glass Button Component - Built on GlassCard
import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View,
} from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { hapticService } from '../../utils/hapticFeedback';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  button: {
    height: 52, // Fixed height for all buttons
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    //paddingHorizontal: THEME.spacing.sm,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerWithText: {
   // marginRight: THEME.spacing.xs,
  },
  iconOnlyContainer: {
    marginRight: 0,
  },
  buttonText: {
    color: THEME.colors.text.primary,
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
});

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  icon,
}) => {
  const THEME = useTheme();
  const styles = createStyles(THEME);
  const gradientColors = variant === 'primary'
    ? THEME.glass.gradientColors.primary
    : THEME.glass.gradientColors.secondary;

  const handlePress = () => {
    if (!disabled && !loading) {
      hapticService.buttonPress();
      onPress();
    }
  };

  return (
    <GlassCard
      gradientColors={gradientColors}
      style={StyleSheet.flatten([styles.button, style])}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={styles.buttonContent}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={THEME.colors.text.primary} size="small" />
        ) : (
          <View style={styles.buttonInner}>
            {icon && (
              <View style={[
                styles.iconContainer, 
                title ? styles.iconContainerWithText : styles.iconOnlyContainer
              ]}>
                {icon}
              </View>
            )}
            {title ? (
              <Text 
                style={[styles.buttonText, textStyle]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {title}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    </GlassCard>
  );
};

