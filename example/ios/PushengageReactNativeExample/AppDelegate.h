#import <RCTReactNativeFactory.h>
#import <UIKit/UIKit.h>

// Scene-based app lifecycle: AppDelegate owns the React Native factory and
// PushEngage setup; SceneDelegate creates the window and starts React Native
// in it. Apps built with the iOS 27 SDK must adopt the UIScene life cycle or
// they fail to launch on iOS 27.
@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) RCTReactNativeFactory *reactNativeFactory;
@property (nonatomic, strong) id<RCTReactNativeFactoryDelegate> reactNativeDelegate;

@end
