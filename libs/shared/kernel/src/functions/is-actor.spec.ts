import { ActorType } from '../enums/index.js';
import { isActor } from './is-actor.function.js';
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

describe('isActor', () => {
  it('accepts a complete actor', () => {
    expect(isActor({ type: 'user', id: 'user-1', ip: '203.0.113.7' })).toBe(
      true,
    );
  });

  it('accepts an actor without id and ip', () => {
    expect(isActor({ type: 'system', id: null, ip: null })).toBe(true);
  });

  it('rejects missing or invalid fields', () => {
    expect(isActor(null)).toBe(false);
    expect(isActor({ type: 'admin', id: null, ip: null })).toBe(false);
    expect(isActor({ type: 'user', id: 1, ip: null })).toBe(false);
    expect(isActor({ type: 'user', id: null })).toBe(false);
  });
});
