import { describe, expect, it } from 'vitest';
import { auditRequestSchema, MAX_REQUEST_MESSAGE_LENGTH } from './audit.schemas';

const valid = { url: 'example.com', name: '  Maria Santos ', email: 'maria@example.com', message: ' Not on Google ', consent: true as const };

describe('auditRequestSchema', () => {
  it('accepts a complete request and trims the text fields', () => {
    const parsed = auditRequestSchema.parse(valid);
    expect(parsed.name).toBe('Maria Santos');
    expect(parsed.message).toBe('Not on Google');
  });

  it('treats the message as optional', () => {
    expect(auditRequestSchema.parse({ ...valid, message: undefined }).message).toBe('');
  });

  it.each([
    ['no name', { name: '   ' }, 'Tell me your name.'],
    ['a bad email', { email: 'not-an-email' }, 'Enter a valid email.'],
    ['no consent', { consent: false }, 'Please confirm that I may email you about this audit.'],
    ['a missing url', { url: '' }, undefined],
    ['a very long message', { message: 'x'.repeat(MAX_REQUEST_MESSAGE_LENGTH + 1) }, undefined],
  ])('rejects %s', (_label, patch, message) => {
    const result = auditRequestSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    if (message && !result.success) expect(result.error.issues[0].message).toBe(message);
  });

  it('does not accept consent that is merely truthy', () => {
    expect(auditRequestSchema.safeParse({ ...valid, consent: 'true' }).success).toBe(false);
    expect(auditRequestSchema.safeParse({ ...valid, consent: 1 }).success).toBe(false);
  });
});
