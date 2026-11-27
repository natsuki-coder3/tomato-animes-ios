//
//  GlassEffectViewBridge.swift
//  LiquidGlass
//
//  Swift bridge for React Native native module
//

import Foundation
import React

@objc(GlassEffectViewBridge)
class GlassEffectViewBridge: RCTEventEmitter {

    static var sharedInstance: GlassEffectViewBridge?

    override init() {
        super.init()
        GlassEffectViewBridge.sharedInstance = self
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func supportedEvents() -> [String]! {
        return ["GlassEffectViewBlurChanged", "GlassEffectViewTintChanged"]
    }

    @objc
    func setBlurStyle(_ style: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            // This would be handled by the view manager directly
            resolver(true)
        }
    }

    @objc
    func setTintColor(_ color: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolver(true)
        }
    }

    @objc
    func isReduceTransparencyEnabled(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let enabled = UIAccessibility.isReduceTransparencyEnabled
        resolver(enabled)
    }

    @objc
    func isReduceMotionEnabled(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let enabled = UIAccessibility.isReduceMotionEnabled
        resolver(enabled)
    }
}

// MARK: - Module Registration

@objc(LiquidGlass)
class LiquidGlass: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func constantsToExport() -> [String: Any] {
        return [
            "BlurStyles": [
                "ultraThin": "systemUltraThinMaterial",
                "thin": "systemThinMaterial",
                "regular": "systemMaterial",
                "thick": "systemThickMaterial",
                "chrome": "systemChromeMaterial",
            ],
            "ShadowLevels": [
                "level0": 0,
                "level1": 1,
                "level2": 2,
                "level3": 3,
                "level4": 4,
            ],
            "isIOS26OrLater": isIOS26OrLater(),
        ]
    }

    @objc
    func isReduceTransparencyEnabled(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(UIAccessibility.isReduceTransparencyEnabled)
    }

    @objc
    func isReduceMotionEnabled(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(UIAccessibility.isReduceMotionEnabled)
    }

    private func isIOS26OrLater() -> Bool {
        if #available(iOS 26.0, *) {
            return true
        }
        return false
    }
}