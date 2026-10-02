require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "pushengage-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/awesomemotive/pushengage-react-native.git", :tag => "#{s.version}" }
  s.private_header_files = "ios/**/*.h"

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  # Test files live under ios/PushEngageReactNativeTests/ but the glob above
  # picks them up too. Exclude them from the main module so the test_spec
  # below owns them exclusively.
  s.exclude_files = "ios/PushEngageReactNativeTests/**/*"

  s.dependency 'PushEngage', '1.1.0'

  # Unit-test target. Tests live under ios/PushEngageReactNativeTests/ and
  # exercise the bridge's pure-logic surface (MessageBuffer, Mappers, argument
  # validation rejection paths). Run from the example app workspace:
  #   xcodebuild test -workspace example/ios/PushengageReactNativeExample.xcworkspace \
  #     -scheme pushengage-react-native-Unit-Tests \
  #     -destination 'platform=iOS Simulator,name=iPhone 16'
  s.test_spec 'Tests' do |test_spec|
    test_spec.source_files = 'ios/PushEngageReactNativeTests/**/*.{swift}'
    # Tests instantiate PushEngageReactNative which internally calls
    # PushEngage.setNotificationOpenHandler. The SDK reaches into
    # UNUserNotificationCenter.current() during that path, which requires a
    # real app bundle. requires_app_host generates a minimal host app so the
    # bundle URL resolves correctly.
    test_spec.requires_app_host = true
    # CocoaPods doesn't include the XCTest framework search path on test_spec
    # targets by default; add it so `import XCTest` resolves.
    test_spec.pod_target_xcconfig = {
      'FRAMEWORK_SEARCH_PATHS' => '$(inherited) $(PLATFORM_DIR)/Developer/Library/Frameworks',
      'LD_RUNPATH_SEARCH_PATHS' => '$(inherited) @executable_path/Frameworks @loader_path/Frameworks'
    }
  end

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"

    # Don't install the dependencies when we run `pod install` in the old architecture.
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
          "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_TARGET_SRCROOT)/ios/generated/RNPushengageReactNativeSpec\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end
end
