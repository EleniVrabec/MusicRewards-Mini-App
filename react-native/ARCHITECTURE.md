# 🏗️ MusicRewards Mini-App - Architecture Documentation

## 📋 Table of Contents

1. [Core Architecture Patterns](#core-architecture-patterns)
2. [State Management](#state-management)
3. [Audio System](#audio-system)
4. [UI Components](#ui-components)
5. [Navigation](#navigation)
6. [Performance & Optimization](#performance--optimization)
7. [Accessibility](#accessibility)
8. [Error Handling](#error-handling)
9. [Bonus Features](#bonus-features)

---

## Core Architecture Patterns

### Service Layer Abstraction

**Problem:** Direct library coupling makes code hard to test and maintain.

**Solution:** Abstract audio operations into `audioService.ts`.

```
Hooks Layer (useMusicPlayer) 
  → Service Layer (audioService) 
    → Library (react-native-track-player)
```

**Benefits:**
- ✅ Decoupled business logic from implementation
- ✅ Easy to mock for testing
- ✅ Simple to swap audio libraries
- ✅ Centralized error handling

**Key Functions:**
- `setupTrackPlayer()` - Initialize player
- `resetPlayer()`, `addTrack()`, `playTrack()`, `pauseTrack()`
- `seekToPosition()`, `setPlaybackRate()`, `getPlaybackRate()`
- `cleanupTrackPlayer()` - Cleanup on unmount

### Component Composition

**Pattern:** Build complex components from simple ones.

**Example:**
- `GlassCard` - Base glass morphism component
- `GlassButton` - Composes `GlassCard` + button functionality
- `PointsCounter` - Uses `GlassCard` for styling

**Why:** Separation of concerns, reusability, maintainability.

---

## State Management

### Zustand Stores with Persistence

**Stores:**

1. **`musicStore.ts`** - Challenge data & playback state
   - Persists: `challenges[]` (progress, completed status)
   - Volatile: `currentTrack`, `isPlaying`, `currentPosition`

2. **`userStore.ts`** - User progress & achievements
   - Persists: `totalPoints`, `completedChallenges[]`

3. **`themeStore.ts`** - Theme preference
   - Persists: `themeMode` ('light' | 'dark')

4. **`toastStore.ts`** - Toast notifications
   - Volatile: `toasts[]` (in-memory only)

**Persistence Strategy:**
- Uses Zustand `persist` middleware with AsyncStorage
- Only persists data that should survive app restarts
- Playback state resets on app restart (expected behavior)

### Data Flow

```
User Action 
  → Hook (useMusicPlayer, usePointsCounter) 
    → Store Update (musicStore, userStore)
      → Persistence (AsyncStorage)
        → UI Re-render
```

---

## Audio System

### TrackPlayer Initialization

**Fix:** Removed unreliable `isServiceRunning()` check.

**Solution:** Always call `setupPlayer()` - it's idempotent.

```typescript
// Before: Unreliable check
const isSetup = await TrackPlayer.isServiceRunning();
if (isSetup) return; // ❌ Could prevent initialization

// After: Always initialize
await TrackPlayer.setupPlayer({ ... }); // ✅ Idempotent
```

### Background Audio Support

**Configuration:**
- `app.json`: `UIBackgroundModes: ["audio"]`
- `Info.plist`: Background audio capability
- TrackPlayer setup: `autoUpdateMetadata: true`, `autoHandleInterruptions: true`

**Result:** Audio continues playing when phone is locked.

### Audio Interruption Handling

**Implementation:** Native-level handling via TrackPlayer.

- Phone calls → Auto-pause
- Other apps → Auto-pause  
- State updates → `usePlaybackState()` hook reflects changes
- No explicit event handlers needed

### Playback Position Restoration

**Feature:** Resume challenges from saved progress.

**Implementation:**
```typescript
// In useMusicPlayer.play()
if (track.progress > 0 && track.progress < 100) {
  const savedPosition = (track.progress / 100) * track.duration;
  await seekToPosition(savedPosition);
}
await playTrack();
```

**Benefits:** Users never lose progress when resuming challenges.

---

## UI Components

### Glass Design System

**Components:**
- `GlassCard` - Base glass morphism with blur & gradient
- `GlassButton` - Button built on GlassCard
- `PointsCounter` - Points display with progress bar
- `LoadingSpinner` - Reusable loading indicator
- `Toast` - Animated notifications
- `ErrorBoundary` - Error fallback UI
- `Confetti` - Celebration animations

### Theme System

**Architecture:**
- `THEME_DARK` / `THEME_LIGHT` objects in `theme.ts`
- `themeStore` - Persists preference
- `useTheme()` hook - Returns current theme
- `createStyles(THEME)` pattern - Dynamic styles

**Accessibility:**
- High contrast ratios (pure black on white in light mode)
- Near-solid white cards in light mode for readability
- Theme-aware blur tint (`dark` / `light`)

### Points Counter System

**Hook:** `usePointsCounter.ts`
- Calculates points based on playback progress
- Prevents decreasing (even if user seeks backward)
- Auto start/stop with playback

**Component:** `PointsCounter.tsx`
- Visual progress bar
- Points display (earned / target)
- Status indicator (Counting / Paused)
- Animations for points increase

### Loading & Buffering States

**States:**
- `loading` - Initial track loading (full-screen overlay)
- `isBuffering` - Playback buffering (progress bar overlay + badge)

**UI Feedback:**
- Loading overlay with spinner
- Buffering indicator on progress bar
- Disabled controls during loading/buffering

---

## Navigation

### Expo Router File-Based Routing

**Structure:**
```
app/
  (tabs)/          # Tab navigation
    index.tsx      # Home
    profile.tsx    # Profile
  (modals)/        # Modal screens
    player.tsx     # Player modal
  challenge/       # Stack screens
    [id].tsx       # Route handler
    ChallengeDetailScreen.tsx  # Presentation
  settings.tsx     # Stack screen
```

### Challenge Detail Screen Pattern

**Architecture:**
- **Route Handler** (`[id].tsx`) - Data fetching, validation
- **Presentation Component** (`ChallengeDetailScreen.tsx`) - UI rendering

**Benefits:**
- ✅ Clean URLs: `/challenge/challenge-1`
- ✅ Separation of concerns
- ✅ Single source of truth (reads from store)
- ✅ Native back button (Stack navigation)

**Navigation Flow:**
```
Home → Challenge Detail (Stack) → Player (Modal)
```

---

## Performance & Optimization

### React Optimization Techniques

**1. Component Memoization**
```typescript
export const ChallengeCard = React.memo(Component, customComparison);
```
- Prevents unnecessary re-renders
- Custom comparison for optimal updates

**2. Hook Memoization**
```typescript
const handlePress = useCallback(() => {...}, [deps]);
const memoizedValue = useMemo(() => compute(), [deps]);
```
- Stable function references
- Prevents expensive recalculations

**3. FlatList Optimizations**
```typescript
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```
- Virtualization for long lists
- Reduced memory usage

### Memory Management

**Cleanup Patterns:**
- Animation cleanup in `useEffect` return functions
- TrackPlayer cleanup in root layout
- Event listeners properly removed

**Example:**
```typescript
useEffect(() => {
  const animation = Animated.timing(...);
  animation.start();
  return () => animation.stop(); // ✅ Cleanup
}, []);
```

---

## Accessibility

### Implementation

**All Interactive Elements Include:**
- `accessibilityRole` - Button, progressbar, adjustable
- `accessibilityLabel` - Descriptive text
- `accessibilityHint` - Action instructions
- `accessibilityState` - Disabled, busy states
- `accessibilityValue` - Progress information (min, max, now)

**Components with Accessibility:**
- ✅ `GlassButton` - Full labels and hints
- ✅ `ChallengeCard` - Card touch + play button
- ✅ `ChallengeDetailScreen` - Action button
- ✅ `Player Modal` - All controls (play, seek, speed)
- ✅ `PointsCounter` - Progress bar with values
- ✅ `Settings Screen` - Theme toggle + reset button

**Example:**
```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Play challenge: All Night"
  accessibilityHint="Double tap to start playing this challenge"
  accessibilityState={{ disabled: challenge.completed }}
/>
```

---

## Error Handling

### Error Boundary

**Component:** `ErrorBoundary.tsx`

**Features:**
- Catches React errors in component tree
- Displays fallback UI with error message
- "Try Again" button for recovery
- Error details in `__DEV__` mode

**Integration:**
```typescript
// Root layout
<ErrorBoundary>
  <Stack>...</Stack>
</ErrorBoundary>
```

### Toast Notifications

**System:** Global toast state with Zustand

**Types:** Success, Error, Warning, Info

**Features:**
- Non-blocking notifications
- Auto-dismiss (configurable duration)
- Slide-in animations
- Multiple simultaneous toasts
- Glass design styling

**Usage:**
```typescript
const { showSuccess, showError } = useToast();
showSuccess('Challenge completed!');
```

---

## Bonus Features

### Playback Speed Control

**Implementation:**
- Service: `setPlaybackRate()` in `audioService.ts`
- Hook: `playbackRate` state in `useMusicPlayer`
- UI: 4 buttons (0.5x, 1x, 1.25x, 2x)

**Features:**
- Immediate speed changes
- Visual feedback (active button highlighted)
- Current speed display

### Theme Toggle

**Implementation:**
- `themeStore` with persistence
- `useTheme()` hook for current theme
- All components use `createStyles(THEME)` pattern
- Status bar adapts to theme

**Features:**
- Light/dark mode support
- High contrast for accessibility
- Persists across app restarts

### Haptic Feedback

**Service:** `hapticFeedback.ts`

**Types:**
- `buttonPress()` - Light feedback
- `pointsIncrease()` - Medium feedback
- `challengeComplete()` - Success feedback
- `playPause()` - Medium feedback
- `selection()` - Selection feedback

**Integration:**
- Button presses, points milestones, challenge completion
- Speed selector changes

### Confetti Animation

**Component:** `Confetti.tsx` (react-native-confetti-cannon wrapper)

**Triggers:**
- 25%, 50%, 75% points milestones
- Challenge completion (100%)

**Features:**
- Center explosion effect
- 150 confetti pieces
- Theme-aware colors
- Conditional rendering (performance)

### Settings Screen

**Location:** `app/settings.tsx`

**Sections:**
1. **Appearance** - Theme toggle button
2. **Testing** - Reset all progress button

**Features:**
- Confirmation Alert before reset
- Toast notifications (success/info/error)
- Checks if data exists before reset
- Resets both `musicStore` and `userStore`

---

## Key Architectural Decisions Summary

| Decision | Pattern | Benefit |
|----------|---------|---------|
| Audio Abstraction | Service Layer | Decoupling, testability |
| Component Design | Composition | Reusability, maintainability |
| State Management | Zustand + Persist | Simple, performant |
| Navigation | File-based (Expo Router) | Type-safe, intuitive |
| Theme System | Store + Hook | Centralized, persistent |
| Error Handling | Error Boundary + Toast | Graceful degradation |
| Performance | Memoization + Selectors | Reduced re-renders |
| Accessibility | Full labels + hints | Screen reader support |
| Memory Management | Cleanup functions | No leaks |

---

## File Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── (modals)/          # Modal screens
│   ├── challenge/         # Stack screens
│   └── settings.tsx       # Settings
├── components/
│   ├── ui/                # Base UI components
│   └── challenge/         # Challenge-specific
├── hooks/                 # Business logic hooks
├── stores/                # Zustand stores
├── services/              # Service abstractions
├── utils/                 # Utilities
├── constants/             # Theme & config
└── types/                 # TypeScript definitions
```

---

## Quick Reference

**Key Files:**
- `audioService.ts` - Audio abstraction layer
- `useMusicPlayer.ts` - Audio playback hook
- `musicStore.ts` - Challenge state
- `themeStore.ts` - Theme preference
- `ErrorBoundary.tsx` - Error handling
- `GlassCard.tsx` / `GlassButton.tsx` - UI components

**Best Practices:**
- ✅ Service layer for external dependencies
- ✅ Component composition over inheritance
- ✅ Zustand selectors for performance
- ✅ `createStyles(THEME)` for dynamic theming
- ✅ Cleanup functions in all `useEffect`s
- ✅ Full accessibility labels on interactive elements
- ✅ Error boundaries for graceful failures
- ✅ Memoization for expensive operations

---

**Last Updated:** Architecture complete with all features implemented ✅
