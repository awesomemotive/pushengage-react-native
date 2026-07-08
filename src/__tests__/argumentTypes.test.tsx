jest.mock('../NativePushengageReactNative');

import mockNative from '../NativePushengageReactNative';
import PushEngage from '../index';

/**
 * Runtime arg-shape checks: TypeScript catches type drift at compile time,
 * but these confirm the JS facade actually forwards JS-side primitives to
 * the native module without unintended coercion.
 */

describe('argument forwarding', () => {
  beforeEach(() => {
    Object.values(mockNative).forEach(v => {
      if (typeof v === 'function' && 'mockClear' in v) {
        (v as jest.Mock).mockClear();
      }
    });
  });

  it('setBadgeCount passes the number through unchanged', () => {
    PushEngage.setBadgeCount(5);
    expect(mockNative.setBadgeCount).toHaveBeenCalledWith(5);
  });

  it('setBadgeCount accepts zero', () => {
    PushEngage.setBadgeCount(0);
    expect(mockNative.setBadgeCount).toHaveBeenCalledWith(0);
  });

  it('addAlert forwards the dict shape', async () => {
    const alert = {
      type: 'priceDrop',
      productId: 'p1',
      link: 'https://x',
      price: 9.99,
    };
    await PushEngage.addAlert(alert);
    expect(mockNative.addAlert).toHaveBeenCalledWith(alert);
  });

  it('setAppId forwards the appId string', () => {
    PushEngage.setAppId('app-abc');
    expect(mockNative.setAppId).toHaveBeenCalledWith('app-abc');
  });

  it('addSegment forwards the array of strings', async () => {
    await PushEngage.addSegment(['premium', 'mobile']);
    expect(mockNative.addSegment).toHaveBeenCalledWith(['premium', 'mobile']);
  });
});
