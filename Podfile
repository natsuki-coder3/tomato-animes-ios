require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '17.0'
install! 'cocoapods', :deterministic_uuids => false

target 'TomatoAnimes' do
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :config_file_dir => './',
    # An absolute path to your application root.
  )

  # Pods for TomatoAnimes
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseAnalytics', :modular_headers => true
  pod 'FirebaseCrashlytics', :modular_headers => true
  pod 'FirebaseMessaging', :modular_headers => true
  pod 'FirebaseRemoteConfig', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true

  # AppLovin MAX
  pod 'AppLovinMediationSDK', '~> 12.0'
  pod 'AppLovinMediationFacebookAdapter', '~> 12.0'
  pod 'AppLovinMediationGoogleAdapter', '~> 12.0'
  pod 'AppLovinMediationUnityAdapter', '~> 12.0'
  pod 'AppLovinMediationByteDanceAdapter', '~> 12.0'

  # Mobile FFmpeg for media processing
  pod 'mobile-ffmpeg-full', '~> 4.5'

  # SDWebImage for image loading (replaces Fresco)
  pod 'SDWebImage', '~> 5.18'
  pod 'SDWebImageWebPCoder', '~> 0.10'
  pod 'SDWebImageAVIFCoder', '~> 0.10'

  # FLAnimatedImage for GIF support
  pod 'FLAnimatedImage', '~> 1.0'

  # MMKV for fast key-value storage (replaces SharedPreferences/DataStore)
  pod 'MMKV', '~> 1.3'

  # AppCenter for analytics and crashes
  pod 'AppCenter', '~> 5.0'
  pod 'AppCenter/Analytics', '~> 5.0'
  pod 'AppCenter/Crashes', '~> 5.0'

  # Google Cast
  pod 'google-cast-sdk', '~> 4.8'

  # TikTok Open SDK
  pod 'TikTokOpenSDK', '~> 5.0'

  # Unity Framework (if available)
  # pod 'UnityFramework', :path => '../unity/UnityFramework'

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => true,
    )

    # Enable Hermes optimizations
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Hermes specific settings
        if target.name == 'hermes-engine'
          config.build_settings['GCC_OPTIMIZATION_LEVEL'] = 's'
        end

        # Enable module stability for Swift
        config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
        config.build_settings['SWIFT_VERSION'] = '5.9'

        # Deployment target
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'

        # Fix for Xcode 15
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'

        # Disable bitcode
        config.build_settings['ENABLE_BITCODE'] = 'NO'

        # Swift concurrency
        config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      end
    end

    # Fix for React Native Reanimated
    installer.pods_project.targets.each do |target|
      if target.name == 'React-Core' || target.name == 'React-RCTAppDelegate'
        target.build_configurations.each do |config|
          config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
          config.build_settings['HEADER_SEARCH_PATHS'] << '"${PODS_ROOT}/Headers/Public/React-Core"'
        end
      end
    end
  end
end

target 'TomatoAnimesTests' do
  inherit! :complete
  # Pods for testing
end