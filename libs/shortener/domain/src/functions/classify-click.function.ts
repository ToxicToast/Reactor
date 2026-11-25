import type { LinkClick, RawClick } from '../interfaces/index.js';
import { browserOf } from './browser-of.function.js';
import { countryOf } from './country-of.function.js';
import { deviceOf } from './device-of.function.js';
import { referrerHostOf } from './referrer-host-of.function.js';

/** Rohdaten rein, nur die Auswertung raus; User-Agent und Referer-Pfad werden nicht gespeichert */
export const classifyClick = (raw: RawClick): LinkClick => {
  return {
    event_id: raw.event_id,
    link_id: raw.link_id,
    clicked_at: raw.clicked_at,
    referrer_host: referrerHostOf(raw.referer),
    device: deviceOf(raw.user_agent),
    browser: browserOf(raw.user_agent),
    country: countryOf(raw.country),
  };
};
