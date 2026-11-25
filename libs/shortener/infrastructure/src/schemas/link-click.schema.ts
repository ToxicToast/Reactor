import { CLICK_LIMITS } from '@toxictoast/shortener-domain';
import { EntitySchema } from 'typeorm';
import type { LinkClickRow } from '../interfaces/index.js';

export const LinkClickSchema = new EntitySchema<LinkClickRow>({
  name: 'LinkClick',
  tableName: 'link_clicks',
  columns: {
    event_id: { type: 'uuid', primary: true },
    link_id: { type: 'uuid' },
    clicked_at: { type: 'timestamptz' },
    referrer_host: {
      type: 'varchar',
      length: CLICK_LIMITS.REFERRER_HOST_MAX,
      nullable: true,
    },
    device: { type: 'varchar', length: CLICK_LIMITS.KIND_MAX },
    browser: { type: 'varchar', length: CLICK_LIMITS.KIND_MAX },
    country: {
      type: 'char',
      length: CLICK_LIMITS.COUNTRY_LENGTH,
      nullable: true,
    },
  },
  indices: [
    {
      name: 'idx_link_clicks_link',
      columns: ['link_id', 'clicked_at'],
    },
  ],
});
