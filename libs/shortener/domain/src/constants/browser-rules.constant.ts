import type { ClickBrowser } from '../types/index.js';
import { ClickBrowsers } from './click-browsers.constant.js';

/** Reihenfolge zählt: Edge, Opera und Samsung tragen auch "Chrome" im User-Agent, Chrome auch "Safari" */
export const BROWSER_RULES: ReadonlyArray<{
  readonly pattern: RegExp;
  readonly browser: ClickBrowser;
}> = [
  { pattern: /edg(e|a|ios)?\//i, browser: ClickBrowsers.EDGE },
  { pattern: /opr\/|opera/i, browser: ClickBrowsers.OPERA },
  { pattern: /samsungbrowser/i, browser: ClickBrowsers.SAMSUNG },
  { pattern: /firefox\/|fxios/i, browser: ClickBrowsers.FIREFOX },
  { pattern: /chrome\/|crios/i, browser: ClickBrowsers.CHROME },
  { pattern: /safari\//i, browser: ClickBrowsers.SAFARI },
];
