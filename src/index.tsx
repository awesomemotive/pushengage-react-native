import PushengageReactNative from './NativePushengageReactNative';

const {
  setAppId,
  getSdkVersion,
  setSmallIconResource,
  getDeviceTokenHash,
  enableLogging,
  automatedNotification,
  sendTriggerEvent,
  sendGoal,
  addAlert,
  getSubscriberDetails,
  requestNotificationPermission,
  getSubscriberAttributes,
  addSegment,
  removeSegment,
  addDynamicSegment,
  addSubscriberAttributes,
  deleteSubscriberAttributes,
  addProfileId,
  setSubscriberAttributes,
  onValueChanged,
} = PushengageReactNative;

const PushEngage = {
  setAppId,
  getSdkVersion,
  setSmallIconResource,
  getDeviceTokenHash,
  enableLogging,
  automatedNotification,
  sendTriggerEvent,
  sendGoal,
  addAlert,
  getSubscriberDetails,
  requestNotificationPermission,
  getSubscriberAttributes,
  addSegment,
  removeSegment,
  addDynamicSegment,
  addSubscriberAttributes,
  deleteSubscriberAttributes,
  addProfileId,
  setSubscriberAttributes,
  onValueChanged,
};

export default PushEngage;
