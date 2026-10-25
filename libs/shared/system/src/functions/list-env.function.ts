export const listEnv = (
  name: string,
  fallback: ReadonlyArray<string> = [],
  source: NodeJS.ProcessEnv = process.env,
): ReadonlyArray<string> => {
  const value = source[name];
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};
