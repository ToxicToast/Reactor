import { missingScopes } from './missing-scopes.function.js';
import { normalizeScopes } from './normalize-scopes.function.js';

describe('normalizeScopes', () => {
  it('trims, deduplicates, drops empty scopes and sorts', () => {
    expect(
      normalizeScopes([' user:read:chat ', 'bits:read', 'user:read:chat', ' ']),
    ).toEqual(['bits:read', 'user:read:chat']);
  });
});

describe('missingScopes', () => {
  it('lists the required scopes that were not granted', () => {
    expect(
      missingScopes(
        ['youtube.readonly'],
        ['youtube.readonly', 'youtube.upload'],
      ),
    ).toEqual(['youtube.upload']);
  });
});
