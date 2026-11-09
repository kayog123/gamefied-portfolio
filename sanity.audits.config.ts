import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { auditSchemaTypes } from '@/features/audit/studio';

/**
 * Studio for the PRIVATE audits dataset (website-audit requests), embedded at `/studio/audits`
 * (app/studio/audits/[[...tool]]). Separate from the blog Studio (`sanity.config.ts`) so nothing
 * about the blog's public dataset changes. Only members of the Sanity project can sign in.
 */
export default defineConfig({
  name: 'audits',
  title: 'Jovanni Jungco — Audit requests',
  basePath: '/studio/audits',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_AUDIT_DATASET ?? 'audits',
  apiVersion: '2025-01-01',
  schema: { types: auditSchemaTypes },
  plugins: [structureTool()],
});
