#import "AppDelegate.h"

#import <RCTDefaultReactNativeFactoryDelegate.h>
#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
@import PushEngage;

@interface ReactNativeDelegate : RCTDefaultReactNativeFactoryDelegate
@end

@implementation ReactNativeDelegate

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

@end

@implementation AppDelegate

- (instancetype)init {
  self = [super init];
  if (self) {
    [PushEngage swizzleInjectionWithIsEnabled:YES];
  }
  return self;
}

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  ReactNativeDelegate *delegate = [ReactNativeDelegate new];
  delegate.dependencyProvider = [RCTAppDependencyProvider new];
  self.reactNativeDelegate = delegate;
  self.reactNativeFactory =
      [[RCTReactNativeFactory alloc] initWithDelegate:delegate];

  [PushEngage setInitialInfoFor:application with:launchOptions];
  [PushEngage setBadgeCountWithCount:0];
  return YES;
}

- (UISceneConfiguration *)application:(UIApplication *)application
    configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession
                                   options:(UISceneConnectionOptions *)options {
  return [[UISceneConfiguration alloc]
      initWithName:@"Default Configuration"
       sessionRole:connectingSceneSession.role];
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:
              (void (^)(UIBackgroundFetchResult))completionHandler {
  completionHandler(UIBackgroundFetchResultNewData);
}

@end
