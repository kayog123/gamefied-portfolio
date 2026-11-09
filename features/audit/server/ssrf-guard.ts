import 'server-only';
import { Resolver } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

/** Thrown when a URL points somewhere the audit must never reach (private network, odd port…). */
export class BlockedUrlError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'BlockedUrlError';
  }
}

const BLOCKED = new BlockList();

// IPv4: "this network", private, CGNAT, loopback, link-local (incl. cloud metadata 169.254.169.254),
// IETF/TEST-NETs, benchmarking, multicast, reserved and broadcast.
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  BLOCKED.addSubnet(network, prefix, 'ipv4');
}

// IPv6: unspecified, loopback, NAT64, discard, documentation, 6to4, unique-local, link-local, multicast.
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  BLOCKED.addSubnet(network, prefix, 'ipv6');
}

// Only global unicast IPv6 (2000::/3) is reachable on the public internet; everything else is refused.
const GLOBAL_UNICAST_V6 = new BlockList();
GLOBAL_UNICAST_V6.addSubnet('2000::', 3, 'ipv6');

const ALLOWED_PORTS = new Set(['', '80', '443']);

/** Per DNS attempt (A and AAAA run in parallel), and the hard cap per hostname. */
const DNS_TIMEOUT_MS = 1_500;
const DNS_TOTAL_MS = 3_000;

/** True when the address is safe to connect to (a public unicast address). */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !BLOCKED.check(address, 'ipv4');
  if (family !== 6) return false;

  // IPv4-mapped / -compatible IPv6 (::ffff:10.0.0.1) must be judged as the IPv4 address it wraps.
  const mapped = address.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped) return isPublicAddress(mapped[1]);
  const hexMapped = address.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);
    return isPublicAddress(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }
  return GLOBAL_UNICAST_V6.check(address, 'ipv6') && !BLOCKED.check(address, 'ipv6');
}

export type ResolvedTarget = { address: string; family: 4 | 6 };

/**
 * Validates a URL's scheme and port, resolves its host once and checks every address.
 * The caller must connect to the returned address (not re-resolve), so DNS rebinding can't swap it.
 */
export async function resolveSafeTarget(url: URL): Promise<ResolvedTarget> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new BlockedUrlError('Only http and https URLs can be audited.');
  if (!ALLOWED_PORTS.has(url.port)) throw new BlockedUrlError('Only the standard web ports (80 and 443) can be audited.');
  if (url.username || url.password) throw new BlockedUrlError('URLs with credentials can’t be audited.');

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const literalFamily = isIP(hostname);
  if (literalFamily) {
    if (!isPublicAddress(hostname)) throw new BlockedUrlError('That address isn’t on the public internet.');
    return { address: hostname, family: literalFamily as 4 | 6 };
  }

  const lowered = hostname.toLowerCase();
  if (lowered === 'localhost' || lowered.endsWith('.localhost') || lowered.endsWith('.local') || lowered.endsWith('.internal')) {
    throw new BlockedUrlError('That address isn’t on the public internet.');
  }

  const addresses = await resolveHost(hostname);
  if (addresses.length === 0) throw new BlockedUrlError('That domain doesn’t resolve. Check the spelling.');
  // Every address must be public: a mixed answer is a classic rebinding trick.
  if (!addresses.every(({ address }) => isPublicAddress(address))) {
    throw new BlockedUrlError('That address isn’t on the public internet.');
  }

  const preferred = addresses.find(({ family }) => family === 4) ?? addresses[0];
  return preferred;
}

/**
 * A/AAAA lookup over the network with c-ares (`Resolver`), not `dns.lookup`: `lookup` runs on
 * libuv's small thread pool with no timeout, so slow name servers could stall the whole server.
 * It also ignores /etc/hosts, which is what we want for public sites.
 */
async function resolveHost(hostname: string): Promise<ResolvedTarget[]> {
  const resolver = new Resolver({ timeout: DNS_TIMEOUT_MS, tries: 2 });
  // c-ares backs off between tries, so cap the total too; cancel() rejects the pending queries.
  const cap = setTimeout(() => resolver.cancel(), DNS_TOTAL_MS);
  const [v4, v6] = await Promise.allSettled([resolver.resolve4(hostname), resolver.resolve6(hostname)]).finally(() =>
    clearTimeout(cap),
  );
  return [
    ...(v4.status === 'fulfilled' ? v4.value.map((address) => ({ address, family: 4 as const })) : []),
    ...(v6.status === 'fulfilled' ? v6.value.map((address) => ({ address, family: 6 as const })) : []),
  ];
}
