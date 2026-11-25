export const CLICK_LIMITS = {
  /** längster erlaubter Hostname laut DNS */
  REFERRER_HOST_MAX: 253,
  COUNTRY_LENGTH: 2,
  /** längster Wert in ClickDevices bzw. ClickBrowsers, mit Reserve */
  KIND_MAX: 16,
  /** Prefix, der beim Referrer weggekürzt wird, damit www.youtube.com und youtube.com zusammenfallen */
  WWW_PREFIX: 'www.',
} as const;
