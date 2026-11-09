import { renderShareImage } from '@/features/audit/server/share-image';

export const alt = 'Website audit by Jovanni Jungco';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Link-preview card for `/audit/s/[shareId]`. The drawing lives in the feature; this file only routes it. */
export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  return renderShareImage(shareId);
}
