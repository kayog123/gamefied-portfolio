import { AuditsStudioClient } from './studio-client';

export { metadata, viewport } from 'next-sanity/studio';

/** Embedded Studio for the private audit-requests dataset at "/studio/audits". */
export default function Page() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 font-sans text-text">
        <h1 className="font-display text-3xl font-semibold text-text-strong">Sanity isn&apos;t set up yet</h1>
        <p className="mt-4 text-text-soft">
          Set <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code className="font-mono">.env.local</code>, create a
          private dataset named <code className="font-mono">audits</code>, and restart the dev server.
        </p>
      </main>
    );
  }
  return <AuditsStudioClient />;
}
