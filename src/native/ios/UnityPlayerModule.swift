//
//  UnityPlayerModule.swift
//  TomatoAnimes
//
//  STUB IMPLEMENTATION - Critical library replacement
//  Original: libunitycoherencenative.so (Unity video player integration)
//  REIMPLEMENTATION REQUIRED: 40 hours, Critical risk
//

import Foundation
import React

// MARK: - Protocol for future RE implementation
@objc protocol UnityPlayerModuleProtocol {
  func initialize(_ config: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func playVideo(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func pauseVideo(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func stopVideo(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func seekTo(_ position: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func setVolume(_ volume: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func setPlaybackRate(_ rate: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func enterFullscreen(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func exitFullscreen(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func getCurrentPosition(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func getDuration(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func isPlaying(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func setSubtitleTrack(_ trackIndex: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func setAudioTrack(_ trackIndex: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func cleanup(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}

// MARK: - Data Structures
struct UnityPlayerConfig {
  let licenseKey: String?
  let enableHardwareAcceleration: Bool
  let preferredRenderer: String
  let cacheSize: Int
}

struct VideoPlaybackParams {
  let url: String
  let title: String?
  let subtitles: [[String: Any]]?
  let audioTracks: [[String: Any]]?
  let startPosition: Double?
  let autoPlay: Bool
  let drmConfig: [String: Any]?
}

// MARK: - Stub Implementation
@objc(UnityPlayerModule)
class UnityPlayerModule: NSObject, UnityPlayerModuleProtocol {

  // MARK: - Constants
  private let MODULE_NAME = "UnityPlayerModule"
  private let STUB_WARNING = "⚠️ [STUB] UnityPlayerModule - Rendering placeholder. Original libunitycoherencenative.so needs REIMPLEMENTATION (40h, Critical)"

  // MARK: - State
  private var isInitialized = false
  private var isPlaying = false
  private var currentPosition: Double = 0
  private var duration: Double = 0
  private var volume: Double = 1.0
  private var playbackRate: Double = 1.0

  // MARK: - RCTBridgeModule
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func constantsToExport() -> [String: Any] {
    return [
      "isStub": true,
      "warning": STUB_WARNING,
      "originalLibrary": "libunitycoherencenative.so",
      "riskLevel": "critical",
      "estimatedHours": 40,
      "supportedFeatures": [
        "video_playback",
        "subtitle_support",
        "multi_audio",
        "drm",
        "hardware_acceleration",
        "picture_in_picture",
        "airplay",
        "chromecast"
      ],
    ]
  }

  // MARK: - Protocol Methods
  @objc
  func initialize(_ config: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: Initialize Unity player
    isInitialized = true

    resolver([
      "success": true,
      "version": "1.0.0-stub",
      "renderer": "Metal",
      "hardwareAcceleration": true,
      "isMock": true
    ])
  }

  @objc
  func playVideo(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    guard let url = params["url"] as? String else {
      rejecter("INVALID_PARAMS", "Missing required parameter: url", nil)
      return
    }

    isPlaying = true
    currentPosition = params["startPosition"] as? Double ?? 0

    // STUB: Simulate duration
    duration = 1200 // 20 minutes default

    resolver([
      "success": true,
      "duration": duration,
      "isMock": true
    ])
  }

  @objc
  func pauseVideo(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    isPlaying = false
    resolver(["success": true, "isMock": true])
  }

  @objc
  func stopVideo(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    isPlaying = false
    currentPosition = 0
    resolver(["success": true, "isMock": true])
  }

  @objc
  func seekTo(_ position: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    currentPosition = min(max(position, 0), duration)
    resolver(["success": true, "position": currentPosition, "isMock": true])
  }

  @objc
  func setVolume(_ volume: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    self.volume = min(max(volume, 0), 1)
    resolver(["success": true, "volume": self.volume, "isMock": true])
  }

  @objc
  func setPlaybackRate(_ rate: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    playbackRate = max(0.25, min(rate, 4.0))
    resolver(["success": true, "rate": playbackRate, "isMock": true])
  }

  @objc
  func enterFullscreen(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    resolver(["success": true, "isMock": true])
  }

  @objc
  func exitFullscreen(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    resolver(["success": true, "isMock": true])
  }

  @objc
  func getCurrentPosition(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Simulate position update when playing
    if isPlaying {
      currentPosition += playbackRate * 0.1 // Update every ~100ms
      if currentPosition > duration {
        currentPosition = duration
        isPlaying = false
      }
    }

    resolver(["position": currentPosition, "isMock": true])
  }

  @objc
  func getDuration(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    resolver(["duration": duration, "isMock": true])
  }

  @objc
  func isPlaying(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    resolver(["playing": isPlaying, "isMock": true])
  }

  @objc
  func setSubtitleTrack(_ trackIndex: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    resolver(["success": true, "trackIndex": trackIndex, "isMock": true])
  }

  @objc
  func setAudioTrack(_ trackIndex: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    resolver(["success": true, "trackIndex": trackIndex, "isMock": true])
  }

  @objc
  func cleanup(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    isInitialized = false
    isPlaying = false
    currentPosition = 0
    duration = 0

    resolver(["success": true, "isMock": true])
  }
}