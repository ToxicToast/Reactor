import { uuidEnv } from './uuid-env.function.js';

describe('uuidEnv', () => {
  it('returns the uuid in lower case', () => {
    expect(
      uuidEnv('ACTOR_ID', { ACTOR_ID: '0192F3A0-0000-7000-8000-0000000000C0' }),
    ).toBe('0192f3a0-0000-7000-8000-0000000000c0');
  });

  it('refuses values that are not uuids', () => {
    expect(() => uuidEnv('ACTOR_ID', { ACTOR_ID: 'cron' })).toThrow(
      'Environment variable ACTOR_ID must be a uuid',
    );
  });
});
