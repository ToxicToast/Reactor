import type { IpBanAnemic, IpBanId } from '@toxictoast/security-domain';

export const ipBanAnemic = (
  id: string,
  overrides: Partial<IpBanAnemic> = {},
): IpBanAnemic => {
  return {
    id: id as IpBanId,
    ip: '203.0.113.7',
    level: 1,
    failed_attempts: 20,
    banned_until: new Date('2026-10-23T12:30:00Z'),
    lifted_at: null,
    lifted_by: null,
    created_at: new Date('2026-10-23T12:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
