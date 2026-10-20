import { SYSTEM_ACTOR } from '../constants/index.js';
import { ActorType } from '../enums/index.js';
import type { Actor } from '../interfaces/index.js';
import { ActorContext } from './actor-context.js';

const USER: Actor = { type: ActorType.USER, id: 'user-1', ip: '203.0.113.7' };

describe('ActorContext', () => {
  it('falls back to the system actor outside of run', () => {
    expect(new ActorContext().current()).toBe(SYSTEM_ACTOR);
  });

  it('provides the actor inside run, also after await', async () => {
    const context = new ActorContext();

    const result = await context.run(USER, async () => {
      await Promise.resolve();
      return context.current();
    });

    expect(result).toBe(USER);
    expect(context.current()).toBe(SYSTEM_ACTOR);
  });
});
