import { useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

export function A11yAnnouncer() {
  return (
    <div
      id="a11y-announcer"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}

export function ReducedMotionStyles() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [prefersReducedMotion]);

  return null;
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}

export default function A11yProvider({ children }) {
  return (
    <>
      <A11yAnnouncer />
      <ReducedMotionStyles />
      <SkipLink />
      {children}
    </>
  );
}
