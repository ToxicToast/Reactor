import type { ClickDevices } from '../constants/index.js';

export type ClickDevice = (typeof ClickDevices)[keyof typeof ClickDevices];
