import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from '@/features/blog/blog.constants';
import { schemaTypes } from '@/features/blog/studio';

/** Sanity Studio config, embedded at `/studio` (app/studio/[[...tool]]). */
export default defineConfig({
  name: 'default',
  title: 'Jovanni Jungco — Blog',
  basePath: '/studio',
  projectId: SANITY_PROJECT_ID ?? '',
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  schema: { types: schemaTypes },
  plugins: [structureTool()],
});
