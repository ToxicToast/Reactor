import { cronjobActorIdFromEnv } from './cronjob-actor-id-from-env.function.js';
import { defaultJobOptionsFromEnv } from './default-job-options-from-env.function.js';

describe('cronjob config', () => {
  it('retries three times with exponential backoff by default', () => {
    expect(defaultJobOptionsFromEnv({})).toMatchObject({
      attempts: 4,
      backoff: { type: 'exponential', delay: 30000 },
    });
  });

  it('requires a uuid as actor id', () => {
    expect(() => cronjobActorIdFromEnv({ CRONJOB_ACTOR_ID: 'cron' })).toThrow(
      'uuid',
    );
    expect(
      cronjobActorIdFromEnv({
        CRONJOB_ACTOR_ID: '0192F3A0-0000-7000-8000-0000000000C0',
      }),
    ).toBe('0192f3a0-0000-7000-8000-0000000000c0');
  });
});
