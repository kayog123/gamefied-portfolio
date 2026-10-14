'use client';

import { ArrowLeft, Menu, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/blueprint';
import { cn } from '@/lib/cn';
import { Logo } from './logo';

const NAV_LINKS = [
  { href: '/work#work', label: 'Work' },
  { href: '/work#skills', label: 'Skills' },
  { href: '/work#experience', label: 'Experience' },
  { href: '/process', label: 'Process' },
  { href: '/work#contact', label: 'Contact' },
];

export type SiteTopBarProps = {
  /** "work" shows the section nav; "case-study" swaps the left slot for "← All work". */
  variant?: 'work' | 'case-study';
  className?: string;
};

/**
 * The top bar for the static content pages (Sheets 07–08) — distinct from
 * the game's `GameTopBar` (docs/design-system/03-layout-and-patterns.md#top-bar).
 */
export function SiteTopBar({ variant = 'work', className }: SiteTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={cn('relative z-40 border-b border-grid bg-navy/85', className)}>
      <div className="mx-auto flex h-14 w-full max-w-page items-center justify-between px-4 md:h-16 md:px-12">
        {variant === 'case-study' ? (
          <Link href="/work" className="focus-blueprint flex items-center">
            <ArrowLeft className="size-5 text-text-soft md:hidden" aria-hidden />
            <span className="hidden font-sans text-sm text-text-soft md:inline">← All work</span>
          </Link>
        ) : (
          <Logo />
        )}

        {variant === 'work' ? (
          <nav className="hidden items-center gap-1 font-sans text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="focus-blueprint rounded-control px-3.5 py-2.5 text-text-soft hover:text-text">
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <Logo className="hidden md:flex" />
        )}

        <div className="flex items-center gap-2">
          {variant === 'work' && (
            <Button href="/" variant="secondary" size="sm" className="hidden md:inline-flex" iconRight={<Play className="size-[13px]" aria-hidden />}>
              Play the blueprint
            </Button>
          )}
          <Button href="/work#contact" size="sm">
            Talk to me
          </Button>
          {variant === 'work' && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
              className="focus-blueprint grid size-10 place-items-center rounded-control border border-muted/35 text-text md:hidden"
            >
              <Menu className="size-[18px]" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {variant === 'work' && menuOpen && (
        <nav className="flex flex-col border-t border-grid px-4 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="focus-blueprint rounded-control px-2 py-3 font-sans text-sm text-text-soft"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
