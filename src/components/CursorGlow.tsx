import React, { useEffect, useState, useRef } from 'react';

export const CursorGlow: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only run on desktop devices with a precision mouse and without reduced motion preference
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isPointerFine || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Smooth spring damping loop
    const animate = () => {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute -top-[250px] -left-[250px] w-[500px] h-[500px] rounded-full opacity-60 mix-blend-screen pointer-events-none transition-opacity duration-300 will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 70%)',
        }}
      />
    </div>
  );
};
