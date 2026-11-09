import 'server-only';
import { randomBytes } from 'node:crypto';
import { SHARE_ID_LENGTH } from '../audit.constants';

/** 10 random URL-safe characters (~60 bits). The link is the only access control, so it must be unguessable. */
export function generateShareId(): string {
  return randomBytes(9).toString('base64url').slice(0, SHARE_ID_LENGTH);
}
