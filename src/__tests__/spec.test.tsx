jest.mock('../NativePushengageReactNative');

import PushEngage from '../index';

const expectedMethods = [
  'setAppId',
  'setEnvironment',
  'getSdkVersion',
  'setSmallIconResource',
  'getDeviceTokenHash',
  'enableLogging',
  'setBadgeCount',
  'automatedNotification',
  'sendTriggerEvent',
  'sendGoal',
  'addAlert',
  'getSubscriberDetails',
  'requestNotificationPermission',
  'getInitialNotification',
  'getNotificationPermissionStatus',
  'getSubscriptionStatus',
  'getSubscriptionNotificationStatus',
  'getSubscriberId',
  'unsubscribe',
  'subscribe',
  'getSubscriberAttributes',
  'addSegment',
  'removeSegment',
  'addDynamicSegment',
  'addSubscriberAttributes',
  'deleteSubscriberAttributes',
  'addProfileId',
  'setSubscriberAttributes',
  'identify',
  'logout',
  'trackEvent',
  'runConfigValidation',
  'onValueChanged',
  'onFcmConfigError',
];

describe('PushEngage spec surface', () => {
  test.each(expectedMethods)('exposes %s', name => {
    expect(PushEngage).toHaveProperty(name);
    expect(typeof (PushEngage as never)[name]).toBe('function');
  });

  it('exposes no other methods (catches accidental additions to facade)', () => {
    const actual = Object.keys(PushEngage).sort();
    const expected = [...expectedMethods].sort();
    expect(actual).toEqual(expected);
  });
});
