import { optionalEnv } from './optional-env.function.js';

/** IANA-Zeitzone aus der Env; eine unbekannte Zone bricht den Start ab */
export const timeZoneEnv = (
  name: string,
  fallback: string,
  source: NodeJS.ProcessEnv = process.env,
): string => {
  const timeZone = optionalEnv(name, undefined, source) ?? fallback;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    throw new Error(`${name} must be an IANA time zone, got ${timeZone}`);
  }
  return timeZone;
};
