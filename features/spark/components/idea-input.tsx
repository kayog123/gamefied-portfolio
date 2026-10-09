'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { Button, DimensionLine } from '@/components/blueprint';
import { IDEA_MAX_LENGTH } from '@/content/presets';
import { cn } from '@/lib/cn';

const PLACEHOLDER = 'e.g. A marketplace where creators bid on brand campaigns';
const DIMENSION_LABEL = '880 PX · 500 CHAR MAX';

export type IdeaInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/**
 * The hero idea input (Sheet 01). Enter submits, Shift+Enter adds a newline.
 * Auto-resizes within a min/max height; shows a live "N / 500" counter.
 */
export function IdeaInput({ value, onChange, onSubmit, disabled, autoFocus = true, className }: IdeaInputProps) {
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length > 0 && !disabled;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(value.trim());
  }

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <DimensionLine label={DIMENSION_LABEL} className="mb-2.5 hidden md:flex" />
      <div
        className="animate-input-pulse relative box-border rounded-panel border border-glow bg-input px-[22px] pb-4 pt-[22px] backdrop-blur-[14px]"
        style={{ boxShadow: 'var(--shadow-glow-input)' }}
      >
        <label htmlFor={textareaId} className="sr-only">
          Describe the product you want built
        </label>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={value}
          disabled={disabled}
          placeholder={PLACEHOLDER}
          maxLength={IDEA_MAX_LENGTH}
          rows={2}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="max-h-[220px] min-h-17 w-full resize-none border-0 bg-transparent font-sans text-lg leading-[1.45] text-text-strong placeholder:text-muted focus:outline-none md:min-h-[68px] md:text-[22px]"
        />
        <div className="mt-3.5 flex flex-col gap-3 border-t border-glow/20 pt-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-[18px] font-mono text-[11px] text-muted">
            <span>
              {value.length} / {IDEA_MAX_LENGTH}
            </span>
            <span className="hidden md:inline">↵ ENTER TO DRAFT</span>
          </div>
          <Button
            size="lg"
            className="w-full md:w-auto"
            disabled={!canSubmit}
            onClick={handleSubmit}
            iconRight={<ArrowRight className="size-4" aria-hidden />}
          >
            Draft my blueprint
          </Button>
        </div>
      </div>
    </div>
  );
}
