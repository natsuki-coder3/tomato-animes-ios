# 🍅 Tomato Animes — EAS Build + AltStore IPA Guide

**Target:** Stable IPA for anime watching on iPhone via AltStore  
**Platform:** Windows (no Mac required)  
**Bundle ID:** `com.migue.tomatoanimes`  
**Version:** 1.6.1 (build 105)  
**Last Updated:** 2026-11-26  

---

## ⚠️ BEFORE YOU START — Known Limitations

This app builds and runs, but **core features are stubbed** (intentional placeholders):

| Module | Original Library | Status | Impact |
|--------|-----------------|--------|--------|
| `TomatoSignModule` | `libtomatosign.so` | 🔴 **Mock signatures** | Login, search, episodes API will fail |
| `UnityPlayerModule` | `libunitycoherencenative.so` | 🔴 **Placeholder UI** | No video playback — shows mock player |
| `TobEncryptModule` | `libtobEmbedPagEncrypt.so` | 🟡 **CryptoKit fallback** | Payment/DRM may fail |
| `NativeFiltersModule` | Custom Metal shaders | 🟡 **Identity pass-through** | No custom image filters |
| `FFmpegModule` | FFmpeg | 🟡 **Stub** | Media processing limited |
| `NMSModule` | Unknown | 🟡 **Stub** | Network/media sync limited |

> **Bottom line:** App launches, navigation works, UI is complete. Video playback & API calls need reverse engineering (see Section 8).

---

## 1️⃣ PREREQUISITES CHECKLIST

### Required Accounts
- [ ] **Apple Developer Program** ($99/yr) — *Recommended for 1-year certs*
  - OR **Free Apple ID** — 7-day expiry, must refresh weekly via AltStore
- [ ] **Expo Account** (free) — `eas login` uses this
- [ ] **AltStore + AltServer** installed on Windows + iPhone

### Required Tools (Windows)
```powershell
# Verify installations
node --version          # >= 20.x
npm --version           # >= 10.x
git --version
eas --version           # After: npm install -g eas-cli
```

### iPhone Setup
- [ ] iOS 17.0+ (deployment target)
- [ ] Trust computer in Finder/iTunes (first USB connect)
- [ ] AltStore app installed on iPhone (via AltServer)
- [ ] Same Apple ID in AltStore + Apple Developer Console

---

## 2️⃣ ONE-TIME SETUP (Do Once)

### 2.1 Create App ID in Apple Developer Console
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click **+** → **App IDs** → Continue
3. **Bundle ID:** `com.migue.tomatoanimes` (Explicit, not wildcard)
4. **Capabilities to enable:**
   - ✅ **Background Modes** → Audio, AirPlay, Picture in Picture, Background Fetch, Remote Notifications
   - ✅ **Push Notifications**
   - ✅ **App Groups** → Create group: `group.com.migue.tomatoanimes` (for shared data)
   - ✅ **Associated Domains** → `applinks:tomatoanimes.com`
   - ✅ **Sign In with Apple** (optional, for auth)
5. Register → Continue → Confirm

### 2.2 Create Development Provisioning Profile
1. Profiles → **+** → **iOS App Development** → Continue
2. Select App ID: `com.migue.tomatoanimes`
3. Select your **Development Certificate** (create one if needed: Keychain → Request Certificate)
4. Select **Device(s)** — add your iPhone UDID (AltStore shows it, or Xcode → Window → Devices)
5. Name: `TomatoAnimes_Development_AltStore`
6. Download → Double-click to install in Keychain

### 2.3 Get Your Apple Team ID
```bash
# In terminal (after cert installed)
security find-identity -v -p codesigning
# Look for: "Apple Development: Your Name (TEAMID123456)"
# TEAMID123456 = Your Team ID
```

### 2.4 Configure `eas.json` with Team ID
Edit `eas.json` — replace `YOUR_TEAM_ID`:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleTeamId": "YOUR_TEAM_ID_HERE"
      }
    }
  }
}
```

### 2.5 Create `.env` File (Local Secrets)
Copy `.env.example` → `.env` and fill:
```bash
# Required for EAS builds
EXPO_PROJECT_ID=your-expo-project-id     # Get from: eas project:info
EAS_BUILD_PROFILE=development

# API & Firebase (get from Tomato backend/Firebase Console)
API_BASE_URL=https://api.tomatoanimes.com/v1
FIREBASE_API_KEY=your-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:ios:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Ads, Analytics
APPLOVIN_SDK_KEY=your-applovin-key
```

---

## 3️⃣ BUILD COMMANDS (Copy-Paste Ready)

### 3.1 Initial Login & Config
```powershell
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo
eas login
# Enter your Expo credentials

# 3. Link project to EAS (first time only)
eas build:configure
# Select: iOS → Development/Preview/Production profiles
# This creates/updates eas.json

