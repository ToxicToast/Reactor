/** geoipupdate tauscht die Datei aus; der Reader lädt sie neu, ohne den Prozess am Leben zu halten */
export const GEOIP_READER_OPTIONS = {
  watchForUpdates: true,
  watchForUpdatesNonPersistent: true,
} as const;
