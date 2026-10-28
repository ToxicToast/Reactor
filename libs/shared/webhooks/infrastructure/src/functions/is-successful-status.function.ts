export const isSuccessfulStatus = (statusCode: number): boolean => {
  return statusCode >= 200 && statusCode < 300;
};