# 4. Verify project link
eas project:info
# Should show your project slug & ID
```

### 3.2 Development Build (for AltStore / Dev Client)
```powershell
# Build for real device (not simulator) — internal distribution
eas build --platform ios --profile development --local=false

# Expected: ~10-15 min queue + 15-20 min build
# Output: .ipa URL in EAS dashboard
```

### 3.3 Preview Build (Internal Testing)
```powershell
# Release build, internal distribution (no App Store)
eas build --platform ios --profile preview --local=false

# Use this for: QA, screenshots, TestFlight alternative
```

### 3.4 Production Build (App Store Ready)
```powershell
# App Store distribution profile
eas build --platform ios --profile production --local=false

# Requires: Production provisioning profile + Distribution cert
```

### 3.5 Local Build (If You Have Mac Access)
```powershell
# Only works on macOS — faster, no queue
eas build --platform ios --profile development --local
```

---

## 4️⃣ ALTSTORE INSTALLATION (Windows)

### 4.1 Get the .ipa File
**Option A: EAS Dashboard (Easiest)**
1. Go to https://expo.dev/accounts/[you]/projects/tomato-animes/builds
2. Click latest successful build → **Artifacts** → Download `.ipa`

**Option B: CLI**
```powershell
# List recent builds
eas build:list --platform ios --limit 5

# Download specific build
eas build:download --platform ios --output tomato-animes.ipa
```

### 4.2 Install via AltStore (iPhone)
1. **Connect iPhone to Windows via USB**
2. **Open AltStore on iPhone** → My Apps → **+** (top left)
3. **Select the `.ipa` file** (transfer via AirDrop, Files app, or iTunes File Sharing)
4. **Wait for install** → App appears on Home Screen
5. **Trust Developer Profile:**
   - Settings → General → VPN & Device Management
   - Tap your Apple ID → **Trust "Apple Development: Your Name"**

### 4.3 Alternative: Sideloadly (Windows)
If AltStore gives issues:
1. Download Sideloadly: https://sideloadly.io/
2. Connect iPhone → Trust computer
3. Drag `.ipa` into Sideloadly → Enter Apple ID + App-Specific Password
4. Click **Start** → Wait for "Complete"

---

## 5️⃣ RENEWAL PROCESS (Critical for Free Apple ID)

### Free Apple ID (7-Day Expiry)
| Method | Frequency | How |
|--------|-----------|-----|
| **AltStore Wi-Fi Sync** | Daily (auto) | Keep AltServer running on PC, iPhone on same Wi-Fi |
| **USB Refresh** | Every 7 days | Connect iPhone → AltStore → My Apps → Refresh |
| **Manual Re-sign** | Every 7 days | `eas build --profile development` → reinstall |

### Paid Apple Developer ($99/yr)
- Certificates valid **1 year**
- Provisioning profiles valid **1 year**
- AltStore refresh still needed but only annually

### Auto-Refresh Setup (Recommended)
1. **AltServer on Windows:** Keep running in background (System Tray)
2. **iPhone:** Settings → AltStore → Enable "Background App Refresh"
3. **Same Wi-Fi:** iPhone + PC on same network overnight
4. **Check:** AltStore → My Apps → shows "Refreshed X hours ago"

---

## 6️⃣ TROUBLESHOOTING MATRIX

| Error | Cause | Fix |
|-------|-------|-----|
| `Provisioning profile doesn't match bundle identifier` | Bundle ID mismatch | Check `app.config.js` → `bundleIdentifier: 'com.migue.tomatoanimes'` matches Apple Console exactly |
| `No signing certificate found` | Cert not in Keychain / wrong team | Run `eas credentials` → Select iOS → Let EAS manage certs |
| `App crashes on launch` | Native module linking / Metro cache | `npx expo start -c` → Clear Metro cache; Check `TomatoSignModule` logs in Xcode |
| `Video player black screen` | `UnityPlayerModule` is stub | **Known limitation** — Shows placeholder. See Section 8 for RE path |
| `Login fails / API 401` | `TomatoSignModule` returns mock | **Known limitation** — Mock signature rejected by server. See Section 8 |
| `Payment/DRM error` | `TobEncryptModule` uses CryptoKit | **Known limitation** — Server expects original algorithm. See Section 8 |
| `EAS build stuck in queue` | High demand / free tier | Wait 10-30 min; Or use `--local` on Mac; Or upgrade EAS plan |
| `Pod install failed` | CocoaPods version / native deps | `eas build --profile development --clear-cache` |
| `Metro bundler error` | Version mismatch | `npm install` → `npx expo install --fix` |
| `AltStore "Could not install"` | Profile expired / device not in profile | Rebuild with `eas build --profile development` → reinstall |
| `White screen after splash` | JS bundle not loaded / crash | Check device logs: `npx react-native log-ios` or Xcode Console |

---

## 7️⃣ KNOWN LIMITATIONS (From Stubs — Detailed)

