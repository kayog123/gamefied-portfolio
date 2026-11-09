import 'server-only';
import { ImageResponse } from 'next/og';
import { AUDIT_CATEGORIES } from '../audit.constants';
import { isValidShareId } from '../audit.utils';
import { getSnapshot } from './audit-store';

/** 1200 x 630 is the size social platforms expect for link previews. */
const WIDTH = 1200;
const HEIGHT = 630;

// Blueprint tokens (docs/design-system/tokens.css). ImageResponse can't read CSS variables.
const NAVY = '#0b1220';
const GRID = '#1e3a5f';
const GLOW = '#60a5fa';
const TEXT = '#f1f5f9';
const MUTED = '#94a3b8';
const DANGER = '#fca5a5';

const LABEL = { seo: 'SEO', security: 'SECURITY', maintainability: 'MAINTAINABILITY' } as const;

/**
 * The link-preview card for a shared audit (Sheet 09 · 09f): the domain, three scores and the critical/locked
 * counts. Only the stored public preview is read, so the image can never show more than the page does. An unknown,
 * malformed or unreadable ID gets a generic card instead of an error, because crawlers cache whatever they get.
 * It uses the default font: there is no font file in the repo yet.
 */
export async function renderShareImage(shareId: string): Promise<ImageResponse> {
  const snapshot = isValidShareId(shareId) ? await getSnapshot(shareId).catch(() => null) : null;
  const preview = snapshot?.preview;
  const lockedCount = preview?.findings.filter((finding) => finding.isLocked).length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: NAVY,
          backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
          backgroundSize: '160px 160px',
          color: TEXT,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3 }}>
          <span style={{ color: GLOW }}>WEBSITE AUDIT</span>
          <span style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: GLOW }}>{'</>'}</span>
            <span>JOVANNI JUNGCO</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', fontSize: snapshot && snapshot.domain.length > 22 ? 64 : 88, fontWeight: 700, letterSpacing: -3 }}>
            {snapshot ? snapshot.domain : 'Website audit'}
          </div>
          {preview && (
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 1.5, color: MUTED }}>
              <span style={{ color: preview.counts.critical > 0 ? DANGER : MUTED }}>{preview.counts.critical} CRITICAL</span>
              <span>{`  ·  ${preview.counts.warning} WARNINGS  ·  ${lockedCount} LOCKED FINDINGS`}</span>
            </div>
          )}
        </div>

        {preview ? (
          <div style={{ display: 'flex', gap: 20 }}>
            {AUDIT_CATEGORIES.map((category) => (
              <div
                key={category}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '22px 24px',
                  border: `1px solid ${GLOW}55`,
                  borderRadius: 6,
                  background: `${NAVY}cc`,
                }}
              >
                <div style={{ display: 'flex', fontSize: 18, letterSpacing: 2, color: MUTED }}>{LABEL[category]}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 64, fontWeight: 700 }}>
                  {preview.scores[category]}
                  <span style={{ fontSize: 26, color: GLOW, marginLeft: 4 }}>/100</span>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, background: GRID }}>
                  <div style={{ display: 'flex', width: `${preview.scores[category]}%`, height: 6, borderRadius: 3, background: GLOW }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', fontSize: 28, color: MUTED }}>SEO, security and maintainability, checked in about 10 seconds.</div>
        )}
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
