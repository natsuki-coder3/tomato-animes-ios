//
//  TobEncryptModule.swift
//  TomatoAnimes
//
//  STUB IMPLEMENTATION - Critical library replacement
//  Original: libtobEmbedPagEncrypt.so (Payment/data encryption)
//  REIMPLEMENTATION REQUIRED: 24 hours, Critical risk
//

import Foundation
import React
import CryptoKit

// MARK: - Protocol for future RE implementation
@objc protocol TobEncryptModuleProtocol {
  func encrypt(_ data: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func decrypt(_ encryptedData: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func encryptWithKey(_ data: String, key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func decryptWithKey(_ encryptedData: String, key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func generateKey(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func hashData(_ data: String, algorithm: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}

// MARK: - Data Structures
struct EncryptionResult {
  let encryptedData: String
  let iv: String
  let key: String?
  let algorithm: String
}

struct DecryptionResult {
  let decryptedData: String
  let algorithm: String
}

// MARK: - Stub Implementation
@objc(TobEncryptModule)
class TobEncryptModule: NSObject, TobEncryptModuleProtocol {

  // MARK: - Constants
  private let MODULE_NAME = "TobEncryptModule"
  private let STUB_WARNING = "⚠️ [STUB] TobEncryptModule - Using CryptoKit placeholder. Original libtobEmbedPagEncrypt.so needs REIMPLEMENTATION (24h, Critical)"

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
      "originalLibrary": "libtobEmbedPagEncrypt.so",
      "riskLevel": "critical",
      "estimatedHours": 24,
      "supportedAlgorithms": ["AES-256-GCM", "ChaCha20-Poly1305", "RSA-OAEP"],
    ]
  }

  // MARK: - Protocol Methods
  @objc
  func encrypt(_ data: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    do {
      // Use CryptoKit as placeholder
      let key = SymmetricKey(size: .bits256)
      let sealedBox = try AES.GCM.seal(data.data(using: .utf8)!, using: key)

      let result: [String: Any] = [
        "encryptedData": sealedBox.ciphertext.base64EncodedString(),
        "iv": sealedBox.nonce.dataRepresentation.base64EncodedString(),
        "tag": sealedBox.tag.base64EncodedString(),
        "key": key.withUnsafeBytes { Data($0).base64EncodedString() },
        "algorithm": "AES-256-GCM",
        "isMock": true
      ]

      resolver(result)
    } catch {
      rejecter("ENCRYPTION_FAILED", "Failed to encrypt data: \(error.localizedDescription)", error)
    }
  }

  @objc
  func decrypt(_ encryptedData: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: In real implementation, we'd need the key/IV/tag
    // For now, return mock decrypted data
    resolver([
      "decryptedData": "STUB_DECRYPTED_\(encryptedData.prefix(20))",
      "algorithm": "AES-256-GCM",
      "isMock": true
    ])
  }

  @objc
  func encryptWithKey(_ data: String, key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    do {
      // Decode key from base64
      guard let keyData = Data(base64Encoded: key), keyData.count == 32 else {
        rejecter("INVALID_KEY", "Key must be 32 bytes (256 bits) base64 encoded", nil)
        return
      }

      let symmetricKey = SymmetricKey(data: keyData)
      let sealedBox = try AES.GCM.seal(data.data(using: .utf8)!, using: symmetricKey)

      let result: [String: Any] = [
        "encryptedData": sealedBox.ciphertext.base64EncodedString(),
        "iv": sealedBox.nonce.dataRepresentation.base64EncodedString(),
        "tag": sealedBox.tag.base64EncodedString(),
        "algorithm": "AES-256-GCM",
        "isMock": true
      ]

      resolver(result)
    } catch {
      rejecter("ENCRYPTION_FAILED", "Failed to encrypt with key: \(error.localizedDescription)", error)
    }
  }

  @objc
  func decryptWithKey(_ encryptedData: String, key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    // STUB: Return mock
    resolver([
      "decryptedData": "STUB_DECRYPTED_\(encryptedData.prefix(20))",
      "algorithm": "AES-256-GCM",
      "isMock": true
    ])
  }

  @objc
  func generateKey(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    let key = SymmetricKey(size: .bits256)
    let keyBase64 = key.withUnsafeBytes { Data($0).base64EncodedString() }

    resolver([
      "key": keyBase64,
      "algorithm": "AES-256",
      "isMock": true
    ])
  }

  @objc
  func hashData(_ data: String, algorithm: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print(STUB_WARNING)

    let hash: String
    switch algorithm.uppercased() {
    case "SHA256":
      hash = SHA256.hash(data: data.data(using: .utf8)!).compactMap { String(format: "%02x", $0) }.joined()
    case "SHA512":
      hash = SHA512.hash(data: data.data(using: .utf8)!).compactMap { String(format: "%02x", $0) }.joined()
    case "MD5":
      // Use Insecure for MD5
      hash = Insecure.MD5.hash(data: data.data(using: .utf8)!).compactMap { String(format: "%02x", $0) }.joined()
    default:
      rejecter("UNSUPPORTED_ALGORITHM", "Algorithm \(algorithm) not supported", nil)
      return
    }

    resolver([
      "hash": hash,
      "algorithm": algorithm,
      "isMock": true
    ])
  }
}