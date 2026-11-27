$packages = @(
  "expo-router",
  "expo-font",
  "expo-secure-store",
  "expo-notifications",
  "expo-media-library",
  "expo-document-picker",
  "expo-image-picker",
  "expo-av",
  "expo-haptics",
  "expo-device",
  "expo-application",
  "expo-constants",
  "expo-linking",
  "expo-web-browser",
  "expo-intent-launcher",
  "expo-task-manager",
  "expo-file-system",
  "expo-crypto",
  "expo-random",
  "expo-localization",
  "expo-splash-screen",
  "expo-image",
  "expo-build-properties",
  "react-native-reanimated",
  "react-native-gesture-handler",
  "@react-native-firebase/app"
)

foreach ($pkg in $packages) {
  $pluginPath = "node_modules/$pkg/app.plugin.js"
  $pkgJsonPath = "node_modules/$pkg/package.json"

  if (Test-Path $pluginPath) {
    Write-Host ("{0}: HAS app.plugin.js" -f $pkg)
  } elseif (Test-Path $pkgJsonPath) {
    $json = Get-Content $pkgJsonPath | ConvertFrom-Json
    if ($json.config_plugin) {
      Write-Host ("{0}: HAS config_plugin in package.json" -f $pkg)
    } else {
      Write-Host ("{0}: NO plugin" -f $pkg)
    }
  } else {
    Write-Host ("{0}: NOT FOUND" -f $pkg)
  }
}