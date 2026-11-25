import type { ClickBrowsers } from '../constants/index.js';

export type ClickBrowser = (typeof ClickBrowsers)[keyof typeof ClickBrowsers];
