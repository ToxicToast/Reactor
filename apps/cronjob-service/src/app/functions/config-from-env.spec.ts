import { defaultJobOptionsFromEnv } from './default-job-options-from-env.function.js';

describe('cronjob config', () => {
  it('retries three times with exponential backoff by default', () => {
    expect(defaultJobOptionsFromEnv({})).toMatchObject({
      attempts: 4,
      backoff: { type: 'exponential', delay: 30000 },
    });
  });
});
