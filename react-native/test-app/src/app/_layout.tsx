// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer, cleanupTrackPlayer } from '../services/audioService';
import { ToastContainer } from '../components/ui/Toast';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../stores/themeStore';

export default function RootLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const THEME = useTheme();

  useEffect(() => {
    // Register the playback service first
    TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));
    
    // Then initialize TrackPlayer when app starts
    setupTrackPlayer().catch((error) => {
      console.error('Failed to setup TrackPlayer:', error);
    });

    // Cleanup function - called when component unmounts
    return () => {
      cleanupTrackPlayer().catch((error) => {
        console.error('Failed to cleanup TrackPlayer:', error);
      });
    };
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: THEME.colors.background,
          },
          headerTintColor: THEME.colors.text.primary,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(modals)" 
          options={{ 
            presentation: 'modal',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="challenge/[id]" 
          options={{ 
            title: 'Challenge Details',
            headerShown: true,
            headerBackTitle: 'Back',
            headerBackTitleVisible: true,
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            headerShown: true,
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
      <ToastContainer />
    </ErrorBoundary>
  );
}