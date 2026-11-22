import { TIME_S } from '@toxictoast/shared-types';

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / TIME_S.HOUR);
  const minutes = Math.floor((seconds % TIME_S.HOUR) / TIME_S.MINUTE);
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
};
