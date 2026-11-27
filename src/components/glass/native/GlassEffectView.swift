//
//  GlassEffectView.swift
//  TomatoAnimes
//
//  Liquid Glass native UIVisualEffectView implementation for iOS 17+
//  Part of the Liquid Glass Design System
//

import Foundation
import UIKit
import SwiftUI

// MARK: - GlassEffectView
/// Native iOS glass effect view using UIVisualEffectView
/// Supports iOS 17+ native materials and iOS 26 Liquid Glass features
@available(iOS 17.0, *)
@objc(GlassEffectView)
class GlassEffectView: UIView {

  // MARK: - Properties
  private var effectView: UIVisualEffectView?
  private var vibrancyView: UIVisualEffectView?
  private var contentView: UIView?
  private var currentElevation: GlassElevation = .surface
  private var currentTintColor: UIColor?
  private var currentCornerRadius: CGFloat = 12
  private var currentBorderWidth: CGFloat = 0
  private var currentBorderColor: UIColor?

  // MARK: - Initialization
  override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }

  // MARK: - Setup
  private func setupView() {
    backgroundColor = .clear
    clipsToBounds = true
    layer.masksToBounds = true
  }

  // MARK: - Configuration
  func configure(
    elevation: GlassElevation,
    tintColor: UIColor? = nil,
    cornerRadius: CGFloat = 12,
    borderWidth: CGFloat = 0,
    borderColor: UIColor? = nil
  ) {
    currentElevation = elevation
    currentTintColor = tintColor
    currentCornerRadius = cornerRadius
    currentBorderWidth = borderWidth
    currentBorderColor = borderColor

    updateEffectView()
    updateAppearance()
  }

  // MARK: - Effect View Management
  private func updateEffectView() {
    // Remove existing effect view
    effectView?.removeFromSuperview()

    // Create new effect view with appropriate material
    let material = elevationToMaterial(currentElevation)
    let effect = UIBlurEffect(style: material)
    effectView = UIVisualEffectView(effect: effect)
    effectView?.frame = bounds
    effectView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    effectView?.clipsToBounds = true
    effectView?.layer.cornerRadius = currentCornerRadius
    effectView?.layer.masksToBounds = true

    if let effectView = effectView {
      insertSubview(effectView, at: 0)
    }

    // Create vibrancy view for content
    vibrancyView?.removeFromSuperview()
    let vibrancyEffect = UIVibrancyEffect(blurEffect: effect, style: .label)
    vibrancyView = UIVisualEffectView(effect: vibrancyEffect)
    vibrancyView?.frame = bounds
    vibrancyView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    if let vibrancyView = vibrancyView {
      effectView?.contentView.addSubview(vibrancyView)
    }

    // Content view for child views
    contentView?.removeFromSuperview()
    contentView = UIView()
    contentView?.backgroundColor = .clear
    contentView?.frame = bounds
    contentView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    if let contentView = contentView {
      vibrancyView?.contentView.addSubview(contentView)
    }
  }

  private func elevationToMaterial(_ elevation: GlassElevation) -> UIBlurEffect.Style {
    switch elevation {
    case .surface:
      return .systemMaterial
    case .elevated:
      return .systemThickMaterial
    case .overlay:
      return .systemChromeMaterial
    }
  }

  private func updateAppearance() {
    // Apply tint color
    if let tintColor = currentTintColor {
      effectView?.tintColor = tintColor
    } else {
      // Use system default tint based on elevation
      switch currentElevation {
      case .surface:
        effectView?.tintColor = UIColor.systemBackground.withAlphaComponent(0.72)
      case .elevated:
        effectView?.tintColor = UIColor.systemBackground.withAlphaComponent(0.80)
      case .overlay:
        effectView?.tintColor = UIColor.systemBackground.withAlphaComponent(0.88)
      }
    }

    // Apply corner radius
    layer.cornerRadius = currentCornerRadius
    effectView?.layer.cornerRadius = currentCornerRadius

    // Apply border
    layer.borderWidth = currentBorderWidth
    layer.borderColor = currentBorderColor?.cgColor ?? UIColor.separator.cgColor
  }

  // MARK: - Content Management
  func addContentView(_ view: UIView) {
    contentView?.addSubview(view)
  }

  func removeContentView(_ view: UIView) {
    view.removeFromSuperview()
  }

  // MARK: - Layout
  override func layoutSubviews() {
    super.layoutSubviews()
    effectView?.frame = bounds
    vibrancyView?.frame = bounds
    contentView?.frame = bounds
  }

  // MARK: - Trait Collection
  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    if traitCollection.hasDifferentColorAppearance(comparedTo: previousTraitCollection) {
      updateAppearance()
    }
  }
}

// MARK: - Glass Elevation Enum
enum GlassElevation: String {
  case surface = "surface"
  case elevated = "elevated"
  case overlay = "overlay"
}

// MARK: - SwiftUI Wrapper
@available(iOS 17.0, *)
struct GlassEffectViewRepresentable: UIViewRepresentable {
  let elevation: GlassElevation
  let tintColor: UIColor?
  let cornerRadius: CGFloat
  let borderWidth: CGFloat
  let borderColor: UIColor?
  let content: () -> AnyView

  func makeUIView(context: Context) -> GlassEffectView {
    let view = GlassEffectView()
    view.configure(
      elevation: elevation,
      tintColor: tintColor,
      cornerRadius: cornerRadius,
      borderWidth: borderWidth,
      borderColor: borderColor
    )

    let hostingController = UIHostingController(rootView: content())
    hostingController.view.backgroundColor = .clear
    view.addContentView(hostingController.view)

    return view
  }

  func updateUIView(_ uiView: GlassEffectView, context: Context) {
    uiView.configure(
      elevation: elevation,
      tintColor: tintColor,
      cornerRadius: cornerRadius,
      borderWidth: borderWidth,
      borderColor: borderColor
    )
  }
}

// MARK: - Liquid Glass (iOS 26) Support
@available(iOS 26.0, *)
extension GlassEffectView {
  func configureLiquidGlass(
    intensity: Float = 1.0,
    isInteractive: Bool = true,
    cornerRadius: CGFloat = 16
  ) {
    // iOS 26 Liquid Glass specific configuration
    // Uses new UIGlassEffect API when available
    if #available(iOS 26.0, *) {
      // New Liquid Glass material
      // This will be implemented when iOS 26 SDK is available
    }
  }
}