### TomatoSignModule (`libtomatosign.so`)
```swift
// Current: Returns mock signature
// Real: Implements proprietary signing algorithm
// Impact: ALL API requests fail authentication
// Files: src/native/ios/TomatoSignModule.swift
// RE Target: libtomatosign.so (ARM64, stripped)
```

### UnityPlayerModule (`libunitycoherencenative.so`)
```swift
// Current: Simulates playback state, no actual rendering
// Real: Embeds Unity iOS Framework for video player
// Impact: Player screen opens but shows placeholder
// Files: src/native/ios/UnityPlayerModule.swift
// RE Target: libunitycoherencenative.so + Unity framework
```

### TobEncryptModule (`libtobEmbedPagEncrypt.so`)
```swift
// Current: Uses Apple CryptoKit (AES-GCM)
// Real: Custom encryption for payment/DRM
// Impact: Payment flows, premium content may fail
// Files: src/native/ios/TobEncryptModule.swift
// RE Target: libtobEmbedPagEncrypt.so
```

### NativeFiltersModule (Custom Metal Shaders)
```swift
// Current: Identity pass-through
// Real: Metal compute shaders for anime filters
// Impact: No custom image filters in UI
// Files: src/native/ios/NativeFiltersModule.swift
```

---

## 8️⃣ NEXT STEPS FOR FULL FUNCTIONALITY (Reverse Engineering)

### Priority 1: Critical — API Access (40h)
```bash
# 1. Extract libtomatosign.so from original Android APK
# 2. Analyze in Ghidra/IDA Pro (ARM64)
# 3. Identify: JNI entry points, signing algorithm, key derivation
# 4. Reimplement in Swift (TomatoSignModule.swift)
# 5. Test: Login → Search → Episode list → Play
```

### Priority 2: Critical — Video Playback (40h)
```bash
# 1. Extract libunitycoherencenative.so + Unity Data folder
# 2. Identify Unity version (likely 2021/2022 LTS)
# 3. Build Unity iOS Framework (File → Build Settings → iOS)
# 4. Embed in Xcode project (Frameworks/)
# 5. Bridge: UnityPlayerModule.swift → UnitySendMessage
# 6. Test: Video URL → Playback → Subtitles → PiP
```

### Priority 3: High — Encryption/DRM (24h)
```bash
# 1. Extract libtobEmbedPagEncrypt.so
# 2. Trace: encrypt/decrypt calls, key management
# 3. Identify: AES mode, IV generation, key wrapping
# 4. Reimplement in TobEncryptModule.swift
# 5. Test: Payment flow, premium episode unlock
```

### Priority 4: Medium — Filters (16h)
```bash
# 1. Analyze NativeFiltersModule.swift stubs
# 2. Port Metal shaders from Android (RenderScript/OpenGL)
# 3. Implement: Gaussian blur, color grading, anime-style filters
# 4. Test: Glass UI effects, thumbnail filters
```

---

## 9️⃣ QUICK TEST CHECKLIST (After Install)

| Test | Expected | Pass? |
|------|----------|-------|
| App launches (Splash → Welcome) | No crash, shows onboarding | ☐ |
| Tab navigation (Home, Search, Downloads, Profile) | Smooth transitions | ☐ |
| Theme toggle (Light/Dark/Glass) | Immediate UI update | ☐ |
| Settings screen opens | All sections render | ☐ |
| Profile screen opens | Shows mock user data | ☐ |
| Search screen opens | Keyboard works, history shows | ☐ |
| Player screen opens | Shows **placeholder** (not black) | ☐ |
| Background → Foreground | No crash, state preserved | ☐ |
| Pull-to-refresh (Home) | Spinner shows, no crash | ☐ |
| Orientation lock (Portrait) | Stays portrait on rotate | ☐ |

> **Note:** "Pass" = UI works. API/Video will show mock data — that's expected.

---

## 📦 QUICK REFERENCE CARD

```powershell
# ── DAILY DRIVER COMMANDS ──

# Build development IPA (for AltStore)
eas build --platform ios --profile development

# Check build status
eas build:list --platform ios --limit 3

# Download latest IPA
eas build:download --platform ios --output tomato.ipa

# View logs for failed build
eas build:view <BUILD_ID>

# Manage credentials (if cert issues)
eas credentials

# Update project config after changes
eas build:configure
```

---

## 🔗 USEFUL LINKS

- **EAS Dashboard:** https://expo.dev/accounts/[you]/projects/tomato-animes/builds
- **Apple Developer:** https://developer.apple.com/account/
- **AltStore:** https://altstore.io/
- **Sideloadly:** https://sideloadly.io/
- **Expo Docs (iOS Build):** https://docs.expo.dev/build/ios/
- **UDID Finder:** https://get.udid.io/ (on iPhone Safari)

---

## 📝 CHANGELOG

| Date | Change |
|------|--------|
| 2026-11-26 | Initial guide created from project config |

---

**Happy watching! 🍅**  
*Remember: The stubs are intentional — the app builds. Full functionality needs RE work outlined in Section 8.*