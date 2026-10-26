import { isIPv4 } from 'node:net';

const MAPPED_IPV4_PREFIX = '::ffff:';

export const normalizeIp = (ip: string): string => {
  const trimmed = ip.trim().toLowerCase();
  if (trimmed.startsWith(MAPPED_IPV4_PREFIX)) {
    const ipv4 = trimmed.slice(MAPPED_IPV4_PREFIX.length);
    if (isIPv4(ipv4)) {
      return ipv4;
    }
  }
  return trimmed;
};
