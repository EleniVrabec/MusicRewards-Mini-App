// Tab layout for main navigation
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const THEME = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: THEME.colors.background,
          borderTopColor: THEME.colors.border,
        },
        headerStyle: {
          backgroundColor: THEME.colors.background,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove border
        },
        headerTintColor: THEME.colors.text.primary,
        headerShadowVisible: false, // Remove bottom border/shadow
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '', // Empty header title
          tabBarLabel: 'Challenges', // Tab bar label only
          headerShown: true,
          tabBarIcon: ({ color }) => <MaterialIcons name="library-music" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '', // Empty header title
          tabBarLabel: 'Profile', // Tab bar label only
          headerShown: true,
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}