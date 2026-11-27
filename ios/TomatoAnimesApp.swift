//
//  TomatoAnimesApp.swift
//  TomatoAnimes
//
//  Main App entry point with ExpoRouter + ThemeProvider
//

import SwiftUI
import ExpoModulesCore
import FirebaseCore

// MARK: - Main App
@main
struct TomatoAnimesApp: App {
  // MARK: - Properties
  @UIApplicationDelegateAdaptor(TomatoAnimesAppDelegate.self) var appDelegate
  @StateObject private var themeManager = ThemeManager()

  // MARK: - Body
  var body: some Scene {
    WindowGroup {
      ExpoRootView()
        .environmentObject(themeManager)
        .onAppear {
          // Configure initial theme
          themeManager.applySystemTheme()
        }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
          themeManager.applySystemTheme()
        }
    }
  }
}

// MARK: - Theme Manager
class ThemeManager: ObservableObject {
  @Published var colorScheme: ColorScheme = .dark
  @Published var useSystemTheme: Bool = true

  private var observer: NSObjectProtocol?

  init() {
    setupObserver()
  }

  deinit {
    if let observer = observer {
      NotificationCenter.default.removeObserver(observer)
    }
  }

  private func setupObserver() {
    observer = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.applySystemTheme()
    }
  }

  func applySystemTheme() {
    guard useSystemTheme else { return }

    let systemScheme = UITraitCollection.current.userInterfaceStyle
    DispatchQueue.main.async {
      self.colorScheme = systemScheme == .dark ? .dark : .light
    }
  }

  func setColorScheme(_ scheme: ColorScheme) {
    useSystemTheme = false
    colorScheme = scheme
  }

  func setSystemTheme() {
    useSystemTheme = true
    applySystemTheme()
  }
}

// MARK: - Expo Root View
struct ExpoRootView: View {
  @EnvironmentObject var themeManager: ThemeManager

  var body: some View {
    ExpoView()
      .preferredColorScheme(themeManager.colorScheme)
      .ignoresSafeArea(.keyboard, edges: .bottom)
  }
}

// MARK: - App Configuration
struct AppConfig {
  static let bundleIdentifier = "com.migue.tomatoanimes"
  static let version = "1.6.1"
  static let buildNumber = "105"
  static let minimumDeploymentTarget = "17.0"

  static let supportedURLSchemes = [
    "tomatoanimes",
  ]

  static let associatedDomains = [
    "applinks:tomatoanimes.com",
    "applinks:www.tomatoanimes.com",
  ]

  static let backgroundModes = [
    "audio",
    "picture-in-picture",
    "background-processing",
    "remote-notification",
  ]

  static let requiredPermissions = [
    "NSPhotoLibraryUsageDescription": "Tomato Animes precisa acessar suas fotos para salvar imagens de animes.",
    "NSCameraUsageDescription": "Tomato Animes precisa acessar sua câmera para escanear QR codes.",
    "NSMicrophoneUsageDescription": "Tomato Animes precisa acessar seu microfone para busca por voz.",
    "NSCalendarsUsageDescription": "Tomato Animes pode adicionar lembretes de lançamentos ao seu calendário.",
    "NSUserTrackingUsageDescription": "Usamos identificadores para personalizar anúncios e medir performance.",
  ]

  static let infoPlistKeys: [String: Any] = [
    "ITSAppUsesNonExemptEncryption": false,
    "LSApplicationQueriesSchemes": ["itms-apps", "itms", "tiktok", "snssdk1128"],
    "UIBackgroundModes": backgroundModes,
    "CFBundleURLTypes": [
      [
        "CFBundleURLSchemes": supportedURLSchemes,
        "CFBundleURLName": "Tomato Animes Deep Link",
      ]
    ],
  ]
}