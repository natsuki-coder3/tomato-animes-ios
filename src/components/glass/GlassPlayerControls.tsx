/**
 * GlassPlayerControls - Custom controls for anime player with glass morphism
 */

import React, { forwardRef, useImperativeHandle, useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TextStyle,
  Pressable,
  Image,
  ImageStyle,
  Slider,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { GlassButton, GlassIconButton, GlassSlider } from './GlassButton';
import { useGlassStyle, useTheme } from '../../theme/hooks';
import { themeTokens } from '../../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  playbackRate: number;
  quality: string;
  qualities: string[];
  subtitles: SubtitleTrack[];
  selectedSubtitle: number;
  audioTracks: AudioTrack[];
  selectedAudioTrack: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url?: string;
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
}

export interface PlayerControlsProps {
  state: PlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSeekComplete: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onQualityChange: (quality: string) => void;
  onSubtitleChange: (index: number) => void;
  onAudioTrackChange: (index: number) => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  onSkipForward?: (seconds: number) => void;
  onSkipBackward?: (seconds: number) => void;
  onPictureInPicture?: () => void;
  onAirPlay?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  showControls?: boolean;
  autoHideDelay?: number;
  style?: ViewStyle;
  testID?: string;
}

interface PlayerControlsRef {
  showControls: () => void;
  hideControls: () => void;
  toggleControls: () => void;
}

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const GlassPlayerControls = forwardRef<PlayerControlsRef, PlayerControlsProps>(
  (
    {
      state,
      onPlayPause,
      onSeek,
      onSeekComplete,
      onVolumeChange,
      onMuteToggle,
      onFullscreenToggle,
      onPlaybackRateChange,
      onQualityChange,
      onSubtitleChange,
      onAudioTrackChange,
      onNextEpisode,
      onPreviousEpisode,
      onSkipForward,
      onSkipBackward,
      onPictureInPicture,
      onAirPlay,
      onDownload,
      onShare,
      showControls = true,
      autoHideDelay = 3000,
      style,
      testID,
    },
    ref
  ) => {
    const { colors, isReducedTransparency } = useTheme();
    const { spring, springConfig, reduceMotion } = useGlassAnimation();

    const [controlsVisible, setControlsVisible] = useState(showControls);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);

    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const animatedControlsOpacity = useSharedValue(controlsVisible ? 1 : 0);
    const animatedControlsTranslateY = useSharedValue(controlsVisible ? 0 : 50);
    const animatedBottomBarTranslateY = useSharedValue(controlsVisible ? 0 : 100);
    const animatedTopBarTranslateY = useSharedValue(controlsVisible ? 0 : -100);

    const seekGestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startValue = state.currentTime;
      },
      onActive: (event, ctx: any) => {
        const width = event.nativeEvent.layoutMeasurement.width;
        const ratio = Math.max(0, Math.min(1, event.x / width));
        const newTime = ratio * state.duration;
        // Update visual feedback only
      },
      onEnd: (event) => {
        const width = event.nativeEvent.layoutMeasurement.width;
        const ratio = Math.max(0, Math.min(1, event.x / width));
        const newTime = ratio * state.duration;
        runOnJS(onSeekComplete)(newTime);
      },
    });

    const showControlsFn = useCallback(() => {
      setControlsVisible(true);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      hideTimer.current = setTimeout(() => {
        hideControlsFn();
      }, autoHideDelay);
    }, [autoHideDelay]);

    const hideControlsFn = useCallback(() => {
      setControlsVisible(false);
    }, []);

    const toggleControlsFn = useCallback(() => {
      if (controlsVisible) {
        hideControlsFn();
      } else {
        showControlsFn();
      }
    }, [controlsVisible, hideControlsFn, showControlsFn]);

    useEffect(() => {
      if (reduceMotion) {
        animatedControlsOpacity.value = controlsVisible ? 1 : 0;
        animatedControlsTranslateY.value = controlsVisible ? 0 : 50;
        animatedBottomBarTranslateY.value = controlsVisible ? 0 : 100;
        animatedTopBarTranslateY.value = controlsVisible ? 0 : -100;
      } else {
        animatedControlsOpacity.value = withSpring(controlsVisible ? 1 : 0, springConfig);
        animatedControlsTranslateY.value = withSpring(controlsVisible ? 0 : 50, springConfig);
        animatedBottomBarTranslateY.value = withSpring(controlsVisible ? 0 : 100, springConfig);
        animatedTopBarTranslateY.value = withSpring(controlsVisible ? 0 : -100, springConfig);
      }
    }, [controlsVisible]);

    useEffect(() => {
      if (state.isPlaying && showControls) {
        showControlsFn();
      }
      return () => {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
        }
      };
    }, [state.isPlaying, showControls]);

    useImperativeHandle(ref, () => ({
      showControls: showControlsFn,
      hideControls: hideControlsFn,
      toggleControls: toggleControlsFn,
    }));

    const overlayStyle = useAnimatedStyle(() => ({
      opacity: animatedControlsOpacity.value,
      transform: [{ translateY: animatedControlsTranslateY.value }],
    }));

    const bottomBarStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: animatedBottomBarTranslateY.value }],
    }));

    const topBarStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: animatedTopBarTranslateY.value }],
    }));

    const volumeSliderStyle = useAnimatedStyle(() => ({
      opacity: showVolumeSlider ? 1 : 0,
      height: showVolumeSlider ? 120 : 0,
    }));

    const settingsMenuStyle = useAnimatedStyle(() => ({
      opacity: showSettingsMenu ? 1 : 0,
      transform: [{ translateY: showSettingsMenu ? 0 : 20 }],
    }));

    const handleSeek = (value: number) => {
      onSeek(value);
    };

    const handleSeekComplete = (value: number) => {
      onSeekComplete(value);
    };

    const handleVolumeChange = (value: number) => {
      onVolumeChange(value);
    };

    const handlePlaybackRateSelect = (rate: number) => {
      onPlaybackRateChange(rate);
      setShowPlaybackRateMenu(false);
    };

    const handleQualitySelect = (quality: string) => {
      onQualityChange(quality);
      setShowQualityMenu(false);
      setShowSettingsMenu(false);
    };

    const handleSubtitleSelect = (index: number) => {
      onSubtitleChange(index);
      setShowSubtitleMenu(false);
      setShowSettingsMenu(false);
    };

    const handleAudioTrackSelect = (index: number) => {
      onAudioTrackChange(index);
      setShowAudioMenu(false);
      setShowSettingsMenu(false);
    };

    const baseStyle = useGlassStyle({
      elevation: 'overlay',
      cornerRadius: 0,
      borderWidth: 0,
      tintColor: 'rgba(0, 0, 0, 0.7)',
      opacity: isReducedTransparency ? 1 : 0.85,
      shadowLevel: 'level0',
    });

    if (!showControls) return null;

    return (
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        onTouchStart={toggleControlsFn}
        pointerEvents="box-none"
        testID={testID}
      >
        {/* Top Bar */}
        <Animated.View style={[styles.topBar, topBarStyle]} pointerEvents="box-none">
          <GlassView
            elevation="overlay"
            style={[
              styles.topBarGlass,
              { paddingHorizontal: themeTokens.spacing[4], paddingTop: themeTokens.spacing[4] + (Platform.OS === 'ios' ? 44 : 0), paddingBottom: themeTokens.spacing[3] },
            ]}
          >
            <View style={styles.topBarContent}>
              <View style={styles.topBarLeft}>
                <GlassIconButton
                  variant="ghost"
                  size="md"
                  icon={<Image source={require('../../assets/icons/chevron-left.png')} style={styles.controlIcon} />}
                  onPress={() => {}}
                  label="Fechar player"
                />
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Tomato Animes</Text>
                  <Text style={styles.episode}>Episódio 1</Text>
                </View>
              </View>
              <View style={styles.topBarRight}>
                {onAirPlay && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/airplay.png')} style={styles.controlIcon} />}
                    onPress={onAirPlay}
                    label="AirPlay"
                  />
                )}
                {onPictureInPicture && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/pip.png')} style={styles.controlIcon} />}
                    onPress={onPictureInPicture}
                    label="Picture in Picture"
                  />
                )}
                {onDownload && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/download.png')} style={styles.controlIcon} />}
                    onPress={onDownload}
                    label="Download"
                  />
                )}
                {onShare && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/share.png')} style={styles.controlIcon} />}
                    onPress={onShare}
                    label="Compartilhar"
                  />
                )}
              </View>
            </View>
          </GlassView>
        </Animated.View>

        {/* Center Play/Pause */}
        <Animated.View style={[styles.centerControls, overlayStyle]} pointerEvents="box-none">
          <View style={styles.centerContent}>
            <GlassIconButton
              variant="primary"
              size="lg"
              icon={
                <Image
                  source={require(`../../assets/icons/${state.isPlaying ? 'pause' : 'play'}-large.png`)}
                  style={[styles.largeControlIcon, { tintColor: '#FFFFFF' }]}
                />
              }
              onPress={onPlayPause}
              label={state.isPlaying ? 'Pausar' : 'Reproduzir'}
            />
            {onSkipBackward && (
              <GlassIconButton
                variant="primary"
                size="md"
                icon={<Image source={require('../../assets/icons/skip-backward.png')} style={styles.controlIcon} />}
                onPress={() => onSkipBackward?.(10)}
                label="Voltar 10s"
              />
            )}
            {onSkipForward && (
              <GlassIconButton
                variant="primary"
                size="md"
                icon={<Image source={require('../../assets/icons/skip-forward.png')} style={styles.controlIcon} />}
                onPress={() => onSkipForward?.(30)}
                label="Avançar 30s"
              />
            )}
          </View>
        </Animated.View>

        {/* Bottom Bar */}
        <Animated.View style={[styles.bottomBar, bottomBarStyle]} pointerEvents="box-none">
          <GlassView
            elevation="overlay"
            style={[
              styles.bottomBarGlass,
              { paddingHorizontal: themeTokens.spacing[3], paddingVertical: themeTokens.spacing[3], paddingBottom: themeTokens.spacing[4] + (Platform.OS === 'ios' ? 20 : 0) },
            ]}
          >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(state.currentTime)}</Text>
              <View style={styles.progressWrapper} onLayout={(e) => {}}>
                <Pressable
                  style={styles.progressTrack}
                  onPressIn={(e) => {
                    const ratio = e.nativeEvent.locationX / e.nativeEvent.layoutMeasurement.width;
                    onSeek(ratio * state.duration);
                  }}
                  onPressOut={(e) => {
                    const ratio = e.nativeEvent.locationX / e.nativeEvent.layoutMeasurement.width;
                    onSeekComplete(ratio * state.duration);
                  }}
                  onLongPress={(e) => {
                    const ratio = e.nativeEvent.locationX / e.nativeEvent.layoutMeasurement.width;
                    onSeek(ratio * state.duration);
                  }}
                >
                  <View
                    style={[
                      styles.progressBuffered,
                      { width: `${Math.min(state.buffered / state.duration, 1) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(state.currentTime / state.duration, 1) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressThumb,
                      { left: `${Math.min(state.currentTime / state.duration, 1) * 100}%` },
                    ]}
                  />
                </Pressable>
              </View>
              <Text style={styles.timeText}>{formatTime(state.duration)}</Text>
            </View>

            {/* Main Controls */}
            <View style={styles.mainControls}>
              <View style={styles.leftControls}>
                {onPreviousEpisode && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/previous-episode.png')} style={styles.controlIcon} />}
                    onPress={onPreviousEpisode}
                    label="Episódio anterior"
                  />
                )}
                <GlassIconButton
                  variant="primary"
                  size="lg"
                  icon={
                    <Image
                      source={require(`../../assets/icons/${state.isPlaying ? 'pause' : 'play'}.png`)}
                      style={[styles.controlIcon, { tintColor: '#FFFFFF' }]}
                    />
                  }
                  onPress={onPlayPause}
                  label={state.isPlaying ? 'Pausar' : 'Reproduzir'}
                />
                {onNextEpisode && (
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/next-episode.png')} style={styles.controlIcon} />}
                    onPress={onNextEpisode}
                    label="Próximo episódio"
                  />
                )}
              </View>

              <View style={styles.centerControls}>
                <GlassIconButton
                  variant="ghost"
                  size="md"
                  icon={<Image source={require('../../assets/icons/skip-backward.png')} style={styles.controlIcon} />}
                  onPress={() => onSkipBackward?.(10)}
                  label="Voltar 10s"
                />
                <GlassIconButton
                  variant="ghost"
                  size="md"
                  icon={<Image source={require('../../assets/icons/skip-forward.png')} style={styles.controlIcon} />}
                  onPress={() => onSkipForward?.(30)}
                  label="Avançar 30s"
                />
              </View>

              <View style={styles.rightControls}>
                {/* Playback Rate */}
                <View style={styles.menuWrapper}>
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={
                      <View style={styles.rateButton}>
                        <Text style={styles.rateText}>{state.playbackRate}x</Text>
                      </View>
                    }
                    onPress={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
                    label="Velocidade de reprodução"
                  />
                  {showPlaybackRateMenu && (
                    <Animated.View style={[styles.settingsMenu, settingsMenuStyle]} pointerEvents="box-none">
                      <GlassView elevation="overlay" style={styles.settingsMenuGlass}>
                        {playbackRates.map((rate) => (
                          <Pressable
                            key={rate}
                            onPress={() => handlePlaybackRateSelect(rate)}
                            style={styles.settingsItem}
                          >
                            <Text style={[
                              styles.settingsItemText,
                              { fontWeight: state.playbackRate === rate ? '600' : '400' },
                            ]}>
                              {rate}x
                            </Text>
                          </Pressable>
                        ))}
                      </GlassView>
                    </Animated.View>
                  )}
                </View>

                {/* Settings Menu */}
                <View style={styles.menuWrapper}>
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={<Image source={require('../../assets/icons/settings.png')} style={styles.controlIcon} />}
                    onPress={() => setShowSettingsMenu(!showSettingsMenu)}
                    label="Configurações"
                  />
                  {showSettingsMenu && (
                    <Animated.View style={[styles.settingsMenu, settingsMenuStyle]} pointerEvents="box-none">
                      <GlassView elevation="overlay" style={styles.settingsMenuGlass}>
                        {state.qualities.length > 1 && (
                          <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionTitle}>Qualidade</Text>
                            {state.qualities.map((quality) => (
                              <Pressable
                                key={quality}
                                onPress={() => handleQualitySelect(quality)}
                                style={styles.settingsItem}
                              >
                                <Text style={[
                                  styles.settingsItemText,
                                  { fontWeight: state.quality === quality ? '600' : '400' },
                                ]}>
                                  {quality}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                        {state.subtitles.length > 0 && (
                          <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionTitle}>Legendas</Text>
                            <Pressable
                              onPress={() => handleSubtitleSelect(-1)}
                              style={styles.settingsItem}
                            >
                              <Text style={[
                                styles.settingsItemText,
                                { fontWeight: state.selectedSubtitle === -1 ? '600' : '400' },
                              ]}>
                                Desligado
                              </Text>
                            </Pressable>
                            {state.subtitles.map((subtitle, index) => (
                              <Pressable
                                key={subtitle.id}
                                onPress={() => handleSubtitleSelect(index)}
                                style={styles.settingsItem}
                              >
                                <Text style={[
                                  styles.settingsItemText,
                                  { fontWeight: state.selectedSubtitle === index ? '600' : '400' },
                                ]}>
                                  {subtitle.label} ({subtitle.language})
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                        {state.audioTracks.length > 1 && (
                          <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionTitle}>Áudio</Text>
                            {state.audioTracks.map((track, index) => (
                              <Pressable
                                key={track.id}
                                onPress={() => handleAudioTrackSelect(index)}
                                style={styles.settingsItem}
                              >
                                <Text style={[
                                  styles.settingsItemText,
                                  { fontWeight: state.selectedAudioTrack === index ? '600' : '400' },
                                ]}>
                                  {track.label} ({track.language})
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </GlassView>
                    </Animated.View>
                  )}
                </View>

                {/* Volume */}
                <View style={styles.menuWrapper}>
                  <GlassIconButton
                    variant="ghost"
                    size="md"
                    icon={
                      <Image
                        source={require(`../../assets/icons/${state.muted ? 'volume-off' : state.volume > 0.5 ? 'volume-up' : 'volume-down'}.png`)}
                        style={[styles.controlIcon, { tintColor: colors.onSurface }]}
                      />
                    }
                    onPress={onMuteToggle}
                    label={state.muted ? 'Ativar som' : 'Mutar'}
                  />
                  <Animated.View style={[
                    styles.volumeSlider,
                    volumeSliderStyle,
                  ]} pointerEvents="box-none">
                    <GlassView elevation="surface" style={styles.volumeSliderGlass}>
                      <GlassSlider
                        value={state.volume}
                        onValueChange={handleVolumeChange}
                        min={0}
                        max={1}
                        step={0.05}
                        color={colors.primary}
                        trackColor={colors.border}
                        thumbColor={colors.onSurface}
                        style={styles.volumeSliderInner}
                      />
                    </GlassView>
                  </Animated.View>
                </View>

                {/* Fullscreen */}
                <GlassIconButton
                  variant="ghost"
                  size="md"
                  icon={
                    <Image
                      source={require(`../../assets/icons/${state.fullscreen ? 'fullscreen-exit' : 'fullscreen'}.png`)}
                      style={styles.controlIcon}
                    />
                  }
                  onPress={onFullscreenToggle}
                  label={state.fullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
                />
              </View>
            </View>
          </GlassView>
        </Animated.View>
      </Animated.View>
    );
  }
);

GlassPlayerControls.displayName = 'GlassPlayerControls';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: themeTokens.zIndex.modal - 10,
    backgroundColor: 'transparent',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBarGlass: {
    borderBottomLeftRadius: themeTokens.cornerRadii.lg,
    borderBottomRightRadius: themeTokens.cornerRadii.lg,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[3],
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[1],
  },
  titleContainer: {
    marginLeft: themeTokens.spacing[2],
  },
  title: {
    fontSize: themeTokens.typography.fontSize.lg,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  episode: {
    fontSize: themeTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  centerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[4],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarGlass: {
    borderTopLeftRadius: themeTokens.cornerRadii.lg,
    borderTopRightRadius: themeTokens.cornerRadii.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[3],
    marginBottom: themeTokens.spacing[3],
  },
  timeText: {
    fontSize: themeTokens.typography.fontSize.sm,
    fontWeight: themeTokens.typography.fontWeight.medium,
    color: '#FFFFFF',
    minWidth: 50,
  },
  progressWrapper: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'relative',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBuffered: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    transform: [{ translateX: -8 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[1],
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[1],
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeTokens.spacing[1],
  },
  controlIcon: {
    width: 24,
    height: 24,
  },
  largeControlIcon: {
    width: 48,
    height: 48,
  },
  menuWrapper: {
    position: 'relative',
  },
  rateButton: {
    paddingHorizontal: themeTokens.spacing[2],
    paddingVertical: themeTokens.spacing[1],
    borderRadius: themeTokens.cornerRadii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  rateText: {
    fontSize: themeTokens.typography.fontSize.xs,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  settingsMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: themeTokens.spacing[2],
    minWidth: 180,
    maxWidth: 240,
    borderRadius: themeTokens.cornerRadii.lg,
    overflow: 'hidden',
  },
  settingsMenuGlass: {
    paddingVertical: themeTokens.spacing[2],
  },
  settingsSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingsSectionTitle: {
    fontSize: themeTokens.typography.fontSize.xs,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    color: colors.onSurfaceVariant,
    paddingHorizontal: themeTokens.spacing[4],
    paddingVertical: themeTokens.spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    paddingHorizontal: themeTokens.spacing[4],
    paddingVertical: themeTokens.spacing[3],
  },
  settingsItemText: {
    fontSize: themeTokens.typography.fontSize.md,
    color: colors.onSurface,
  },
  volumeSlider: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: themeTokens.spacing[2],
    width: 120,
    borderRadius: themeTokens.cornerRadii.lg,
    overflow: 'hidden',
  },
  volumeSliderGlass: {
    padding: themeTokens.spacing[3],
  },
  volumeSliderInner: {
    transform: [{ rotate: '-90deg' }],
  },
});

export { GlassPlayerControls };