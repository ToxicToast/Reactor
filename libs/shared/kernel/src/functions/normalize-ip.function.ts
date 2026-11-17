import { isIPv4 } from 'node:net';
import { IP } from '../constants/index.js';

export const normalizeIp = (ip: string): string => {
  const trimmed = ip.trim().toLowerCase();
  if (trimmed.startsWith(IP.MAPPED_IPV4_PREFIX)) {
    const ipv4 = trimmed.slice(IP.MAPPED_IPV4_PREFIX.length);
    if (isIPv4(ipv4)) {
      return ipv4;
    }
  }
  return trimmed;
};
