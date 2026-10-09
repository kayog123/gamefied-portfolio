import { NextResponse } from 'next/server';
import { z } from 'zod';
import { IDEA_MAX_LENGTH } from '@/content/presets';
import { generateBlueprint } from '@/features/generating/server/generate-blueprint';

const requestSchema = z.object({
  idea: z.string().trim().min(1, 'Tell me a bit about your idea.').max(IDEA_MAX_LENGTH),
});

/**
 * POST /api/blueprint — turns an idea into a blueprint (Sheet 02).
 * See docs/FILE-STRUCTURE.md and features/generating/server/generate-blueprint.ts.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const { preset } = await generateBlueprint(parsed.data.idea);

  return NextResponse.json({
    presetId: preset.id,
    blueprint: preset.blueprint,
    stackLine: preset.stackLine,
    proofsCount: preset.proofsCount,
  });
}
