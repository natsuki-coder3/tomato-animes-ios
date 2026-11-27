/**
 * Expo Config Plugin for Liquid Glass Native Module
 * Configures iOS and Android native modules for GlassEffectView
 */

const { withDangerousMod, withAppBuildGradle, withPodfileProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'LiquidGlass';

/**
 * iOS Configuration
 */
function withLiquidGlassIOS(config, { moduleName = 'LiquidGlass', swiftVersion = '5.9' } = {}) {
  // Add Swift files to Xcode project
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const podfilePath = path.join(projectRoot, 'ios', 'Podfile');

      // Read and modify Podfile
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

        // Add use_frameworks! if not present
        if (!podfileContent.includes('use_frameworks!')) {
          podfileContent = podfileContent.replace(
            /^(target '.*' do)$/m,
            "$1\n  use_frameworks! :linkage => :static"
          );
        }

        // Add LiquidGlass pod
        if (!podfileContent.includes('LiquidGlass')) {
          podfileContent = podfileContent.replace(
            /^(target '.*' do)$/m,
            `$1\n  pod 'LiquidGlass', :path => '../node_modules/liquid-glass-design-system/src/components/glass/native'`
          );
        }

        fs.writeFileSync(podfilePath, podfileContent);
      }

      // Create Swift bridging header if needed
      const bridgingHeaderPath = path.join(projectRoot, 'ios', `${moduleName}-Bridging-Header.h`);
      if (!fs.existsSync(bridgingHeaderPath)) {
        const bridgingHeaderContent = `#ifndef ${moduleName}_Bridging_Header_h
#define ${moduleName}_Bridging_Header_h

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <UIKit/UIKit.h>

#endif /* ${moduleName}_Bridging_Header_h */
`;
        fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent);
      }

      return config;
    },
  ]);

  // Add Swift version to build settings
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const xcodeprojPath = path.join(projectRoot, 'ios', '*.xcodeproj', 'project.pbxproj');

      // This would need xcodeproj parsing - simplified for now
      return config;
    },
  ]);

  return config;
}

/**
 * Android Configuration
 */
function withLiquidGlassAndroid(config, { moduleName = 'LiquidGlass' } = {}) {
  // Add native module to build.gradle
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Add ndk version if not present
    if (!buildGradle.includes('ndkVersion')) {
      config.modResults.contents = buildGradle.replace(
        /android\s*{/,
        `android {\n    ndkVersion "25.2.9519653"`
      );
    }

    // Add C++ support for Skia
    if (!buildGradle.includes('cppFlags')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*{/,
        `android {\n    defaultConfig {\n        externalNativeBuild {\n            cmake {\n                cppFlags "-std=c++17 -frtti -fexceptions"\n            }\n        }\n    }`
      );
    }

    return config;
  });

  // Add native module package to MainApplication
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const mainApplicationPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        '**',
        'MainApplication.kt'
      );

      // This would need glob to find the actual path
      // For now, return config as-is
      return config;
    },
  ]);

  return config;
}

/**
 * Main Plugin Entry Point
 */
module.exports = function withLiquidGlass(config, props = {}) {
  const { moduleName = 'LiquidGlass', swiftVersion = '5.9' } = props;

  // iOS
  config = withLiquidGlassIOS(config, { moduleName, swiftVersion });

  // Android
  config = withLiquidGlassAndroid(config, { moduleName });

  // Add required plugins
  if (!config.plugins) config.plugins = [];

  // Ensure expo-build-properties is included
  const hasBuildProperties = config.plugins.some(
    (p) => Array.isArray(p) ? p[0] === 'expo-build-properties' : p === 'expo-build-properties'
  );

  if (!hasBuildProperties) {
    config.plugins.push([
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
        },
      },
    ]);
  }

  // Add react-native-reanimated plugin
  const hasReanimated = config.plugins.some(
    (p) => Array.isArray(p) ? p[0] === 'react-native-reanimated' : p === 'react-native-reanimated'
  );

  if (!hasReanimated) {
    config.plugins.push('react-native-reanimated');
  }

  // Add react-native-gesture-handler plugin
  const hasGestureHandler = config.plugins.some(
    (p) => Array.isArray(p) ? p[0] === 'react-native-gesture-handler' : p === 'react-native-gesture-handler'
  );

  if (!hasGestureHandler) {
    config.plugins.push('react-native-gesture-handler');
  }

  return config;
};

module.exports.withLiquidGlassIOS = withLiquidGlassIOS;
module.exports.withLiquidGlassAndroid = withLiquidGlassAndroid;