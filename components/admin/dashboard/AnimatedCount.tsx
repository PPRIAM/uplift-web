'use client';

import { useState, useEffect } from 'react';

// Composant de CountUp réactif qui respecte prefers-reduced-motion
export function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Vérification stricte des préférences utilisateur de réduction des mouvements
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCount(value);
      return;
    }

    const start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 800; // Durée en millisecondes
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out quadratique pour un effet plus doux
      const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
      const currentCount = Math.round(easeOutQuad(progress) * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{count.toLocaleString('fr-FR')}</>;
}