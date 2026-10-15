import 'server-only';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { BLOG_CACHE_TAG } from '@/features/blog';

/**
 * Sanity webhook: publishing, editing or deleting a post marks the blog cache stale, so the
 * next visit to /blog or /blog/[slug] shows the change without a redeploy.
 * Setup: sanity.io/manage → API → Webhooks → URL `<site>/api/revalidate`, filter `_type == "post"`,
 * with the same secret as SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: 'Revalidation is not configured.' }, { status: 501 });

  const { isValidSignature } = await parseBody(req, secret);
  if (!isValidSignature) return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });

  revalidateTag(BLOG_CACHE_TAG, 'max');
  return NextResponse.json({ revalidated: true });
}
