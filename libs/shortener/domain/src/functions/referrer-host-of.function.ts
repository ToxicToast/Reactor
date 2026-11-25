import type { Nullable } from '@toxictoast/shared-types';
import { CLICK_LIMITS } from '../constants/index.js';

export const referrerHostOf = (referer: Nullable<string>): Nullable<string> => {
  if (!referer || !URL.canParse(referer)) {
    return null;
  }
  const host = new URL(referer).hostname.toLowerCase();
  const withoutWww = host.startsWith(CLICK_LIMITS.WWW_PREFIX)
    ? host.slice(CLICK_LIMITS.WWW_PREFIX.length)
    : host;
  if (withoutWww.length === 0) {
    return null;
  }
  return withoutWww.slice(0, CLICK_LIMITS.REFERRER_HOST_MAX);
};
