const REJECTED_STATUS_CODES: ReadonlySet<number> = new Set([400, 401]);

export const isRejectedRefresh = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return (
    typeof statusCode === 'number' && REJECTED_STATUS_CODES.has(statusCode)
  );
};
