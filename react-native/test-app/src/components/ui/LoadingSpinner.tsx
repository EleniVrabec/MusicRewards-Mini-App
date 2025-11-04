// Loading Spinner Component - Reusable loading indicator
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  message: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
  },
});

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  message,
  style,
  fullScreen = false,
}) => {
  const THEME = useTheme();
  const styles = createStyles(THEME);
  const defaultColor = color ?? THEME.colors.accent;
  
  const containerStyle = fullScreen
    ? [styles.fullScreen, style]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={defaultColor} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

