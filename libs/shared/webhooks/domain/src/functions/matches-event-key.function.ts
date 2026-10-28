export const matchesEventKey = (
  patterns: ReadonlyArray<string>,
  eventKey: string,
): boolean => {
  return patterns.some((pattern) => {
    if (pattern === '*') {
      return true;
    }
    if (pattern.endsWith('.*')) {
      return eventKey.startsWith(pattern.slice(0, -1));
    }
    return pattern === eventKey;
  });
};
