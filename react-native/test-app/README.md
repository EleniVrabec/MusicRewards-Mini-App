# 🎵 MusicRewards Mini-App

A React Native music rewards app demonstrating core architectural patterns with Expo, Zustand, and react-native-track-player.

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **iOS Simulator** (for iOS development) - requires Xcode
- **Android Studio** (for Android development) - optional
- **Expo CLI** (installed globally or via npx)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd react-native/test-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install iOS pods** (if running on iOS):
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Running the App

#### iOS

```bash
# Run on iOS simulator
npx expo run:ios

# Or start Expo dev server and choose iOS
npx expo start
# Then press 'i' to open iOS simulator
```

#### Android

```bash
# Run on Android emulator
npx expo run:android

# Or start Expo dev server and choose Android
npx expo start
# Then press 'a' to open Android emulator
```

#### Web (Development)

```bash
npx expo start --web
```

### Troubleshooting

**Clear Metro bundler cache:**
```bash
npx expo start -c
```

**Reset iOS build:**
```bash
cd ios
rm -rf build Pods Podfile.lock
pod install
cd ..
npx expo run:ios
```

**Reset node modules:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS Simulator not launching:**
- Make sure Xcode is installed and Command Line Tools are configured
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- Try opening Xcode and accepting license agreements

**Audio not playing:**
- Make sure you have a stable internet connection (audio files are hosted online)
- Check that device/simulator volume is not muted
- For iOS: Background audio requires a native build (`npx expo run:ios`), not Expo Go

### Development

**Start development server:**
```bash
npx expo start
```

**Run on specific platform:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app (limited functionality - native build recommended)

### Building for Production

**iOS:**
```bash
npx expo run:ios --configuration Release
```

**Android:**
```bash
npx expo run:android --variant release
```

## 📁 Project Structure

This structure follows Belong's mobile app architecture patterns:

```
src/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx             # Home screen with challenge list
│   │   ├── profile.tsx           # Profile with user progress
│   │   └── _layout.tsx           # Tab navigation setup
│   ├── (modals)/                 # Modal navigation group
│   │   ├── player.tsx            # Full-screen audio player modal
│   │   └── _layout.tsx           # Modal navigation setup
│   ├── challenge/                # Challenge detail screens
│   │   ├── [id].tsx              # Dynamic route handler
│   │   └── ChallengeDetailScreen.tsx  # Presentation component
│   ├── settings.tsx              # Settings screen
│   └── _layout.tsx               # Root layout with error boundary
├── components/
│   ├── ui/                       # Glass design system components
│   │   ├── GlassCard.tsx         # Base glass morphism card
│   │   ├── GlassButton.tsx        # Glass-styled button
│   │   ├── PointsCounter.tsx      # Real-time points display
│   │   ├── Toast.tsx             # Toast notification component
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── ErrorBoundary.tsx     # Error boundary wrapper
│   │   └── Confetti.tsx          # Confetti animation component
│   └── challenge/                # Challenge-specific components
│       ├── ChallengeCard.tsx     # Individual challenge card
│       └── ChallengeList.tsx     # Challenge list with states
├── hooks/                        # Business logic hooks
│   ├── useMusicPlayer.ts         # Audio playback orchestration
│   ├── usePointsCounter.ts       # Points calculation during playback
│   ├── useChallenges.ts          # Challenge management
│   ├── useTheme.ts               # Theme provider hook
│   └── useToast.ts               # Toast notification helper
├── stores/                       # Zustand stores with persistence
│   ├── musicStore.ts             # Music playback & challenges state
│   ├── userStore.ts              # User points & progress state
│   ├── themeStore.ts             # Theme preference (light/dark)
│   └── toastStore.ts             # Toast notification state
├── services/                     # External service abstractions
│   ├── audioService.ts           # react-native-track-player wrapper
│   └── playbackService.ts        # Background playback handlers
├── utils/                        # Utility functions
│   └── hapticFeedback.ts         # Haptic feedback service
├── constants/                    # Theme and configuration
│   └── theme.ts                  # Theme constants (light/dark)
└── types/                        # TypeScript definitions
    └── index.ts                  # Shared type definitions
```

## 🎵 Audio Files

The app uses pre-hosted audio tracks:
- **Track 1:** Camo & Krooked - All Night (3:39, 150 points, Easy)
- **Track 2:** Roni Size - New Forms (7:44, 300 points, Medium)
- **Track 3:** Bonus Challenge (repeat track 1, 150 points, Easy)

Audio URLs are configured in `src/constants/theme.ts`. See [`../assets/audio/README.md`](../assets/audio/README.md) for more details.

## 🎨 Features

- **Glass Morphism UI** - Modern glass design system with blur effects
- **Audio Playback** - Full-featured audio player with react-native-track-player
- **Progress Tracking** - Real-time challenge progress and points calculation
- **Theme Support** - Light and dark mode with persistence
- **Accessibility** - Full accessibility labels and hints for screen readers
- **Haptic Feedback** - Tactile feedback for user interactions
- **Confetti Animation** - Celebration animations for milestones
- **Error Handling** - Error boundaries and toast notifications
- **State Persistence** - AsyncStorage persistence for challenges and progress

## 🛠️ Key Technologies

- **Expo** - React Native framework
- **Expo Router** - File-based navigation
- **Zustand** - State management with persistence
- **react-native-track-player** - Audio playback engine
- **TypeScript** - Type-safe development
- **expo-blur** - Glass morphism effects
- **expo-haptics** - Haptic feedback

## 📖 Additional Documentation

- See [`ARCHITECTURE.md`](../ARCHITECTURE.md) for architectural decisions and patterns
- See [`DEVELOPMENT_PLAN.md`](../DEVELOPMENT_PLAN.md) for implementation details
- See the main [README.md](../README.md) for evaluation criteria

## 🐛 Troubleshooting Common Issues

**Metro bundler errors:**
```bash
npx expo start -c
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

**TypeScript errors:**
```bash
# Restart TypeScript server in your IDE
# Or regenerate types
npx expo start --clear
```

**Audio playback issues:**
- Ensure you're using `npx expo run:ios` (not Expo Go) for background audio
- Check internet connection (audio files are streamed)
- Verify device volume is not muted

## 📝 Notes

- **Background Audio:** Requires native build (`npx expo run:ios`) - not supported in Expo Go
- **Haptic Feedback:** Works on physical devices, not in simulators
- **Persistence:** Data is saved to AsyncStorage automatically
- **Theme:** Preference persists across app restarts

Good luck! 🚀🎵