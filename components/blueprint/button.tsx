import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Renders as a Next.js <Link> instead of a <button>. */
  href?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-cta text-navy font-display font-semibold hover:bg-cta-hover hover:shadow-glow-cta disabled:bg-slate-line disabled:text-muted disabled:shadow-none',
  secondary:
    'border border-wire bg-wire/12 text-text hover:border-glow hover:bg-wire/24 hover:text-white hover:shadow-glow-blue disabled:border-slate-line disabled:bg-transparent disabled:text-text-faint',
  ghost:
    'text-text-soft hover:bg-muted/10 hover:text-text-strong hover:underline hover:underline-offset-4 disabled:text-text-faint',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'py-2.5 px-3.5 text-sm',
  md: 'h-11 px-[18px] text-[15px]',
  lg: 'h-[52px] px-5 text-base',
};

const baseClasses =
  'focus-blueprint inline-flex shrink-0 items-center justify-center gap-2 rounded-control transition-colors disabled:pointer-events-none disabled:cursor-not-allowed';

/** Sheet 00 button: primary (amber) / secondary (blue outline) / ghost (text). */
export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
