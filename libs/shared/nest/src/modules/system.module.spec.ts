import { Test } from '@nestjs/testing';
import {
  ActorProvider,
  SYSTEM_ACTOR,
  type Clock,
  type DomainContext,
} from '@toxictoast/shared-kernel';
import { TOKENS } from '../constants/index.js';
import { SystemModule } from './system.module.js';
import { ActorContext } from '@toxictoast/shared-system';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('SystemModule', () => {
  it('provides a domain context with uuid v7 ids and the system clock', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SystemModule],
    }).compile();

    const context = moduleRef.get<DomainContext>(TOKENS.DOMAIN_CONTEXT);
    const clock = moduleRef.get<Clock>(TOKENS.CLOCK);

    expect(context.id.generate()).toMatch(UUID_V7);
    expect(context.date).toBe(clock);
    expect(Math.abs(clock.now().getTime() - Date.now())).toBeLessThan(1000);
  });

  it('provides one actor context for the whole app', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SystemModule],
    }).compile();

    const context = moduleRef.get(ActorContext);

    expect(moduleRef.get(ActorProvider)).toBe(context);
    expect(context.current()).toBe(SYSTEM_ACTOR);
  });
});
