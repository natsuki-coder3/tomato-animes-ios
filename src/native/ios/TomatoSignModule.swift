//
//  TomatoSignModule.swift
//  TomatoAnimes
//
//  STUB IMPLEMENTATION - Critical library replacement
//  Original: libtomatosign.so (API request signing)
//  REIMPLEMENTATION REQUIRED: 40 hours, Critical risk
//

import Foundation
import React

// MARK: - Protocol for future RE implementation
@objc protocol TomatoSignModuleProtocol {
  func signRequest(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func verifySignature(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func getPublicKey(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}

// MARK: - Data Structures
struct SignRequestParams {
  let method: String
  let url: String
  let timestamp: Int64
  let nonce: String
  let body: String?
  let headers: [String: String]?
}

struct SignResult {
  let signature: String
  let timestamp: Int64
  let nonce: String
  let algorithm: String
}

// MARK: - Stub Implementation
@objc(TomatoSignModule)
class TomatoSignModule: NSObject, TomatoSignModuleProtocol {

  // MARK: - Constants
  private let MODULE_NAME = "TomatoSignModule"
  private let STUB_WARNING = "⚠️ [STUB] TomatoSignModule - Using mock implementation. Original libtomatosign.so needs REIMPLEMENTATION (40h, Critical)"

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
      "originalLibrary": "libtomatosign.so",
      "riskLevel": "critical",
      "estimatedHours": 40,
    ]
  }

  // MARK: - Protocol Methods
  @objc
  func signRequest(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    guard let method = params["method"] as? String,
          let url = params["url"] as? String,
          let timestamp = params["timestamp"] as? Int64,
          let nonce = params["nonce"] as? String else {
      rejecter("INVALID_PARAMS", "Missing required parameters: method, url, timestamp, nonce", nil)
      return
    }

    // STUB: Generate mock signature
    // In real implementation, this would use the native signing algorithm
    let mockSignature = generateMockSignature(
      method: method,
      url: url,
      timestamp: timestamp,
      nonce: nonce,
      body: params["body"] as? String,
      headers: params["headers"] as? [String: String]
    )

    let result: [String: Any] = [
      "signature": mockSignature,
      "timestamp": timestamp,
      "nonce": nonce,
      "algorithm": "TOMATO-SIGN-V1-STUB",
      "isMock": true
    ]

    resolver(result)
  }

  @objc
  func verifySignature(_ params: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: Always return true for mock signatures
    resolver(["valid": true, "isMock": true])
  }

  @objc
  func getPublicKey(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: Return mock public key
    let mockPublicKey = """
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
    -----END PUBLIC KEY-----
    """

    resolver([
      "publicKey": mockPublicKey,
      "algorithm": "RSA-2048",
      "isMock": true
    ])
  }

  // MARK: - Private Methods
  private func generateMockSignature(
    method: String,
    url: String,
    timestamp: Int64,
    nonce: String,
    body: String?,
    headers: [String: String]?
  ) -> String {
    // Create a deterministic mock signature based on input
    let input = "\(method):\(url):\(timestamp):\(nonce):\(body ?? ""):\(headers?.description ?? "")"
    let hash = input.data(using: .utf8)?.base64EncodedString() ?? ""
    return "TOMATO_SIGN_STUB_\(hash.prefix(32))"
  }
}

// MARK: - React Native Bridge Registration
// This will be auto-registered via the react-native config in package.json
// No additional registration needed for TurboModules