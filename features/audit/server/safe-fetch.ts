import 'server-only';
import http, { type IncomingHttpHeaders, type IncomingMessage } from 'node:http';
import https from 'node:https';
import type { LookupFunction } from 'node:net';
import type { Readable } from 'node:stream';
import type { TLSSocket } from 'node:tls';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';
import { SITE_URL } from '@/lib/site';
import { resolveSafeTarget, type ResolvedTarget } from './ssrf-guard';

/** Thrown when the site can't be fetched (timeout, refused, TLS failure…). The message is visitor-safe. */
export class FetchFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchFailedError';
  }
}

export type CertificateInfo = {
  /** False when the browser would show a certificate warning (expired, wrong host, untrusted…). */
  isTrusted: boolean;
  error?: string;
  validTo?: string;
};

export type SafeResponse = {
  /** URL of the final response, after redirects. */
  url: string;
  status: number;
  headers: IncomingHttpHeaders;
  body: string;
  /** Decompressed bytes read (capped at `maxBytes`). */
  bodyBytes: number;
  isTruncated: boolean;
  /** Milliseconds from sending the final request to receiving its headers. */
  ttfbMs: number;
  /** Every URL that redirected, in order. */
  redirects: string[];
  certificate?: CertificateInfo;
};

export type SafeFetchOptions = {
  maxBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
};

const USER_AGENT = `BlueprintAudit/1.0 (+${SITE_URL}/audit)`;

/**
 * GETs a public URL with the SSRF guard applied to every hop (docs/AUDIT.md#ssrf-guard):
 * resolve once → check → connect to that exact address; manual redirects; timeout; size cap.
 * Certificates aren't enforced (so an expired one can be reported), which is fine because
 * nothing secret is ever sent.
 */
export async function safeFetch(
  input: URL,
  { maxBytes = 2 * 1024 * 1024, timeoutMs = 10_000, maxRedirects = 5 }: SafeFetchOptions = {},
): Promise<SafeResponse> {
  const signal = AbortSignal.timeout(timeoutMs);
  const redirects: string[] = [];
  let url = input;

  for (let hop = 0; ; hop++) {
    // DNS isn't abortable, so check the budget before every hop.
    if (signal.aborted) throw new FetchFailedError('The site took too long to respond.');
    const target = await resolveSafeTarget(url);
    const response = await requestOnce(url, target, { maxBytes, signal });

    const location = response.headers.location;
    if (response.status >= 300 && response.status < 400 && location) {
      if (hop >= maxRedirects) throw new FetchFailedError('The site redirects too many times.');
      redirects.push(url.toString());
      try {
        url = new URL(location, url);
      } catch {
        throw new FetchFailedError('The site redirects to an invalid address.');
      }
      continue;
    }

    return { ...response, url: url.toString(), redirects };
  }
}

type HopResult = Omit<SafeResponse, 'url' | 'redirects'>;

function requestOnce(
  url: URL,
  target: ResolvedTarget,
  { maxBytes, signal }: { maxBytes: number; signal: AbortSignal },
): Promise<HopResult> {
  // Hand Node the pre-validated address instead of letting it resolve the hostname again.
  const pinnedLookup = ((_hostname, options, callback) => {
    const cb = callback as (...args: unknown[]) => void;
    if ((options as { all?: boolean }).all) cb(null, [{ address: target.address, family: target.family }]);
    else cb(null, target.address, target.family);
  }) as LookupFunction;

  const isHttps = url.protocol === 'https:';
  const transport = isHttps ? https : http;
  const startedAt = performance.now();

  return new Promise<HopResult>((resolve, reject) => {
    let isSettled = false;
    const settle = (fn: () => void) => {
      if (isSettled) return;
      isSettled = true;
      fn();
    };
    const fail = (error: unknown) => settle(() => reject(toFetchError(error, signal)));

    const request = transport.request(
      url,
      {
        method: 'GET',
        agent: false,
        lookup: pinnedLookup,
        signal,
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'accept-encoding': 'br, gzip, deflate',
          'accept-language': 'en',
        },
        ...(isHttps ? { rejectUnauthorized: false } : {}),
      },
      (response) => {
        const ttfbMs = Math.round(performance.now() - startedAt);
        const certificate = isHttps ? readCertificate(response) : undefined;
        const base = { status: response.statusCode ?? 0, headers: response.headers, ttfbMs, certificate };

        // Redirect bodies are irrelevant.
        if (base.status >= 300 && base.status < 400) {
          response.destroy();
          settle(() => resolve({ ...base, body: '', bodyBytes: 0, isTruncated: false }));
          return;
        }

        let stream: Readable;
        try {
          stream = decompress(response);
        } catch (error) {
          response.destroy();
          fail(error);
          return;
        }

        const chunks: Buffer[] = [];
        let bodyBytes = 0;
        const finish = (isTruncated: boolean) =>
          settle(() => resolve({ ...base, body: Buffer.concat(chunks).toString('utf8'), bodyBytes, isTruncated }));

        stream.on('data', (chunk: Buffer) => {
          const room = maxBytes - bodyBytes;
          if (chunk.length >= room) {
            chunks.push(chunk.subarray(0, room));
            bodyBytes = maxBytes;
            finish(true);
            request.destroy();
            return;
          }
          chunks.push(chunk);
          bodyBytes += chunk.length;
        });
        stream.on('end', () => finish(false));
        stream.on('error', fail);
        response.on('error', fail);
      },
    );

    request.on('error', fail);
    request.end();
  });
}

function decompress(response: IncomingMessage): Readable {
  const encoding = String(response.headers['content-encoding'] ?? '').trim().toLowerCase();
  if (encoding === 'br') return response.pipe(createBrotliDecompress());
  if (encoding === 'gzip' || encoding === 'x-gzip') return response.pipe(createGunzip());
  if (encoding === 'deflate') return response.pipe(createInflate());
  return response;
}

function readCertificate(response: IncomingMessage): CertificateInfo | undefined {
  const socket = response.socket as TLSSocket | null;
  if (!socket || typeof socket.getPeerCertificate !== 'function') return undefined;
  const peer = socket.getPeerCertificate();
  const error = socket.authorizationError;
  return {
    isTrusted: socket.authorized,
    error: error ? String(error) : undefined,
    validTo: peer && 'valid_to' in peer && peer.valid_to ? new Date(peer.valid_to).toISOString() : undefined,
  };
}

function toFetchError(error: unknown, signal: AbortSignal): Error {
  if (error instanceof FetchFailedError) return error;
  if (signal.aborted) return new FetchFailedError('The site took too long to respond.');
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  switch (code) {
    case 'ECONNREFUSED':
      return new FetchFailedError('The site refused the connection.');
    case 'ECONNRESET':
    case 'EPIPE':
      return new FetchFailedError('The site closed the connection.');
    case 'ETIMEDOUT':
      return new FetchFailedError('The site took too long to respond.');
    case 'Z_DATA_ERROR':
    case 'ERR_PADDING_1':
      return new FetchFailedError('The site sent a corrupted response.');
    default:
      return new FetchFailedError('Couldn’t reach that site.');
  }
}
