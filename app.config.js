/**
 * Tomato Animes - Expo App Config
 * Production-ready configuration for iOS App Store deployment
 */

// import 'dotenv/config'; // TEMP: comentado para build:configure

export default ({ config }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isPreview = process.env.EAS_BUILD_PROFILE === 'preview';

  return {
    ...config,
    expo: {
      name: 'Tomato Animes',
      slug: 'tomato-animes',
      version: '1.6.1',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'automatic',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#000000',
      },
      updates: {
        fallbackToCacheTimeout: 0,
        url: 'https://u.expo.dev/your-project-id',
      },
      runtimeVersion: {
        policy: 'appVersion',
      },
      assetBundlePatterns: [
        '**/*',
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.migue.tomatoanimes',
        buildNumber: '105',
        deploymentTarget: '17.0',
        infoPlist: {
          NSPhotoLibraryUsageDescription: 'Tomato Animes precisa acessar suas fotos para salvar imagens de animes.',
          NSCameraUsageDescription: 'Tomato Animes precisa acessar sua câmera para escanear QR codes.',
          NSMicrophoneUsageDescription: 'Tomato Animes precisa acessar seu microfone para busca por voz.',
          NSAppTransportSecurity: {
            NSAllowsArbitraryLoads: true,
          },
          UIBackgroundModes: [
            'audio',
            'picture-in-picture',
            'background-processing',
            'remote-notification',
          ],
          LSApplicationQueriesSchemes: [
            'itms-apps',
            'itms',
            'tiktok',
            'snssdk1128',
          ],
          ITSAppUsesNonExemptEncryption: false,
          NSCalendarsUsageDescription: 'Tomato Animes pode adicionar lembretes de lançamentos ao seu calendário.',
          NSUserTrackingUsageDescription: 'Usamos identificadores para personalizar anúncios e medir performance.',
          SKAdNetworkItems: [
            { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
            { SKAdNetworkIdentifier: 'gta9lk7p23.skadnetwork' },
            { SKAdNetworkIdentifier: 'v72qych5uu.skadnetwork' },
          ],
        },
        associatedDomains: [
          'applinks:tomatoanimes.com',
          'applinks:www.tomatoanimes.com',
        ],
        config: {
          usesNonExemptEncryption: false,
        },
        entitlements: {
          'com.apple.developer.associated-domains': [
            'applinks:tomatoanimes.com',
          ],
        },
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#000000',
        },
        package: 'com.tomatos.clientapp',
        versionCode: 105,
        versionName: '1.6.1',
        minSdkVersion: 24,
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        permissions: [
          'android.permission.INTERNET',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.WAKE_LOCK',
          'android.permission.FOREGROUND_SERVICE',
          'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
          'android.permission.READ_EXTERNAL_STORAGE',
          'android.permission.WRITE_EXTERNAL_STORAGE',
          'android.permission.READ_MEDIA_IMAGES',
          'android.permission.READ_MEDIA_VIDEO',
          'android.permission.READ_MEDIA_AUDIO',
          'android.permission.POST_NOTIFICATIONS',
          'android.permission.VIBRATE',
          'android.permission.RECEIVE_BOOT_COMPLETED',
          'android.permission.MODIFY_AUDIO_SETTINGS',
        ],
        softwareKeyboardLayoutMode: 'pan',
        enableEdgeToEdge: true,
        intentFilters: [
          {
            action: 'VIEW',
            autoVerify: true,
            data: [
              {
                scheme: 'https',
                host: 'tomatoanimes.com',
                pathPrefix: '/watch/',
              },
              {
                scheme: 'https',
                host: 'tomatoanimes.com',
                pathPrefix: '/user/',
              },
            ],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ],
      },
      web: {
        favicon: './assets/favicon.png',
        bundler: 'metro',
        output: 'static',
      },
      plugins: [
        'expo-router',
        'expo-font',
        'expo-secure-store',
        'expo-notifications',
        'expo-media-library',
        'expo-document-picker',
        'expo-image-picker',
        'expo-av',
        'expo-dev-client',
        'expo-task-manager',
        'expo-file-system',
        'expo-localization',
        'expo-splash-screen',
        [
          'expo-build-properties',
          {
            ios: {
              deploymentTarget: '17.0',
              useFrameworks: 'static',
            },
            android: {
              compileSdkVersion: 34,
              targetSdkVersion: 34,
              minSdkVersion: 24,
              ndkVersion: '25.2.9519653',
              extraMavenRepos: [
                'https://repo.maven.apache.org/maven2/',
              ],
            },
          },
        ],
        [
          './src/components/glass/native/expo-plugin.js',
          {
            moduleName: 'LiquidGlass',
            swiftVersion: '5.9',
          },
        ],
        [
          '@react-native-firebase/app',
          {
            ios: {
              googleServicesFile: './GoogleService-Info.plist',
            },
            android: {
              googleServicesFile: './google-services.json',
            },
          },
        ],
        [
          'expo-av',
          {
            audioMode: 'Playback',
            enableBackgroundPlayback: true,
          },
        ],
      ],
      experiments: {
        newArchitectureEnabled: true,
        typedRoutes: true,
      },
      extra: {
        liquidGlass: {
          useNativeBlur: true,
          useSkiaFallback: true,
          defaultElevation: 'surface',
          animationDuration: 250,
          respectReduceTransparency: true,
          respectReduceMotion: true,
        },
        api: {
          baseUrl: process.env.API_BASE_URL || 'https://api.tomatoanimes.com/v1',
          timeout: 15000,
        },
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        appLovin: {
          sdkKey: process.env.APPLOVIN_SDK_KEY,
        },
        features: {
          pictureInPicture: true,
          downloads: true,
          offlineMode: true,
          airPlay: true,
          sharePlay: false,
          liveActivities: true,
        },
        build: {
          profile: process.env.EAS_BUILD_PROFILE || 'development',
          isProduction,
          isPreview,
        },
        eas: {
          projectId: '421f065f-f5c0-432d-ac94-29b226cabc90',
        },
      },
    },
  };
};