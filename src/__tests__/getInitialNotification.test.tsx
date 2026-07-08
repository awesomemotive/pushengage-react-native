jest.mock('../NativePushengageReactNative');

import mockNative from '../NativePushengageReactNative';
import PushEngage from '../index';

/**
 * Facade tests for `PushEngage.getInitialNotification`. The cold-boot
 * slot/queue mutual-exclusion semantics and idempotent drain are enforced
 * by `ios/MessageBuffer.swift` and covered by `MessageBufferTests.swift`;
 * these tests just confirm the JS facade transparently forwards to the
 * underlying TurboModule and propagates its resolved value.
 */
describe('getInitialNotification facade', () => {
  beforeEach(() => {
    (mockNative.getInitialNotification as jest.Mock).mockReset();
    (mockNative.getInitialNotification as jest.Mock).mockResolvedValue(null);
  });

  it('is exposed on the PushEngage facade', () => {
    expect(typeof PushEngage.getInitialNotification).toBe('function');
  });

  it('forwards the native module call with no arguments', async () => {
    await PushEngage.getInitialNotification();

    expect(mockNative.getInitialNotification).toHaveBeenCalledTimes(1);
    expect(mockNative.getInitialNotification).toHaveBeenCalledWith();
  });

  it('resolves with the native payload unchanged', async () => {
    const payload = {
      deepLink: 'app://cold-boot/42',
      data: { articleId: '42' },
    };
    (mockNative.getInitialNotification as jest.Mock).mockResolvedValueOnce(
      payload
    );

    const result = await PushEngage.getInitialNotification();

    expect(result).toEqual(payload);
  });

  it('resolves with null when native returns null', async () => {
    const result = await PushEngage.getInitialNotification();

    expect(result).toBeNull();
  });
});
