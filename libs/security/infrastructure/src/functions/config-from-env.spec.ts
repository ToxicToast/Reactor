import { banPolicyConfigFromEnv } from './ban-policy-config-from-env.function.js';

describe('banPolicyConfigFromEnv', () => {
  it('escalates from 30 minutes to 7 days by default', () => {
    expect(banPolicyConfigFromEnv({})).toEqual({
      threshold: 20,
      windowSeconds: 300,
      durationsMinutes: [30, 120, 720, 10080],
      strikeWindowDays: 30,
      allowlist: ['127.0.0.1', '::1'],
    });
  });

  it('reads custom durations and allowlist', () => {
    const config = banPolicyConfigFromEnv({
      SECURITY_BAN_DURATIONS_MINUTES: '60,1440',
      SECURITY_ALLOWLIST: '10.0.0.0/8',
    });

    expect(config.durationsMinutes).toEqual([60, 1440]);
    expect(config.allowlist).toEqual(['10.0.0.0/8']);
  });

  it('refuses durations that are not whole minutes', () => {
    expect(() =>
      banPolicyConfigFromEnv({ SECURITY_BAN_DURATIONS_MINUTES: '30,abc' }),
    ).toThrow('SECURITY_BAN_DURATIONS_MINUTES');
  });
});
