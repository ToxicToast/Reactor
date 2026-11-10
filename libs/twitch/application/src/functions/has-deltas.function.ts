export const hasDeltas = (
  deltas: Readonly<Record<string, number>>,
): boolean => {
  return Object.values(deltas).some((value) => value !== 0);
};
