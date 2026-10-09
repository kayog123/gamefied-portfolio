'use client';

import { useState } from 'react';
import { PROJECTS } from '@/content/projects';
import { ProjectCard } from './project-card';

/** Mobile "Shipped work" (Sheet 07b): top 2 cards, then "View all" expands the rest. */
export function MobileShippedWork() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? PROJECTS : PROJECTS.slice(0, 2);

  return (
    <div className="flex flex-col gap-3.5 md:hidden">
      {visible.map((project) => (
        <ProjectCard key={project.slug} project={project} compact />
      ))}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="focus-blueprint grid h-12 place-items-center rounded-control border border-muted/35 font-sans text-sm text-text"
        >
          View all {PROJECTS.length} projects
        </button>
      )}
    </div>
  );
}
