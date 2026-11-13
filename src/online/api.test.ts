import { describe, expect, it } from 'vitest';
import { deviceCode, fromDeviceCode } from './api';

describe('online account on this device', () => {
  it('the device code moves id and key, typed in any case and with any dashes', () => {
    const a = { id: 'ABCD2345', key: 'K7M9P2Q4R6S8T1V3', name: 'Roter Falke 7' };
    const code = deviceCode(a);
    expect(code).toBe('ABCD-2345-K7M9-P2Q4-R6S8-T1V3');
    expect(fromDeviceCode(code.toLowerCase().replace(/-/g, ' '))).toEqual({
      id: a.id,
      key: a.key,
    });
    expect(fromDeviceCode('ABCD-2345')).toBeUndefined();
  });
});
