//
//  TomatoAnimesAppDelegate.swift
//  TomatoAnimes
//
//  Main AppDelegate with Firebase, AppLovin, AppCenter initialization
//

import Foundation
import UIKit
import FirebaseCore
import FirebaseAnalytics
import FirebaseCrashlytics
import FirebaseMessaging
import FirebaseRemoteConfig
import AppTrackingTransparency
import AdSupport
import AppLovinMediationSDK
import AppCenter
import AppCenterAnalytics
import AppCenterCrashes
import UserNotifications
import ExpoModulesCore

// MARK: - AppDelegate
@UIApplicationMain
class TomatoAnimesAppDelegate: ExpoAppDelegate {

  // MARK: - Properties
  private let gcmMessageIDKey = "gcm.message_id"
  private var isFirebaseConfigured = false

  // MARK: - Application Lifecycle
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Expo
    let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)

    // Configure Firebase
    configureFirebase()

    // Configure AppLovin
    configureAppLovin()

    // Configure AppCenter
    configureAppCenter()

    // Configure Push Notifications
    configurePushNotifications(application)

    // Configure URL Schemes
    configureURLSchemes()

    // Configure Appearance
    configureAppearance()

    // Handle launch options (deep links, notifications)
    handleLaunchOptions(launchOptions)

    return result
  }

  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)

    // Set APNS token for Firebase Messaging
    Messaging.messaging().apnsToken = deviceToken

    // Log token
    let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    print("[AppDelegate] APNS Device Token: \(tokenString)")

    // Register with analytics
    Analytics.logEvent("apns_token_registered", parameters: [
      "token_length": tokenString.count
    ])
  }

  override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    super.application(application, didFailToRegisterForRemoteNotificationsWithError: error)
    print("[AppDelegate] Failed to register for remote notifications: \(error)")
    Crashlytics.crashlytics().record(error: error)
  }

  override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    super.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)

    // Handle Firebase Messaging
    if Messaging.messaging().delegate?.messaging != nil {
      Messaging.messaging().appDidReceiveMessage(userInfo)
    }

    // Log notification
    Analytics.logEvent("push_notification_received", parameters: [
      "has_content_available": userInfo["content-available"] as? Int ?? 0,
      "has_mutable_content": userInfo["mutable-content"] as? Int ?? 0,
    ])

    // Process notification
    processNotification(userInfo)

    completionHandler(.newData)
  }

  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // Handle deep links
    print("[AppDelegate] Open URL: \(url)")

    // Track deep link
    Analytics.logEvent("deep_link_opened", parameters: [
      "url": url.absoluteString,
      "scheme": url.scheme ?? "",
      "host": url.host ?? "",
      "path": url.path,
    ])

    // Let Expo handle the URL
    return super.application(app, open: url, options: options)
  }

  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    // Handle Universal Links
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
      print("[AppDelegate] Universal Link: \(url)")

      Analytics.logEvent("universal_link_opened", parameters: [
        "url": url.absoluteString,
      ])
    }

    return super.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }

  override func applicationDidBecomeActive(_ application: UIApplication) {
    super.applicationDidBecomeActive(application)

    // Track app foreground
    Analytics.logEvent("app_foreground", parameters: [:])

    // Reset badge count
    application.applicationIconBadgeNumber = 0

    // Request ATT permission if needed
    requestTrackingAuthorizationIfNeeded()
  }

  override func applicationWillResignActive(_ application: UIApplication) {
    super.applicationWillResignActive(application)

    // Track app background
    Analytics.logEvent("app_background", parameters: [:])
  }

  override func applicationDidEnterBackground(_ application: UIApplication) {
    super.applicationDidEnterBackground(application)

    // Flush analytics
    Analytics.flush()
  }

  override func applicationWillTerminate(_ application: UIApplication) {
    super.applicationWillTerminate(application)

    // Flush analytics
    Analytics.flush()
  }

  // MARK: - Configuration Methods
  private func configureFirebase() {
    guard !isFirebaseConfigured else { return }

    FirebaseApp.configure()

    // Configure Analytics
    Analytics.setAnalyticsCollectionEnabled(true)
    Analytics.setUserProperty("platform", value: "ios")
    Analytics.setUserProperty("app_version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0")

    // Configure Crashlytics
    Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true)

    // Configure Remote Config
    let remoteConfig = RemoteConfig.remoteConfig()
    let settings = RemoteConfigSettings()
    settings.minimumFetchInterval = 3600 // 1 hour
    remoteConfig.configSettings = settings

    // Configure Messaging
    Messaging.messaging().delegate = self

    isFirebaseConfigured = true
    print("[AppDelegate] Firebase configured successfully")
  }

  private func configureAppLovin() {
    // Initialize AppLovin MAX
    ALSdk.shared()?.mediationProvider = "max"
    ALSdk.shared()?.initializeSdk { [weak self] configuration in
      print("[AppDelegate] AppLovin MAX initialized: \(configuration)")

      // Set user consent for GDPR/CCPA
      ALPrivacySettings.setHasUserConsent(true)

      // Load initial ads
      self?.loadInitialAds()
    }
  }

  private func loadInitialAds() {
    // Preload interstitials and rewarded ads
    // Implementation depends on ad unit IDs
  }

  private func configureAppCenter() {
    guard let appSecret = Bundle.main.infoDictionary?["APPCENTER_IOS_SECRET"] as? String else {
      print("[AppDelegate] AppCenter secret not found, skipping initialization")
      return
    }

    MSAppCenter.start(appSecret, withServices: [
      MSAnalytics.self,
      MSCrashes.self,
    ])

    // Set user ID for analytics
    if let userId = UserDefaults.standard.string(forKey: "user_id") {
      MSAnalytics.setUserId(userId)
    }

    // Enable automatic crash reporting
    MSCrashes.setEnabled(true)

    // Set delegate for crash handling
    MSCrashes.setDelegate(self)

    print("[AppDelegate] AppCenter initialized")
  }

  private func configurePushNotifications(_ application: UIApplication) {
    // Request notification permissions
    UNUserNotificationCenter.current().delegate = self
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { granted, error in
      if let error = error {
        print("[AppDelegate] Notification permission error: \(error)")
      }
      print("[AppDelegate] Notification permission granted: \(granted)")

      DispatchQueue.main.async {
        application.registerForRemoteNotifications()
      }
    }

    // Set notification categories
    setupNotificationCategories()
  }

  private func setupNotificationCategories() {
    let watchAction = UNNotificationAction(
      identifier: "WATCH_ACTION",
      title: "Assistir Agora",
      options: [.foreground]
    )

    let downloadAction = UNNotificationAction(
      identifier: "DOWNLOAD_ACTION",
      title: "Baixar",
      options: [.foreground]
    )

    let dismissAction = UNNotificationAction(
      identifier: "DISMISS_ACTION",
      title: "Dispensar",
      options: [.destructive]
    )

    let episodeCategory = UNNotificationCategory(
      identifier: "NEW_EPISODE",
      actions: [watchAction, downloadAction, dismissAction],
      intentIdentifiers: [],
      options: [.customDismissAction]
    )

    let downloadCategory = UNNotificationCategory(
      identifier: "DOWNLOAD_COMPLETE",
      actions: [watchAction, dismissAction],
      intentIdentifiers: [],
      options: []
    )

    UNUserNotificationCenter.current().setNotificationCategories([
      episodeCategory,
      downloadCategory,
    ])
  }

  private func configureURLSchemes() {
    // URL schemes are configured in Info.plist
    // This is for runtime handling
  }

  private func configureAppearance() {
    // Configure global appearance
    if #available(iOS 15.0, *) {
      let appearance = UINavigationBarAppearance()
      appearance.configureWithTransparentBackground()
      appearance.backgroundEffect = UIBlurEffect(style: .systemMaterial)
      appearance.shadowColor = .clear

      UINavigationBar.appearance().standardAppearance = appearance
      UINavigationBar.appearance().scrollEdgeAppearance = appearance
      UINavigationBar.appearance().compactAppearance = appearance

      // Tab bar appearance
      let tabBarAppearance = UITabBarAppearance()
      tabBarAppearance.configureWithTransparentBackground()
      tabBarAppearance.backgroundEffect = UIBlurEffect(style: .systemThickMaterial)
      tabBarAppearance.shadowColor = .clear

      UITabBar.appearance().standardAppearance = tabBarAppearance
      UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
  }

  private func handleLaunchOptions(_ launchOptions: [UIApplication.LaunchOptionsKey: Any]?) {
    guard let launchOptions = launchOptions else { return }

    // Handle notification tap
    if let notification = launchOptions[.remoteNotification] as? [AnyHashable: Any] {
      processNotification(notification)
    }

    // Handle URL launch
    if let url = launchOptions[.url] as? URL {
      print("[AppDelegate] Launched with URL: \(url)")
    }
  }

  private func processNotification(_ userInfo: [AnyHashable: Any]) {
    // Process notification payload
    guard let aps = userInfo["aps"] as? [String: Any] else { return }

    // Handle custom data
    if let type = userInfo["type"] as? String {
      switch type {
      case "new_episode":
        if let animeId = userInfo["anime_id"] as? String,
           let episode = userInfo["episode"] as? Int {
          // Navigate to player
          NotificationCenter.default.post(
            name: NSNotification.Name("DeepLink"),
            object: nil,
            userInfo: ["url": "tomatoanimes://watch/\(animeId)/\(episode)"]
          )
        }
      case "download_complete":
        if let animeId = userInfo["anime_id"] as? String {
          NotificationCenter.default.post(
            name: NSNotification.Name("DeepLink"),
            object: nil,
            userInfo: ["url": "tomatoanimes://downloads/\(animeId)"]
          )
        }
      default:
        break
      }
    }
  }

  private func requestTrackingAuthorizationIfNeeded() {
    if #available(iOS 14, *) {
      let status = ATTrackingManager.trackingAuthorizationStatus
      if status == .notDetermined {
        ATTrackingManager.requestTrackingAuthorization { newStatus in
          print("[AppDelegate] ATT Status: \(newStatus.rawValue)")
          Analytics.logEvent("att_status", parameters: [
            "status": newStatus.rawValue
          ])
        }
      }
    }
  }
}

