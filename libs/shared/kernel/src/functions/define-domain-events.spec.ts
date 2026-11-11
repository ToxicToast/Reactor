import { defineDomainEvents } from './define-domain-events.function.js';

describe('defineDomainEvents', () => {
  const events = defineDomainEvents('test.thing', 2, {
    CREATED: 'created',
    DELETED: 'deleted',
  });

  it('defines one event per name with namespace and version', () => {
    expect(events.CREATED).toEqual({
      namespace: 'test.thing',
      name: 'created',
      version: 2,
    });
    expect(events.DELETED.name).toBe('deleted');
  });

  it('freezes the definitions', () => {
    expect(Object.isFrozen(events)).toBe(true);
    expect(Object.isFrozen(events.CREATED)).toBe(true);
  });
});
