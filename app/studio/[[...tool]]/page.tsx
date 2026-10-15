import { StudioClient } from './studio-client';

export { metadata, viewport } from 'next-sanity/studio';

/** Embedded Sanity Studio at "/studio". Shows setup steps until the project ID is set. */
export default function Page() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 font-sans text-text">
        <h1 className="font-display text-3xl font-semibold text-text-strong">Sanity isn&apos;t set up yet</h1>
        <p className="mt-4 text-text-soft">
          Create a project at sanity.io/manage, then add <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{' '}
          (and optionally <code className="font-mono">NEXT_PUBLIC_SANITY_DATASET</code>) to <code className="font-mono">.env.local</code>{' '}
          and restart the dev server.
        </p>
      </main>
    );
  }
  return <StudioClient />;
}
