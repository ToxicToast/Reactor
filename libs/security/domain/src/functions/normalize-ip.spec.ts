import { normalizeIp } from './normalize-ip.function.js';

describe('normalizeIp', () => {
  it('unwraps ipv4 addresses mapped into ipv6', () => {
    expect(normalizeIp('::ffff:203.0.113.7')).toBe('203.0.113.7');
  });

  it('keeps plain ipv4 and ipv6 addresses', () => {
    expect(normalizeIp('203.0.113.7')).toBe('203.0.113.7');
    expect(normalizeIp('2001:DB8::1')).toBe('2001:db8::1');
  });
});
