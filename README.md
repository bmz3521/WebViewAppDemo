# MembershipDemoApp

Bare React Native app that opens the Membership web page inside a fullscreen WebView with a native close button — no web navigation header visible.

Built with **React Native 0.85** (bare CLI, no Expo).

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 22.x |
| Xcode | >= 16 (for iOS builds) |
| Android Studio | latest (for Android builds) |
| CocoaPods | >= 1.15 |

## Getting started

```bash
# Install JS dependencies
npm install

# Install iOS pods (requires Xcode & CocoaPods)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Configuring the membership URL

Edit `src/config.ts`:

```ts
const BASE_URL = 'https://your-staging-url.com';
const EMBED_PATH = '/membership/embed';
const EMBED_QUERY = 'app_embed=1';
```

The app loads `BASE_URL + EMBED_PATH + ?EMBED_QUERY` in the WebView.

## Testing with the mock landing page

A static HTML test page lives in `landing-test/`. Serve it locally:

```bash
npx serve landing-test
```

Then update `BASE_URL` in `src/config.ts` to `http://<YOUR_LAN_IP>:3000` and `EMBED_PATH` to `/embed.html` to test WebView behavior before the real staging URL is available.

## Embed contract with the web team

The web frontend should **hide the global navigation bar** when either condition is true:

- The URL path matches the embed path (e.g. `/membership/embed`)
- The query parameter `app_embed=1` is present

This lets the same membership pages render normally in a browser but fullscreen (no chrome) inside the native app.

## QA checklist (Acceptance Criteria)

- [ ] Open in demo app — **no web header / nav bar** visible
- [ ] WebView loads the configured URL via the fixed path
- [ ] Native close button is visible at the top (respects safe area / notch)
- [ ] Tapping close returns to the landing screen
- [ ] Works on iOS (TestFlight build)
- [ ] Works on Android (App Distribution / internal testing build)
- [ ] Portrait & landscape safe area handled

## Project structure

```
MembershipDemoApp/
├── App.tsx                  # Root: switches between Landing & WebView
├── src/
│   ├── config.ts            # BASE_URL, path, embed query
│   └── screens/
│       ├── LandingScreen.tsx       # Launch screen with "Open Membership" button
│       └── MembershipWebScreen.tsx # Fullscreen WebView + native close strip
├── landing-test/
│   ├── index.html           # Links to embed mock
│   └── embed.html           # Mock page without nav (for QA)
├── ios/                     # Native iOS project
└── android/                 # Native Android project
```
