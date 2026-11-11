export const contractNamesOf = (
  names: Readonly<Record<string, string>>,
): Array<string> => {
  return Object.values(names).sort();
};
