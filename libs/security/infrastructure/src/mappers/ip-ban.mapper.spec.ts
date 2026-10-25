import { ipBanAnemic } from '@toxictoast/security-application';
import { IpBanMapper } from './ip-ban.mapper.js';

describe('IpBanMapper', () => {
  it('maps an anemic to a row and back without loss', () => {
    const mapper = new IpBanMapper();
    const anemic = ipBanAnemic('ban-1', {
      lifted_at: new Date('2026-10-23T12:10:00Z'),
      lifted_by: 'admin-1',
    });

    expect(mapper.toAnemic(mapper.toRow(anemic))).toEqual(anemic);
  });
});
