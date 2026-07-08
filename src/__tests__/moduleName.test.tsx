/**
 * Verifies the TurboModule is registered under the exact name 'PushengageReactNative'.
 * This name must match:
 *   iOS: @objc(PushEngageReactNative) + RCT_EXPORT_MODULE() in PushengageReactNative.mm
 *   Android: @ReactModule(name = PushengageReactNativeModule.NAME) where NAME = "PushengageReactNative"
 */

export {}; // ensure this file is a module so top-level consts aren't global-scoped

const mockGetEnforcing = jest.fn(() => ({}));
jest.mock('react-native', () => ({
  TurboModuleRegistry: {
    getEnforcing: mockGetEnforcing,
  },
}));

describe('module name registration', () => {
  it('imports the TurboModule as "PushengageReactNative"', () => {
    require('../NativePushengageReactNative');
    expect(mockGetEnforcing).toHaveBeenCalledWith('PushengageReactNative');
  });
});
