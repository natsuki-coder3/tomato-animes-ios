//
//  DataStoreCounterModule.swift
//  TomatoAnimes
//
//  STUB IMPLEMENTATION - Medium risk library replacement
//  Original: libdatastore_shared_counter.so (Shared counter IPC)
//  REIMPLEMENTATION: UserDefaults (already implemented)
//  Risk: Medium, 8 hours (but already done via MMKV/UserDefaults)
//

import Foundation
import React

// MARK: - Protocol for future RE implementation
@objc protocol DataStoreCounterModuleProtocol {
  func increment(_ key: String, by: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func decrement(_ key: String, by: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func get(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func set(_ key: String, value: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func reset(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func getAll(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func remove(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func addListener(_ eventName: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
  func removeListeners(_ count: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}

// MARK: - Implementation using UserDefaults (Native iOS equivalent)
@objc(DataStoreCounterModule)
class DataStoreCounterModule: NSObject, DataStoreCounterModuleProtocol {

  // MARK: - Constants
  private let MODULE_NAME = "DataStoreCounterModule"
  private let SUITE_NAME = "group.com.tomatoanimes.counters"
  private let STUB_WARNING = "ℹ️ [IMPLEMENTED] DataStoreCounterModule - Using UserDefaults/MM KV. Original libdatastore_shared_counter.so replaced."

  // MARK: - UserDefaults
  private var userDefaults: UserDefaults {
    return UserDefaults(suiteName: SUITE_NAME) ?? UserDefaults.standard
  }

  // MARK: - RCTBridgeModule
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func constantsToExport() -> [String: Any] {
    return [
      "isStub": false,
      "warning": STUB_WARNING,
      "originalLibrary": "libdatastore_shared_counter.so",
      "riskLevel": "medium",
      "estimatedHours": 8,
      "implementation": "UserDefaults",
      "suiteName": SUITE_NAME,
      "supportsAppGroups": true,
    ]
  }

  // MARK: - Protocol Methods
  @objc
  func increment(_ key: String, by: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let currentValue = userDefaults.integer(forKey: key)
    let newValue = currentValue + by
    userDefaults.set(newValue, forKey: key)
    userDefaults.synchronize()

    // Notify listeners
    notifyListeners(key: key, oldValue: currentValue, newValue: newValue)

    resolver(["key": key, "oldValue": currentValue, "newValue": newValue, "increment": by])
  }

  @objc
  func decrement(_ key: String, by: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let currentValue = userDefaults.integer(forKey: key)
    let newValue = currentValue - by
    userDefaults.set(newValue, forKey: key)
    userDefaults.synchronize()

    notifyListeners(key: key, oldValue: currentValue, newValue: newValue)

    resolver(["key": key, "oldValue": currentValue, "newValue": newValue, "decrement": by])
  }

  @objc
  func get(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let value = userDefaults.integer(forKey: key)
    resolver(["key": key, "value": value])
  }

  @objc
  func set(_ key: String, value: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let oldValue = userDefaults.integer(forKey: key)
    userDefaults.set(value, forKey: key)
    userDefaults.synchronize()

    notifyListeners(key: key, oldValue: oldValue, newValue: value)

    resolver(["key": key, "oldValue": oldValue, "newValue": value])
  }

  @objc
  func reset(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let oldValue = userDefaults.integer(forKey: key)
    userDefaults.removeObject(forKey: key)
    userDefaults.synchronize()

    notifyListeners(key: key, oldValue: oldValue, newValue: 0)

    resolver(["key": key, "oldValue": oldValue, "newValue": 0])
  }

  @objc
  func getAll(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let allCounters = userDefaults.dictionaryRepresentation()
      .filter { $0.value is Int }
      .mapValues { $0 as! Int }

    resolver(["counters": allCounters])
  }

  @objc
  func remove(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let oldValue = userDefaults.integer(forKey: key)
    userDefaults.removeObject(forKey: key)
    userDefaults.synchronize()

    resolver(["key": key, "removed": true, "oldValue": oldValue])
  }

  @objc
  func addListener(_ eventName: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // In React Native, listeners are handled by RCTDeviceEventEmitter
    // This is a no-op for the native module
    resolver(["success": true, "eventName": eventName])
  }

  @objc
  func removeListeners(_ count: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // In React Native, listeners are handled by RCTDeviceEventEmitter
    resolver(["success": true, "count": count])
  }

  // MARK: - Private Methods
  private func notifyListeners(key: String, oldValue: Int, newValue: Int) {
    // Emit event to JavaScript
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "DataStoreCounterChange",
        body: [
          "key": key,
          "oldValue": oldValue,
          "newValue": newValue,
          "timestamp": Int64(Date().timeIntervalSince1970 * 1000)
        ]
      )
    }
  }
}

// MARK: - React Native Bridge Extension
// Note: In a real implementation, you'd use RCTBridge.current() or inject the bridge
// For this stub, we'll use a simple notification approach

extension DataStoreCounterModule {
  // This would be called from React Native to set up the bridge reference
  @objc
  func setBridge(_ bridge: RCTBridge) {
    // Store bridge reference for event emission
    objc_setAssociatedObject(self, "bridge", bridge, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
  }
}