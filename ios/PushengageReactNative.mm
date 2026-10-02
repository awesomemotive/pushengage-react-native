#import "PushengageReactNative.h"
#import "generated/RNPushengageReactNativeSpec/RNPushengageReactNativeSpec.h"
#import "pushengage_react_native-Swift.h"

@implementation PushengageReactNative {
  PushEngageReactNative *pushengageModule;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    pushengageModule = [[PushEngageReactNative alloc] init];
    ;

    [pushengageModule setCallbackWithCallback:^(
                          NSDictionary<NSString *, NSString *> *_Nonnull data) {
      [self emitOnValueChanged:(data)];
    }];

    [pushengageModule
        setIAMCustomActionCallbackWithCallback:^(
            NSDictionary<NSString *, id> *_Nonnull data) {
          [self emitOnIAMCustomAction:(data)];
        }];
  }
  return self;
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativePushengageReactNativeSpecJSI>(
      params);
}

- (void)addAlert:(NSDictionary *)alert
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule addAlert:alert resolve:resolve reject:reject];
}

- (void)addDynamicSegment:(NSArray *)segments
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule addDynamicSegment:segments resolve:resolve reject:reject];
}

- (void)addProfileId:(NSString *)profileId
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule addProfileId:profileId resolve:resolve reject:reject];
}

- (void)addSegment:(NSArray *)segments
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule addSegment:segments resolve:resolve reject:reject];
}

- (void)addSubscriberAttributes:(NSDictionary *)attributes
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule addSubscriberAttributes:attributes
                                    resolve:resolve
                                     reject:reject];
}

- (void)automatedNotification:(BOOL)status
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule automatedNotification:status resolve:resolve reject:reject];
}

- (void)deleteSubscriberAttributes:(NSArray *)attributes
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule deleteSubscriberAttributes:attributes
                                       resolve:resolve
                                        reject:reject];
}

- (void)enableLogging:(BOOL)shouldEnable {
  [pushengageModule enableLogging:shouldEnable];
}

- (void)setBadgeCount:(double)count {
  [pushengageModule setBadgeCount:count];
}

- (void)getDeviceTokenHash:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getDeviceTokenHashWithResolve:resolve reject:reject];
}

- (NSString *)getSdkVersion {
  return [pushengageModule getSdkVersion];
}

- (void)getSubscriberAttributes:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getSubscriberAttributesWithResolve:resolve reject:reject];
}

- (void)getSubscriberDetails:(NSArray *_Nullable)values
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getSubscriberDetails:values resolve:resolve reject:reject];
}

- (void)removeSegment:(NSArray *)segments
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule removeSegment:segments resolve:resolve reject:reject];
}

- (void)requestNotificationPermission:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule requestNotificationPermissionWithResolve:resolve
                                                      reject:reject];
}

- (NSString *)getNotificationPermissionStatus {
  return [pushengageModule getNotificationPermissionStatus];
}

- (void)getInitialNotification:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getInitialNotificationWithResolve:resolve reject:reject];
}

- (void)getSubscriptionStatus:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getSubscriptionStatusWithResolve:resolve reject:reject];
}

- (void)getSubscriptionNotificationStatus:(RCTPromiseResolveBlock)resolve
                                   reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getSubscriptionNotificationStatusWithResolve:resolve
                                                          reject:reject];
}

- (void)getSubscriberId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule getSubscriberIdWithResolve:resolve reject:reject];
}

- (void)unsubscribe:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule unsubscribeWithResolve:resolve reject:reject];
}

- (void)subscribe:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule subscribeWithResolve:resolve reject:reject];
}

- (void)sendGoal:(NSDictionary *)goal
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule sendGoal:goal resolve:resolve reject:reject];
}

- (void)sendTriggerEvent:(NSDictionary *)trigger
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule sendTriggerEvent:trigger resolve:resolve reject:reject];
}

- (void)setAppId:(NSString *)appId {
  [pushengageModule setAppId:appId];
}

- (void)setEnvironment:(NSString *)environment {
  [pushengageModule setEnvironment:environment];
}

- (void)setSmallIconResource:(NSString *)resourceName
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule setSmallIconResource:resourceName
                                 resolve:resolve
                                  reject:reject];
}

- (void)setSubscriberAttributes:(NSDictionary *)attributes
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule setSubscriberAttributes:attributes
                                    resolve:resolve
                                     reject:reject];
}

- (void)identify:(NSDictionary *)fields
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule identify:fields resolve:resolve reject:reject];
}

- (void)logout:(NSArray *_Nullable)fieldNames
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule logout:fieldNames resolve:resolve reject:reject];
}

- (void)trackEvent:(NSDictionary *)event
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule trackEvent:event resolve:resolve reject:reject];
}

- (void)runConfigValidation:(NSString *)senderId
                  projectId:(NSString *)projectId
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule runConfigValidation:senderId
                              projectId:projectId
                                resolve:resolve
                                 reject:reject];
}

- (void)setFcmConfigErrorListenerEnabled:(BOOL)enabled {
  [pushengageModule setFcmConfigErrorListenerEnabled:enabled];
}

- (void)setIAMCustomActionHandlerEnabled:(BOOL)enabled {
  [pushengageModule setIAMCustomActionHandlerEnabled:enabled];
}

- (void)triggerIAMEvent:(NSString *)eventName
             parameters:(NSDictionary *_Nullable)parameters
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [pushengageModule triggerIAMEvent:eventName
                         parameters:parameters
                            resolve:resolve
                             reject:reject];
}

@end
