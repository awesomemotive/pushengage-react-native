jest.mock('../NativePushengageReactNative');

import mockNative from '../NativePushengageReactNative';
import PushEngage from '../index';

/**
 * Tests for behavior the JS facade adds on top of pure native forwarding:
 *   - logout: JS-boundary TypeError on non-string array elements
 *   - identify: whitelisted-key forwarding (drops `as any` extras)
 *   - identify / trackEvent: undefined-valued optional fields are omitted
 *   - module-load side effect: FCM listener auto-enabled once at import
 */

describe('logout JS-boundary validation', () => {
  beforeEach(() => {
    (mockNative.logout as jest.Mock).mockReset();
    (mockNative.logout as jest.Mock).mockResolvedValue(undefined);
  });

  it('passes a valid string array through unchanged', async () => {
    await PushEngage.logout(['email', 'profile_id']);
    expect(mockNative.logout).toHaveBeenCalledWith(['email', 'profile_id']);
  });

  it('passes null through unchanged (default PII fallback)', async () => {
    await PushEngage.logout(null);
    expect(mockNative.logout).toHaveBeenCalledWith(null);
  });

  it('passes an empty array through unchanged', async () => {
    await PushEngage.logout([]);
    expect(mockNative.logout).toHaveBeenCalledWith([]);
  });

  it('rejects with TypeError when the array contains a non-string element', async () => {
    await expect(
      // `as any` simulates a JS caller bypassing TypeScript
      PushEngage.logout(['email', 1 as any, 'phone'])
    ).rejects.toBeInstanceOf(TypeError);

    expect(mockNative.logout).not.toHaveBeenCalled();
  });
});

describe('identify wrapper payload construction', () => {
  beforeEach(() => {
    (mockNative.identify as jest.Mock).mockReset();
    (mockNative.identify as jest.Mock).mockResolvedValue(undefined);
  });

  it('forwards only the fields that were set (no undefined keys)', async () => {
    await PushEngage.identify({ email: 'a@b.c', profile_id: 'u-1' });
    expect(mockNative.identify).toHaveBeenCalledWith({
      email: 'a@b.c',
      profile_id: 'u-1',
    });
  });

  it('drops keys outside the 12-field whitelist (via `as any` escape)', async () => {
    // Intentionally typed as `any` to simulate a JS caller bypassing TS
    // and verify the field-by-field copy drops unknown keys before they
    // reach native.
    const evilFields: any = {
      first_name: 'Alice',
      evil_key: 'should-be-dropped',
    };
    await PushEngage.identify(evilFields);
    expect(mockNative.identify).toHaveBeenCalledWith({ first_name: 'Alice' });
  });
});

describe('trackEvent wrapper payload construction', () => {
  beforeEach(() => {
    (mockNative.trackEvent as jest.Mock).mockReset();
    (mockNative.trackEvent as jest.Mock).mockResolvedValue(undefined);
  });

  it('omits undefined optional fields from the bridge payload', async () => {
    await PushEngage.trackEvent({ eventName: 'view' });
    expect(mockNative.trackEvent).toHaveBeenCalledWith({ eventName: 'view' });
  });

  it('forwards all set fields exactly as provided', async () => {
    await PushEngage.trackEvent({
      eventName: 'purchase',
      data: { sku: 'A1', qty: 2, vip: true },
      profileId: 'u-1',
      provider: 'Custom',
      eventType: 'PushEngage.CustomEvent',
    });
    expect(mockNative.trackEvent).toHaveBeenCalledWith({
      eventName: 'purchase',
      data: { sku: 'A1', qty: 2, vip: true },
      profileId: 'u-1',
      provider: 'Custom',
      eventType: 'PushEngage.CustomEvent',
    });
  });
});

describe('module-load auto-enable side effect', () => {
  it('calls setFcmConfigErrorListenerEnabled(true) exactly once on first import', () => {
    jest.isolateModules(() => {
      const freshMock = require('../NativePushengageReactNative')
        .default as typeof mockNative;
      (freshMock.setFcmConfigErrorListenerEnabled as jest.Mock).mockClear();

      require('../index');

      expect(freshMock.setFcmConfigErrorListenerEnabled).toHaveBeenCalledTimes(
        1
      );
      expect(freshMock.setFcmConfigErrorListenerEnabled).toHaveBeenCalledWith(
        true
      );
    });
  });
});
