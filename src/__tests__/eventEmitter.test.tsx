jest.mock('../NativePushengageReactNative');

import mockNative from '../NativePushengageReactNative';
import PushEngage from '../index';

/**
 * Facade tests for `PushEngage.onValueChanged`. The actual EventEmitter
 * behavior (listener storage, multi-subscribe, remove) is implemented by
 * the React Native codegen layer and verified upstream; these tests just
 * confirm the JS facade is a transparent pass-through to the underlying
 * TurboModule's EventEmitter — no extra coercion, no wrapping.
 */
describe('onValueChanged facade', () => {
  beforeEach(() => {
    (mockNative.onValueChanged as unknown as jest.Mock).mockClear();
  });

  it('forwards the listener to the native EventEmitter', () => {
    const listener = jest.fn();
    PushEngage.onValueChanged(listener);

    expect(mockNative.onValueChanged).toHaveBeenCalledTimes(1);
    expect(mockNative.onValueChanged).toHaveBeenCalledWith(listener);
  });

  it('returns the native subscription object unchanged', () => {
    const fakeSubscription = { remove: jest.fn() };
    (mockNative.onValueChanged as unknown as jest.Mock).mockReturnValueOnce(
      fakeSubscription
    );

    const subscription = PushEngage.onValueChanged(() => {});

    expect(subscription).toBe(fakeSubscription);
  });
});
