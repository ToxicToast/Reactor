import { invalidArgument } from './invalid-argument.function.js';

export const parseMask = <TField extends string>(
  mask: ReadonlyArray<string>,
  allowed: ReadonlyArray<TField>,
): ReadonlySet<TField> => {
  const unknown = mask.filter((field) => {
    return !allowed.includes(field as TField);
  });
  if (unknown.length > 0) {
    throw invalidArgument(
      `update_mask contains unknown fields: ${unknown.join(', ')}`,
    );
  }
  return new Set(mask as ReadonlyArray<TField>);
};
