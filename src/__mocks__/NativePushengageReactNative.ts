/**
 * Jest manual mock for the codegen'd PushengageReactNative TurboModule.
 * Auto-applied when a test calls `jest.mock('../NativePushengageReactNative')`.
 *
 * This is a dumb pass-through: every method is a `jest.fn` with a sensible
 * default return so `import PushEngage from '../index'` resolves without
 * hitting `TurboModuleRegistry.getEnforcing` (which throws in Jest). Tests
 * that need behavior override per-call with
 * `(mockModule.foo as jest.Mock).mockResolvedValueOnce(...)`,
 * `mockReturnValueOnce(...)`, or `mockImplementation(...)`.
 *
 * The mock deliberately does NOT reimplement native semantics (the iOS
 * MessageBuffer slot/queue, the EventEmitter listener Set, etc.) — those
 * are verified by their respective native test suites
 * (`MessageBufferTests.swift`, RN codegen tests upstream). Mirroring them
 * here would only test the mirror, not the production code.
 */

const mockModule = {
  // Sync returns
  setAppId: jest.fn(),
  setEnvironment: jest.fn(),
  getSdkVersion: jest.fn(() => '1.0.0'),
  enableLogging: jest.fn(),
  setBadgeCount: jest.fn(),
  setFcmConfigErrorListenerEnabled: jest.fn(),
  getNotificationPermissionStatus: jest.fn(() => 'granted'),

  // Promise returns — default to resolved with a sensible value so any test
  // that calls them and awaits doesn't hang. Tests that care about the
  // result override per-call.
  setSmallIconResource: jest.fn(async () => undefined),
  getDeviceTokenHash: jest.fn(async () => ''),
  automatedNotification: jest.fn(async () => 'ok'),
  sendTriggerEvent: jest.fn(async () => 'ok'),
  sendGoal: jest.fn(async () => 'ok'),
  addAlert: jest.fn(async () => 'ok'),
  getSubscriberDetails: jest.fn(async () => ({})),
  requestNotificationPermission: jest.fn(async () => true),
  getSubscriptionStatus: jest.fn(async () => true),
  getSubscriptionNotificationStatus: jest.fn(async () => true),
  getSubscriberId: jest.fn(async () => 'sub-123'),
  unsubscribe: jest.fn(async () => undefined),
  subscribe: jest.fn(async () => undefined),
  getSubscriberAttributes: jest.fn(async () => ({})),
  addSegment: jest.fn(async () => 'ok'),
  removeSegment: jest.fn(async () => 'ok'),
  addDynamicSegment: jest.fn(async () => 'ok'),
  addSubscriberAttributes: jest.fn(async () => 'ok'),
  deleteSubscriberAttributes: jest.fn(async () => 'ok'),
  addProfileId: jest.fn(async () => 'ok'),
  setSubscriberAttributes: jest.fn(async () => 'ok'),
  identify: jest.fn(async () => undefined),
  logout: jest.fn(async () => undefined),
  trackEvent: jest.fn(async () => undefined),
  runConfigValidation: jest.fn(async () => true),
  getInitialNotification: jest.fn(async () => null),

  // EventEmitter pass-throughs. The default returns a subscription whose
  // remove() is a jest.fn so tests can assert it was called.
  onValueChanged: jest.fn(() => ({ remove: jest.fn() })),
  onFcmConfigError: jest.fn(() => ({ remove: jest.fn() })),
};

export default mockModule;
