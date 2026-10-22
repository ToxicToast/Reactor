import { ActorType } from '../enums/index.js';
import { isActorIdentity } from './is-actor-identity.function.js';
import { isActorType } from './is-actor-type.function.js';

describe('isActorType', () => {
  it('accepts every actor type', () => {
    expect(Object.values(ActorType).every(isActorType)).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isActorType('admin')).toBe(false);
    expect(isActorType(undefined)).toBe(false);
  });
});

describe('isActorIdentity', () => {
  it('accepts a complete identity', () => {
    expect(
      isActorIdentity({ type: 'user', id: 'user-1', ip: '203.0.113.7' }),
    ).toBe(true);
  });

  it('accepts an identity without id and ip', () => {
    expect(isActorIdentity({ type: 'system', id: null, ip: null })).toBe(true);
  });

  it('rejects missing or invalid fields', () => {
    expect(isActorIdentity(null)).toBe(false);
    expect(isActorIdentity({ type: 'admin', id: null, ip: null })).toBe(false);
    expect(isActorIdentity({ type: 'user', id: 1, ip: null })).toBe(false);
    expect(isActorIdentity({ type: 'user', id: null })).toBe(false);
  });
});
