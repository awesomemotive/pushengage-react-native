#import "SceneDelegate.h"

#import "AppDelegate.h"

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions {
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  AppDelegate *appDelegate =
      (AppDelegate *)UIApplication.sharedApplication.delegate;
  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  [appDelegate.reactNativeFactory
      startReactNativeWithModuleName:@"PushengageReactNativeExample"
                            inWindow:self.window
                   initialProperties:@{}
                       launchOptions:nil];
}

@end
