import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import { hasPermission } from './has-permission.function.js';

const actor: Actor = {
  type: ActorType.USER,
  id: '0192f3a0-0000-7000-8000-000000000002',
  ip: null,
  permissions: ['blog.tag.write'],
};

describe('hasPermission', () => {
  it('is true for a granted permission', () => {
    expect(hasPermission(actor, 'blog.tag.write')).toBe(true);
  });

  it('is false for a missing permission', () => {
    expect(hasPermission(actor, 'blog.tag.delete')).toBe(false);
  });
});
