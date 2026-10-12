'use client';

import { useState } from 'react';
import { Chip } from '@/components/blueprint';
import {
  PLATFORM_LABEL,
  PROJECTS,
  SCOPE_LABEL,
  type ProjectPlatform,
  type ProjectScope,
} from '@/content/projects';
import { ProjectCard } from './project-card';

type Filter<T extends string> = T | 'all';

/** Values actually used by at least one project, in the label order, so a chip never leads to an empty list. */
function usedValues<T extends string>(labels: Record<T, string>, pick: (p: (typeof PROJECTS)[number]) => T): T[] {
  const used = new Set(PROJECTS.map(pick));
  return (Object.keys(labels) as T[]).filter((value) => used.has(value));
}

const PLATFORMS = usedValues(PLATFORM_LABEL, (p) => p.platform);
const SCOPES = usedValues(SCOPE_LABEL, (p) => p.scope);

function FilterRow<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  labels: Record<T, string>;
  value: Filter<T>;
  onChange: (next: Filter<T>) => void;
}) {
  // A single option means there is nothing to filter by.
  if (options.length < 2) return null;

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] tracking-label text-text-faint uppercase">{label}</span>
      <Chip className="h-9 px-3.5" selected={value === 'all'} onClick={() => onChange('all')}>
        All
      </Chip>
      {options.map((option) => (
        <Chip key={option} className="h-9 px-3.5" selected={value === option} onClick={() => onChange(option)}>
          {labels[option]}
        </Chip>
      ))}
    </div>
  );
}

/**
 * Shipped-work filters + cards. Every project is in the server-rendered HTML
 * (filters start on "All"), so crawlers see the full list. On mobile only the
 * first two show until "View all" is tapped.
 */
export function ShippedWorkGrid() {
  const [platform, setPlatform] = useState<Filter<ProjectPlatform>>('all');
  const [scope, setScope] = useState<Filter<ProjectScope>>('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = PROJECTS.filter(
    (p) => (platform === 'all' || p.platform === platform) && (scope === 'all' || p.scope === scope),
  );
  const mobileVisible = expanded ? filtered : filtered.slice(0, 2);

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 md:mt-7">
        <FilterRow label="Platform" options={PLATFORMS} labels={PLATFORM_LABEL} value={platform} onChange={setPlatform} />
        <FilterRow label="Scope" options={SCOPES} labels={SCOPE_LABEL} value={scope} onChange={setScope} />
      </div>

      <p className="sr-only" role="status">
        Showing {filtered.length} of {PROJECTS.length} projects
      </p>

      <div className="mt-5 hidden grid-cols-3 gap-5 md:mt-6 md:grid">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3.5 md:hidden">
        {mobileVisible.map((project) => (
          <ProjectCard key={project.slug} project={project} compact />
        ))}
        {!expanded && filtered.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="focus-blueprint grid h-12 place-items-center rounded-control border border-muted/35 font-sans text-sm text-text"
          >
            View all {filtered.length} projects
          </button>
        )}
      </div>
    </>
  );
}
