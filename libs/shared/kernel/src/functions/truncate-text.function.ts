import { ELLIPSIS } from '../constants/index.js';

export const truncateText = (text: string, max: number): string => {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, Math.max(max - ELLIPSIS.length, 0))}${ELLIPSIS}`;
};