// MARK: - MessagingDelegate
extension TomatoAnimesAppDelegate: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("[AppDelegate] FCM Token: \(fcmToken ?? "nil")")

    if let token = fcmToken {
      // Send token to server
      UserDefaults.standard.set(token, forKey: "fcm_token")

      Analytics.logEvent("fcm_token_refreshed", parameters: [
        "token_length": token.count
      ])
    }
  }
}

// MARK: - UNUserNotificationCenterDelegate
extension TomatoAnimesAppDelegate: UNUserNotificationCenterDelegate {
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    // Show notification even when app is in foreground
    completionHandler([.banner, .badge, .sound, .list])
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let userInfo = response.notification.request.content.userInfo

    // Handle action
    switch response.actionIdentifier {
    case "WATCH_ACTION":
      if let animeId = userInfo["anime_id"] as? String,
         let episode = userInfo["episode"] as? Int {
        NotificationCenter.default.post(
          name: NSNotification.Name("DeepLink"),
          object: nil,
          userInfo: ["url": "tomatoanimes://watch/\(animeId)/\(episode)"]
        )
      }
    case "DOWNLOAD_ACTION":
      if let animeId = userInfo["anime_id"] as? String,
         let episode = userInfo["episode"] as? Int {
        NotificationCenter.default.post(
          name: NSNotification.Name("DeepLink"),
          object: nil,
          userInfo: ["url": "tomatoanimes://watch/\(animeId)/\(episode)?action=download"]
        )
      }
    default:
      break
    }

    completionHandler()
  }
}

// MARK: - MSCrashesDelegate
extension TomatoAnimesAppDelegate: MSCrashesDelegate {
  func crashes(_ crashes: MSCrashes!, shouldProcessErrorReport errorReport: MSErrorReport!) -> Bool {
    // Add custom data to crash reports
    errorReport.setCustomValue(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String, forKey: "app_version")
    errorReport.setCustomValue(Bundle.main.infoDictionary?["CFBundleVersion"] as? String, forKey: "build_number")
    errorReport.setCustomValue(UIDevice.current.systemVersion, forKey: "ios_version")
    errorReport.setCustomValue(UIDevice.current.model, forKey: "device_model")
    return true
  }

  func crashes(_ crashes: MSCrashes!, willSend errorReport: MSErrorReport!) {
    print("[AppDelegate] Sending crash report to AppCenter")
  }

  func crashes(_ crashes: MSCrashes!, didSucceedSending errorReport: MSErrorReport!) {
    print("[AppDelegate] Crash report sent successfully")
  }

  func crashes(_ crashes: MSCrashes!, didFailSending errorReport: MSErrorReport!, withError error: Error!) {
    print("[AppDelegate] Failed to send crash report: \(error)")
  }
}