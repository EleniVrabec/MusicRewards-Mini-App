// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer } from '../services/audioService';
import { ToastContainer } from '../components/ui/Toast';

export default function RootLayout() {
  useEffect(() => {
    // Register the playback service first
    TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));
    
    // Then initialize TrackPlayer when app starts
    setupTrackPlayer().catch((error) => {
      console.error('Failed to setup TrackPlayer:', error);
    });
  }, []);

  return (
    <>
      <Stack>
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
            headerBackTitle: 'Back', // Shows "Challenges" as back button text
            headerBackTitleVisible: true, // iOS: shows back title, Android: always just shows arrow
          }} 
        />
      </Stack>
      <ToastContainer />
    </>
  );
}