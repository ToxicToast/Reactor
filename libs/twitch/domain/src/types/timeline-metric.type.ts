import type { PEAK_CHATTERS_METRIC } from '../constants/index.js';
import type { ChannelDayCounterKey } from './channel-day-counter-key.type.js';

export type TimelineMetric = ChannelDayCounterKey | typeof PEAK_CHATTERS_METRIC;
