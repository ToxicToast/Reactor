import type { Optional } from '@toxictoast/shared-types';

/** Leere Nutzertexte (Cheer-Nachricht, Einlösungs-Eingabe) lassen das Feld weg. */
export const optionalText = (text: string): Optional<string> => {
  const trimmed = text.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};
