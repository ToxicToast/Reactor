const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / HOUR);
  const minutes = Math.floor((seconds % HOUR) / MINUTE);
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
};
