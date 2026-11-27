/** getrimmt, ohne Doppelte und leere, sortiert */
export const normalizeScopes = (
  scopes: ReadonlyArray<string>,
): Array<string> => {
  return [...new Set(scopes.map((scope) => scope.trim()))]
    .filter((scope) => scope.length > 0)
    .sort();
};
