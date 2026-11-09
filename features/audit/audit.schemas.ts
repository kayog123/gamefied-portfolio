import { z } from 'zod';
import { MAX_AUDIT_URL_LENGTH } from './audit.constants';

export const MAX_REQUEST_MESSAGE_LENGTH = 2000;

/** "Get the full audit" form (Sheet 09 · 09d). Shared by the form and `POST /api/audit/request`. */
export const auditRequestSchema = z.object({
  url: z.string().trim().min(1).max(MAX_AUDIT_URL_LENGTH),
  name: z.string().trim().min(1, 'Tell me your name.').max(100, 'Keep your name under 100 characters.'),
  email: z.email('Enter a valid email.').max(254),
  message: z.string().trim().max(MAX_REQUEST_MESSAGE_LENGTH, `Keep it under ${MAX_REQUEST_MESSAGE_LENGTH.toLocaleString('en-US')} characters.`).default(''),
  consent: z.literal(true, 'Please confirm that I may email you about this audit.'),
  turnstileToken: z.string().max(4096).optional(),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
