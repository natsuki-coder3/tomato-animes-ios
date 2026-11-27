//
//  FFmpegModule.swift
//  TomatoAnimes
//
//  STUB IMPLEMENTATION - High risk library replacement
//  Original: libffmpegJNI.so (FFmpeg media processing)
//  REIMPLEMENTATION REQUIRED: 16 hours, High risk
//  iOS Equivalent: mobile-ffmpeg / VideoToolbox
//

import Foundation
import React

// MARK: - Protocol for future RE implementation
@objc protocol FFmpegModuleProtocol {
  func execute(_ command: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func executeAsync(_ command: String, callback: @escaping RCTResponseSenderBlock)
  func getMediaInfo(_ path: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func transcode(_ inputPath: String, outputPath: String, options: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func extractAudio(_ inputPath: String, outputPath: String, format: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func extractFrames(_ inputPath: String, outputDir: String, interval: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func concatenate(_ inputs: [String], outputPath: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func trim(_ inputPath: String, outputPath: String, startTime: Double, duration: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func getVersion(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func cancel(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}

// MARK: - Data Structures
struct MediaInfo {
  let duration: Double
  let bitrate: Int64
  let width: Int
  let height: Int
  let videoCodec: String
  let audioCodec: String
  let frameRate: Double
  let aspectRatio: String
  let format: String
  let size: Int64
  let streams: [[String: Any]]
}

struct TranscodeOptions {
  let videoCodec: String?
  let audioCodec: String?
  let videoBitrate: String?
  let audioBitrate: String?
  let width: Int?
  let height: Int?
  let frameRate: Double?
  let preset: String?
  let crf: Int?
  let profile: String?
  let level: String?
  let pixelFormat: String?
  let audioChannels: Int?
  let audioSampleRate: Int?
  let startTime: Double?
  let duration: Double?
  let filters: String?
  let metadata: [String: String]?
  let hardwareAcceleration: Bool
}

// MARK: - Stub Implementation
@objc(FFmpegModule)
class FFmpegModule: NSObject, FFmpegModuleProtocol {

  // MARK: - Constants
  private let MODULE_NAME = "FFmpegModule"
  private let STUB_WARNING = "⚠️ [STUB] FFmpegModule - No-op implementation. Original libffmpegJNI.so needs REIMPLEMENTATION (16h, High)"

  // MARK: - State
  private var runningProcesses: [String: Process] = [:]
  private let processQueue = DispatchQueue(label: "com.tomatoanimes.ffmpeg.queue", attributes: .concurrent)

  // MARK: - RCTBridgeModule
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func constantsToExport() -> [String: Any] {
    return [
      "isStub": true,
      "warning": STUB_WARNING,
      "originalLibrary": "libffmpegJNI.so",
      "riskLevel": "high",
      "estimatedHours": 16,
      "backend": "VideoToolbox/mobile-ffmpeg",
      "supportedCodecs": [
        "video": ["h264", "hevc", "vp9", "av1", "prores"],
        "audio": ["aac", "mp3", "opus", "flac", "pcm"],
        "subtitle": ["srt", "ass", "vtt", "subrip"]
      ],
      "supportedFormats": ["mp4", "mkv", "mov", "avi", "webm", "ts", "m3u8"],
      "hardwareAcceleration": ["videotoolbox", "vtb", "vtcp"],
    ]
  }

  // MARK: - Protocol Methods
  @objc
  func execute(_ command: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub execute: \(command)")

    // STUB: Simulate successful execution
    DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
      resolver([
        "exitCode": 0,
        "output": "STUB: Command executed successfully\n\(command)",
        "error": "",
        "isMock": true
      ])
    }
  }

  @objc
  func executeAsync(_ command: String, callback: @escaping RCTResponseSenderBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub executeAsync: \(command)")

    // STUB: Simulate async execution with progress
    let processId = UUID().uuidString

    DispatchQueue.global().async {
      // Simulate progress updates
      for progress in stride(from: 0, through: 100, by: 10) {
        Thread.sleep(forTimeInterval: 0.1)
        callback([
          ["type": "progress", "processId": processId, "progress": progress, "isMock": true]
        ])
      }

      // Final result
      callback([
        ["type": "complete", "processId": processId, "exitCode": 0, "output": "STUB: Async command completed", "isMock": true]
      ])
    }
  }

  @objc
  func getMediaInfo(_ path: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub getMediaInfo: \(path)")

    // STUB: Return mock media info
    let mockInfo: [String: Any] = [
      "duration": 1200.5,
      "bitrate": 5000000,
      "width": 1920,
      "height": 1080,
      "videoCodec": "h264",
      "audioCodec": "aac",
      "frameRate": 23.976,
      "aspectRatio": "16:9",
      "format": "mp4",
      "size": 750000000,
      "streams": [
        [
          "index": 0,
          "codecType": "video",
          "codecName": "h264",
          "width": 1920,
          "height": 1080,
          "frameRate": "24000/1001",
          "bitrate": "5000k",
          "language": "und"
        ],
        [
          "index": 1,
          "codecType": "audio",
          "codecName": "aac",
          "channels": 2,
          "sampleRate": 48000,
          "bitrate": "128k",
          "language": "jpn"
        ],
        [
          "index": 2,
          "codecType": "subtitle",
          "codecName": "subrip",
          "language": "por"
        ]
      ],
      "isMock": true
    ]

    resolver(mockInfo)
  }

  @objc
  func transcode(_ inputPath: String, outputPath: String, options: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub transcode: \(inputPath) -> \(outputPath)")

    // STUB: Simulate transcoding
    DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
      resolver([
        "success": true,
        "outputPath": outputPath,
        "duration": 1200.5,
        "size": 500000000,
        "isMock": true
      ])
    }
  }

  @objc
  func extractAudio(_ inputPath: String, outputPath: String, format: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub extractAudio: \(inputPath) -> \(outputPath) (\(format))")

    DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
      resolver([
        "success": true,
        "outputPath": outputPath,
        "format": format,
        "duration": 1200.5,
        "isMock": true
      ])
    }
  }

  @objc
  func extractFrames(_ inputPath: String, outputDir: String, interval: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub extractFrames: \(inputPath) -> \(outputDir) every \(interval)s")

    DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
      resolver([
        "success": true,
        "outputDir": outputDir,
        "framesExtracted": 10,
        "framePaths": [
          "\(outputDir)/frame_001.jpg",
          "\(outputDir)/frame_002.jpg",
          "\(outputDir)/frame_003.jpg",
        ],
        "isMock": true
      ])
    }
  }

  @objc
  func concatenate(_ inputs: [String], outputPath: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub concatenate: \(inputs.count) files -> \(outputPath)")

    DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
      resolver([
        "success": true,
        "outputPath": outputPath,
        "inputCount": inputs.count,
        "isMock": true
      ])
    }
  }

  @objc
  func trim(_ inputPath: String, outputPath: String, startTime: Double, duration: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)
    print("[FFmpeg] Stub trim: \(inputPath) -> \(outputPath) (\(startTime)s for \(duration)s)")

    DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
      resolver([
        "success": true,
        "outputPath": outputPath,
        "startTime": startTime,
        "duration": duration,
        "isMock": true
      ])
    }
  }

  @objc
  func getVersion(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    resolver([
      "version": "6.0-stub",
      "configuration": "STUB --enable-gpl --enable-version3 --enable-videotoolbox",
      "libavcodec": "58.0.0",
      "libavformat": "58.0.0",
      "libavutil": "56.0.0",
      "libswscale": "5.0.0",
      "libswresample": "3.0.0",
      "isMock": true
    ])
  }

  @objc
  func cancel(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: Cancel all running processes
    processQueue.async(flags: .barrier) {
      for (_, process) in self.runningProcesses {
        process.terminate()
      }
      self.runningProcesses.removeAll()
    }

    resolver(["success": true, "cancelledCount": self.runningProcesses.count, "isMock": true])
  }
}