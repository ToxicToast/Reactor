import { createHmac } from 'node:crypto';

export const signWebhook = (
  secret: string,
  timestamp: number,
  body: string,
): string => {
  const digest = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  return `sha256=${digest}`;
};
