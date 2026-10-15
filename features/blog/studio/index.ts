// Studio-only entry, imported by `sanity.config.ts` (never by `(site)` pages).
import { codeBlockSchema } from './code-block.schema';
import { postSchema } from './post.schema';

export const schemaTypes = [postSchema, codeBlockSchema];
