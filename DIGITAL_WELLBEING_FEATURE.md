# Digital Wellbeing - App Blocking Feature

This document explains the new app blocking functionality implemented in your Expo React Native digital wellbeing app.

## Overview

The app blocking feature allows users to:

1. View a list of installed apps on their device
2. Select specific apps to block
3. Create blocking rules with time schedules
4. Start focus sessions that temporarily block selected apps
5. See blocking overlays when trying to access blocked apps

## Architecture

### Core Services

#### 1. AppDetectionService (`src/lib/app-detection.ts`)

- **Purpose**: Manages detection and cataloging of installed apps
- **Key Features**:
  - Mock data for development (easily replaceable with native modules)
  - App categorization (social, entertainment, games, etc.)
  - Caching for performance
  - Platform-specific implementations

#### 2. AppBlockingService (`src/lib/app-blocking.ts`)

- **Purpose**: Manages blocking rules and focus sessions
- **Key Features**:
  - Create/update/delete blocking rules
  - Time-based rule activation
  - Focus session management
  - Blocked attempt tracking
  - Persistent storage using MMKV

### React Hooks

#### useInstalledApps

```typescript
const { apps, isLoading, refreshApps } = useInstalledApps();
```

- Fetches and caches installed apps
- Provides loading states and refresh functionality

#### useBlockingRules

```typescript
const { rules, createRule, updateRule, deleteRule, isCreating } =
  useBlockingRules();
```

- Manages CRUD operations for blocking rules
- Real-time updates with React Query

#### useFocusSession

```typescript
const { session, startSession, pauseSession, isStarting } = useFocusSession();
```

- Manages focus sessions
- Timer functionality
- Session state persistence

### UI Components

#### AppSelection Component

```typescript
<AppSelection
  selectedApps={selectedApps}
  onSelectionChange={setSelectedApps}
  categories={['social', 'entertainment']}
  maxSelection={10}
  title="Select Apps"
  description="Choose apps to block"
/>
```

- Searchable app list
- Category filtering
- Multi-selection with limits
- Beautiful app icons and info

#### AppBlockingOverlay Component

```typescript
<AppBlockingOverlay
  visible={showOverlay}
  onClose={() => setShowOverlay(false)}
  blockedApp={{
    packageName: 'com.instagram.android',
    appName: 'Instagram',
  }}
  blockReason="focus" // or "rule"
  timeRemaining={1234} // seconds
/>
```

- Full-screen overlay for blocked apps
- Different UIs for focus vs rule blocks
- Progress indicators and stats

## Implementation Details

### Data Structure

#### Installed App

```typescript
type InstalledApp = {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
  version?: string;
  isSystemApp: boolean;
};
```

#### Blocking Rule

```typescript
type BlockingRule = {
  id: string;
  name: string;
  blockedApps: string[]; // package names
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  days: string[]; // ['Mon', 'Tue', ...]
  isActive: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};
```

#### Focus Session

```typescript
type FocusSession = {
  id: string;
  duration: number; // minutes
  blockedApps: string[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
};
```

### Android Permissions

Added to `app.config.ts`:

```typescript
android: {
  permissions: [
    'android.permission.QUERY_ALL_PACKAGES',
    'android.permission.PACKAGE_USAGE_STATS',
  ],
  buildGradleConfig: {
    manifest: {
      queries: [{
        intent: [{
          action: 'android.intent.action.MAIN',
          category: ['android.intent.category.LAUNCHER'],
        }],
      }],
    },
  },
}
```

## Usage Examples

### 1. Creating a Blocking Rule

```typescript
import { useBlockingRules } from '@/lib/hooks';

const { createRule } = useBlockingRules();

const handleCreateRule = () => {
  createRule({
    name: 'Evening Focus',
    blockedApps: ['com.instagram.android', 'com.tiktok.android'],
    startTime: '18:00',
    endTime: '21:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isActive: true,
    color: '#FF6B6B',
  });
};
```

### 2. Starting a Focus Session

```typescript
import { useFocusSession } from '@/lib/hooks';

const { startSession } = useFocusSession();

const handleStartFocus = () => {
  startSession({
    duration: 25, // minutes
    blockedApps: ['com.instagram.android', 'com.youtube.android'],
  });
};
```

### 3. Checking if App is Blocked

```typescript
import { useAppBlocking } from '@/lib/hooks';

const { checkIfBlocked } = useAppBlocking();

const blockStatus = checkIfBlocked('com.instagram.android');
if (blockStatus.blocked) {
  // Show blocking overlay
  console.log('Blocked by:', blockStatus.reason); // 'rule' or 'focus'
}
```

## Current Limitations & Next Steps

### Current Implementation

- **Mock Data**: Currently uses mock installed apps data for development
- **No Real Blocking**: Apps aren't actually blocked yet - only UI is implemented
- **iOS Limitations**: iOS doesn't allow querying installed apps due to privacy restrictions

### Production Implementation Required

#### 1. Native Module for Android

Create a native Android module to actually query installed packages:

```kotlin
// Example native module code
@ReactMethod
fun getInstalledApps(promise: Promise) {
    val packageManager = reactApplicationContext.packageManager
    val packages = packageManager.getInstalledPackages(PackageManager.GET_META_DATA)

    val apps = packages
        .filter { !isSystemApp(it) }
        .map { createAppObject(it) }

    promise.resolve(Arguments.fromList(apps))
}
```

#### 2. App Launch Detection

Implement background service to detect when blocked apps are launched:

```kotlin
// Example service to monitor app launches
class AppMonitorService : Service() {
    private fun detectAppLaunch() {
        // Monitor app launches and show overlay for blocked apps
    }
}
```

#### 3. System Overlay Permission

Request permission to display overlays over other apps:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

## Integration with Existing Screens

### Home Screen Updates

- **Focus Duration Sheet**: Now uses real app selection
- **Real App Data**: Replaces hardcoded app list
- **Session Management**: Integrates with blocking service

### Block Screen Updates

- **Rule Management**: Full CRUD operations
- **Real-time Updates**: Rules update immediately
- **Better UX**: Improved empty states and loading

## Development vs Production

### Development Mode

- Uses mock data for quick iteration
- No actual app blocking
- All UI components functional

### Production Mode (requires native modules)

- Real installed app detection
- Actual app blocking with overlays
- Background monitoring
- System-level permissions

## Testing

To test the blocking overlay functionality, use the demo component:

```typescript
import { AppBlockingDemo } from '@/components/app-blocking-demo';

// Add to any screen for testing
<AppBlockingDemo />
```

## Security & Privacy

### Data Storage

- All data stored locally using MMKV
- No data sent to external servers
- User consent required for app access

### Permissions

- Minimal permission requests
- Clear explanation to users
- Optional features if permissions denied

## Performance Considerations

### Caching

- App list cached for 5 minutes
- Efficient queries with React Query
- Background refresh capabilities

### Memory Management

- Proper cleanup of event listeners
- Efficient app filtering and searching
- Optimized re-renders with React.memo

This implementation provides a solid foundation for a digital wellbeing app with comprehensive app blocking functionality. The modular architecture makes it easy to extend and customize based on your specific requirements.
