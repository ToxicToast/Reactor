export const missingScopes = (
  granted: ReadonlyArray<string>,
  required: ReadonlyArray<string>,
): Array<string> => {
  const available = new Set(granted);
  return required.filter((scope) => !available.has(scope));
};
