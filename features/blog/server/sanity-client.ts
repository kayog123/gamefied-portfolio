import 'server-only';
import { createClient } from 'next-sanity';
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from '../blog.constants';

/** `null` until `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, so the blog renders an empty state instead of crashing. */
export const sanityClient = SANITY_PROJECT_ID
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
    })
  : null;
