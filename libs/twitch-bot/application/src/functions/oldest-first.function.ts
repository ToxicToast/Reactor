export const oldestFirst = <T extends { readonly created_at: Date }>(
  items: ReadonlyArray<T>,
): Array<T> => {
  return [...items].sort(
    (a, b) => a.created_at.getTime() - b.created_at.getTime(),
  );
};
