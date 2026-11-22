/** Kehrt eine REST-Name → Proto-Wert-Tabelle um, für die Antworten; unbekannte Werte ergeben undefined. */
export const enumNames = <K extends string, V extends string>(
  values: Readonly<Record<K, V>>,
): Readonly<Partial<Record<string, K>>> => {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [value, name]),
  ) as Readonly<Partial<Record<string, K>>>;
};
