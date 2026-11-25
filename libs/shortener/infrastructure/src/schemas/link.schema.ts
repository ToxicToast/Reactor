import { anemicColumns } from '@toxictoast/shared-persistence';
import { LINK_LIMITS } from '@toxictoast/shortener-domain';
import { EntitySchema } from 'typeorm';
import type { LinkRow } from '../interfaces/index.js';

export const LinkSchema = new EntitySchema<LinkRow>({
  name: 'Link',
  tableName: 'links',
  columns: {
    ...anemicColumns,
    target_url: { type: 'varchar', length: LINK_LIMITS.TARGET_URL_MAX },
    description: {
      type: 'varchar',
      length: LINK_LIMITS.DESCRIPTION_MAX,
      nullable: true,
    },
    active: { type: 'boolean' },
  },
});
