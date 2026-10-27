import { HealthIndicatorService } from '@nestjs/terminus';
import { ProbeHealthIndicator } from './probe.health-indicator.js';

describe('ProbeHealthIndicator', () => {
  const indicator = new ProbeHealthIndicator(
    [
      {
        key: 'up',
        probe: async () => ({ up: true, details: { channels: 2 } }),
      },
      {
        key: 'down',
        probe: async () => ({ up: false, details: { message: 'offline' } }),
      },
      {
        key: 'broken',
        probe: async () => {
          throw new Error('boom');
        },
      },
    ],
    new HealthIndicatorService(),
  );

  it('turns every probe into a health check', async () => {
    const [up, down, broken] = indicator.checks();

    await expect(up()).resolves.toEqual({
      up: { status: 'up', channels: 2 },
    });
    await expect(down()).resolves.toEqual({
      down: { status: 'down', message: 'offline' },
    });
    await expect(broken()).resolves.toEqual({
      broken: { status: 'down', message: 'boom' },
    });
  });
});
