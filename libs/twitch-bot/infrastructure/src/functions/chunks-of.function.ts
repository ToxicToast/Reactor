export const chunksOf = <T>(
  items: ReadonlyArray<T>,
  size: number,
): Array<Array<T>> => {
  const chunks: Array<Array<T>> = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
};
