import { Platforms, type Account } from '@toxictoast/publisher-domain';

export const account = (
  remoteId: string,
  overrides: Partial<Account> = {},
): Account => {
  return {
    platform: Platforms.YOUTUBE,
    remote_id: remoteId,
    handle: '@ToxicToastTTV',
    display_name: 'ToxicToast',
    url: 'https://www.youtube.com/@ToxicToastTTV',
    ...overrides,
  };
};
