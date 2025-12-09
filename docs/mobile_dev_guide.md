# Mobile App Development Guide

This guide covers setting up and running the React Native mobile app for Narratives.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (macOS only) or Android Studio/Emulator
- Expo Go app on physical device (optional)

## Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API Endpoint

The API client is in `shared/api/client.ts`. Update the `API_URL` for your environment:

```typescript
// For local development with Android emulator:
const API_URL = 'http://10.0.2.2:8000/api';

// For local development with iOS simulator:
const API_URL = 'http://localhost:8000/api';

// For physical device (use your computer's IP):
const API_URL = 'http://YOUR_IP:8000/api';
```

### 3. Start the Backend

Make sure the backend is running:

```bash
cd ..
docker-compose up -d
```

### 4. Start the Mobile App

```bash
cd mobile
npx expo start
```

Then press:
- `a` for Android emulator
- `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Auth redirect
│   ├── (auth)/            # Auth group (login, register)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/             # Main app with bottom tabs
│       ├── _layout.tsx    # Tab navigation
│       ├── dashboard.tsx
│       ├── projects.tsx
│       ├── upload.tsx
│       ├── map.tsx
│       ├── settings.tsx
│       ├── project/[id].tsx
│       ├── narrative/[id].tsx
│       └── timeline/[narrativeId].tsx
├── src/
│   ├── components/        # Reusable components
│   │   └── MapView.tsx
│   ├── constants/         # Theme, colors, config
│   │   └── theme.ts
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   └── screens/           # Screen components
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── ProjectsScreen.tsx
│       ├── ProjectDetailScreen.tsx
│       ├── NarrativeDetailScreen.tsx
│       └── UploadScreen.tsx
└── assets/                # Images, fonts
```

## Features

### Authentication
- JWT-based authentication with secure token storage
- Auto-refresh tokens
- Persistent login via SecureStore

### Navigation
- Bottom tab navigation for main sections
- Stack navigation for detail screens
- Auth flow with automatic redirects

### Media
- Photo upload from camera or gallery
- EXIF metadata extraction
- GPS location display
- Batch uploads with progress

### Map View
- Interactive map with photo markers
- Marker clustering for performance
- Filter by narrative
- Quick photo preview

### Timeline
- Swipeable photo carousel
- Auto-play mode
- Full-screen presentation
- Photo metadata overlay

## Development Tips

### Hot Reload
Expo supports fast refresh. Changes to code will automatically reload.

### Debugging
- Shake device or press `m` to open developer menu
- Use `console.log` statements (visible in terminal)
- React Native Debugger for advanced debugging

### Testing on Device
1. Install Expo Go from App Store / Play Store
2. Scan QR code shown in terminal
3. App loads on your device

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Troubleshooting

### "Unable to resolve module"
```bash
rm -rf node_modules
npm install
npx expo start -c  # Clear cache
```

### Metro bundler issues
```bash
npx expo start --clear
```

### Android emulator not connecting
- Ensure emulator is running before `expo start`
- Try `adb reverse tcp:8000 tcp:8000` for API access

### iOS simulator issues
- Run `sudo xcode-select --reset`
- Ensure Xcode CLI tools are installed
