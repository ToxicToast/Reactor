import { z } from 'zod';
import { enumKeys } from './enum-keys.function.js';

export const enumQuery = <K extends string, V>(
  values: Readonly<Record<K, V>>,
) => {
  return z.enum(enumKeys(values)).transform((key) => values[key]);
};
