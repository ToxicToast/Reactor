import { TIME_MS } from '@toxictoast/shared-types';

export const secondsBetween = (
  from: Date | number,
  to: Date | number,
): number => {
  const start = typeof from === 'number' ? from : from.getTime();
  const end = typeof to === 'number' ? to : to.getTime();
  return Math.max(0, Math.floor((end - start) / TIME_MS.SECOND));
};
