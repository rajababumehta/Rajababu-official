import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  duration = 1600,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  // Parse numeric target
  const numValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.]/g, ''));
  const isDecimal = value.toString().includes('.');

  useEffect(() => {
    // If not a valid number, just render string
    if (isNaN(numValue)) {
      setDisplayValue(value.toString());
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value.toString());
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();

          const updateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = easeOutProgress * numValue;

            if (isDecimal) {
              setDisplayValue(current.toFixed(1));
            } else {
              setDisplayValue(Math.floor(current).toString());
            }

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setDisplayValue(numValue.toString());
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [numValue, hasAnimated, duration, isDecimal, value]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
      {suffix}
    </span>
  );
};
