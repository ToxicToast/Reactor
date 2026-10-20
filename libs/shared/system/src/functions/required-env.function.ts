export const requiredEnv = (
  name: string,
  source: NodeJS.ProcessEnv = process.env,
): string => {
  const value = source[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
};
