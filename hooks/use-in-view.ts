import { useEffect, useRef, useState } from 'react';

export type UseInViewOptions = {
  /** Fraction of the element that must be visible. Defaults to 0.25. */
  threshold?: number;
  rootMargin?: string;
};

/** True once the element has scrolled into view (sticky: it never goes back to false). */
export function useInView<T extends HTMLElement>({ threshold = 0.25, rootMargin }: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}
