/**
 * Tomato Animes - WebView Screen
 * Embedded web browser for external links
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlassView, GlassButton, GlassProgress } from '@components/glass';
import { useColors } from '@theme/themeProvider';
import { Ionicons } from '@expo/vector-icons';

interface WebViewParams {
  url: string;
  title?: string;
  injectScript?: string;
}

export default function WebViewScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<WebViewParams>();
  const { url, title, injectScript } = params;

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [pageTitle, setPageTitle] = useState(title || 'Carregando...');

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    if (navState.title && navState.title !== pageTitle) {
      setPageTitle(navTitle);
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    // Inject custom script if provided
    if (injectScript && webViewRef.current) {
      webViewRef.current.injectJavaScript(injectScript);
    }
  };

  const handleError = (error: any) => {
    setLoading(false);
    console.error('WebView error:', error);
  };

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    } else {
      router.back();
    }
  };

  const goForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const shareUrl = () => {
    // Implement share
  };

  const openInBrowser = () => {
    // Open in external browser
  };

  // Handle hardware back button
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <GlassView elevation="elevated" style={styles.navBar} cornerRadius="none">
        <View style={styles.navContent}>
          <GlassButton variant="ghost" size="sm" onPress={goBack} disabled={!canGoBack}>
            <Ionicons name="chevron-back" size={24} color={canGoBack ? colors.onSurface : colors.onSurfaceVariant} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onPress={goForward} disabled={!canGoForward}>
            <Ionicons name="chevron-forward" size={24} color={canGoForward ? colors.onSurface : colors.onSurfaceVariant} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onPress={reload}>
            <Ionicons name="refresh-outline" size={24} color={colors.onSurface} />
          </GlassButton>

          <View style={styles.titleContainer} >
            <Text style={styles.pageTitle} numberOfLines={1}>{pageTitle}</Text>
          </View>

          <GlassButton variant="ghost" size="sm" onPress={shareUrl}>
            <Ionicons name="share-outline" size={24} color={colors.onSurface} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onPress={openInBrowser}>
            <Ionicons name="open-outline" size={24} color={colors.onSurface} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </GlassButton>
        </View>

        {loading && (
          <GlassProgress variant="linear" progress={0} indeterminate color={colors.primary} style={styles.navProgress} />
        )}
      </GlassView>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          allowsPictureInPictureMediaPlayback={true}
          scrollEnabled={true}
          bounces={true}
          decelerationRate="normal"
          contentInset={{ top: 0, bottom: 0 }}
          // iOS specific
          ...(Platform.OS === 'ios' && {
            allowsBackForwardNavigationGestures: true,
            allowsLinkPreview: true,
          })
          // Android specific
          ...(Platform.OS === 'android' && {
            thirdPartyCookiesEnabled: true,
            safeBrowsingEnabled: true,
            renderPriority: 'high' as const,
          })
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navBar: {
    height: Platform.OS === 'ios' ? 100 : 56,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 10,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    gap: 4,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  navProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
});

// Add missing imports
import { Text, Platform } from 'react-native';