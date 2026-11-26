import type { AccountRef } from '../interfaces/index.js';

export const accountRefOf = (account: AccountRef): AccountRef => {
  return { platform: account.platform, remote_id: account.remote_id };
};
