// Studio-only entry, imported by `sanity.audits.config.ts` (never by `(site)` pages).
import { auditRequestSchema } from './audit-request.schema';
import { auditSnapshotSchema } from './audit-snapshot.schema';

export const auditSchemaTypes = [auditRequestSchema, auditSnapshotSchema];
