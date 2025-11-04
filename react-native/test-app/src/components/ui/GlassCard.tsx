// Glass Card Component - Belong's signature UI design system
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../stores/themeStore';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  gradientColors?: readonly string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurIntensity,
  borderRadius,
  gradientColors,
  style,
}) => {
  const THEME = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  
  const defaultBlurIntensity = blurIntensity ?? THEME.glass.blurIntensity;
  const defaultBorderRadius = borderRadius ?? THEME.borderRadius.md;
  const defaultGradientColors = gradientColors ?? THEME.glass.gradientColors.card;
  const blurTint = themeMode === 'dark' ? 'dark' : 'light';

  return (
    <View style={StyleSheet.flatten([{ borderRadius: defaultBorderRadius, overflow: 'hidden' }, style])}>
      <BlurView 
        intensity={defaultBlurIntensity} 
        style={StyleSheet.absoluteFillObject}
        tint={blurTint}
      />
      
      <LinearGradient
        colors={defaultGradientColors as [string, string]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View 
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: defaultBorderRadius,
          borderWidth: 1,
          borderColor: THEME.colors.border,
        }}
      />
      
      <View style={[styles.contentContainer, { padding: THEME.spacing.md }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    // Padding set dynamically in component
  },
});