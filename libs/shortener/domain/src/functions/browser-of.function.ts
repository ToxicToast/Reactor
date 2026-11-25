import type { Nullable } from '@toxictoast/shared-types';
import { BROWSER_RULES, ClickBrowsers } from '../constants/index.js';
import type { ClickBrowser } from '../types/index.js';

export const browserOf = (userAgent: Nullable<string>): ClickBrowser => {
  if (!userAgent) {
    return ClickBrowsers.UNKNOWN;
  }
  const rule = BROWSER_RULES.find((candidate) => {
    return candidate.pattern.test(userAgent);
  });
  return rule?.browser ?? ClickBrowsers.OTHER;
};
