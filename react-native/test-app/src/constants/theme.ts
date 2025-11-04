// Belong design tokens and theme constants

export type ThemeMode = 'light' | 'dark';

export const THEME_DARK = {
  colors: {
    primary: '#7553DB',     // Belong purple
    secondary: '#34CB76',   // Belong green  
    accent: '#FCBE25',      // Belong yellow
    background: '#1a1a1a',  // Dark background
    glass: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#FFFFFF',           // Pure white for maximum contrast
      secondary: 'rgba(255, 255, 255, 0.85)',  // Higher contrast for secondary
      tertiary: 'rgba(255, 255, 255, 0.7)',     // Better contrast for tertiary
    },
    border: 'rgba(255, 255, 255, 0.2)',
  },
  fonts: {
    regular: 'System',
    medium: 'System', 
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  glass: {
    blurIntensity: 20,
    gradientColors: {
      primary: ['rgba(117, 83, 219, 0.3)', 'rgba(117, 83, 219, 0.1)'],
      secondary: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
      card: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
    }
  }
};

export const THEME_LIGHT = {
  colors: {
    primary: '#7553DB',     // Belong purple (same)
    secondary: '#34CB76',   // Belong green (same)
    accent: '#FCBE25',      // Belong yellow (same)
    background: '#F2F2F4',  // Soft off-white background with slight gray tint for better glass visibility
    glass: 'rgba(0, 0, 0, 0.06)',
    text: {
      primary: '#1D1D1F',   // Soft black (not pure black, easier on eyes)
      secondary: 'rgba(29, 29, 31, 0.8)',  // High contrast for secondary text
      tertiary: 'rgba(29, 29, 31, 0.6)',   // Better contrast for tertiary text
    },
    border: 'rgba(0, 0, 0, 0.12)',
  },
  fonts: {
    regular: 'System',
    medium: 'System', 
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  glass: {
    blurIntensity: 40,
    gradientColors: {
      primary: ['rgba(117, 83, 219, 0.15)', 'rgba(117, 83, 219, 0.08)'],
      secondary: ['rgba(229, 229, 229, 0.56)', 'rgba(223, 220, 220, 0.6)'],
      card: ['rgba(229, 229, 229, 0.84)', 'rgba(223, 220, 220, 0.65)'], // Glass-like transparency - you can see through it
    }
  }
};

// Default export (dark theme for backward compatibility)
export const THEME = THEME_DARK;

// Sample challenge data with actual Belong tracks
export const SAMPLE_CHALLENGES = [
  {
    id: 'challenge-1',
    title: 'All Night',
    artist: 'Camo & Krooked',
    duration: 219, // 3:39
    points: 150,
    audioUrl: 'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/Camo-Krooked-All-Night.mp3',
    description: 'Listen to this drum & bass classic to earn points',
    difficulty: 'easy' as const,
    completed: false,
    progress: 0,
  },
  {
    id: 'challenge-2',
    title: 'New Forms',
    artist: 'Roni Size',
    duration: 464, // 7:44
    points: 300,
    audioUrl: 'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/New-Forms-Roni+Size.mp3',
    description: 'Complete this legendary track for bonus points',
    difficulty: 'medium' as const,
    completed: false,
    progress: 0,
  },
  {
    id: 'challenge-3',
    title: 'Bonus Challenge',
    artist: 'Camo & Krooked',
    duration: 219, // 3:39 (same track as challenge 1)
    points: 250,
    audioUrl: 'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/Camo-Krooked-All-Night.mp3',
    description: 'Listen again for extra points - test repeat functionality',
    difficulty: 'hard' as const,
    completed: false,
    progress: 0,
  },
];