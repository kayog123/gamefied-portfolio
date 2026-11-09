import { describe, expect, it } from 'vitest';
import { safeFetch } from './safe-fetch';
import { BlockedUrlError, isPublicAddress, resolveSafeTarget } from './ssrf-guard';

describe('isPublicAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254', // cloud metadata
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::',
    'fe80::1',
    'fd00::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:a9fe:a9fe', // 169.254.169.254
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(['93.184.215.14', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111', '::ffff:1.1.1.1'])('allows %s', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });
});

describe('resolveSafeTarget', () => {
  it.each([
    'http://localhost/',
    'http://app.localhost/',
    'http://127.0.0.1/',
    'http://[::1]/',
    'http://169.254.169.254/latest/meta-data/',
    'http://2130706433/', // 127.0.0.1 as a decimal integer
    'http://0x7f.0.0.1/',
    'https://example.com:8443/',
    'https://user:pass@example.com/',
    'ftp://example.com/',
    'file:///etc/passwd',
  ])('rejects %s', async (url) => {
    await expect(resolveSafeTarget(new URL(url))).rejects.toBeInstanceOf(BlockedUrlError);
  });

  it('accepts a public IP literal', async () => {
    await expect(resolveSafeTarget(new URL('https://1.1.1.1/'))).resolves.toEqual({ address: '1.1.1.1', family: 4 });
  });
});

describe('safeFetch', () => {
  it('never connects to a private address', async () => {
    await expect(safeFetch(new URL('http://127.0.0.1/'))).rejects.toBeInstanceOf(BlockedUrlError);
  });
});
