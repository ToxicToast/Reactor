import type { Nullable } from '@toxictoast/shared-types';
import { CLICK_PATTERNS, ClickDevices } from '../constants/index.js';
import type { ClickDevice } from '../types/index.js';

export const deviceOf = (userAgent: Nullable<string>): ClickDevice => {
  if (!userAgent) {
    return ClickDevices.UNKNOWN;
  }
  if (CLICK_PATTERNS.BOT.test(userAgent)) {
    return ClickDevices.BOT;
  }
  if (CLICK_PATTERNS.TABLET.test(userAgent)) {
    return ClickDevices.TABLET;
  }
  if (CLICK_PATTERNS.MOBILE.test(userAgent)) {
    return ClickDevices.MOBILE;
  }
  return ClickDevices.DESKTOP;
};
