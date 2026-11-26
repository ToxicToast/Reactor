import type { MetricValues } from '../types/index.js';
import { metricsChanged } from './metrics-changed.function.js';

const KEYS = ['views', 'likes', 'shares'] as const;
type Key = (typeof KEYS)[number];

const metrics = (
  overrides: Partial<MetricValues<Key>> = {},
): MetricValues<Key> => {
  return { views: 100, likes: 5, shares: null, ...overrides };
};

describe('metricsChanged', () => {
  it('treats the first measurement as a change', () => {
    expect(metricsChanged(null, metrics(), KEYS)).toBe(true);
  });

  it('ignores identical measurements', () => {
    expect(metricsChanged(metrics(), metrics(), KEYS)).toBe(false);
  });

  it('detects a single changed metric', () => {
    expect(metricsChanged(metrics(), metrics({ views: 101 }), KEYS)).toBe(true);
  });

  it('tells null and zero apart', () => {
    expect(metricsChanged(metrics(), metrics({ shares: 0 }), KEYS)).toBe(true);
  });
});
