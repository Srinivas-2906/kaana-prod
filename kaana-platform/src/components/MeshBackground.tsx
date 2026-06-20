import { useEffect, useRef } from 'react';
import './mesh.css';

/** Scroll-reactive ambient mesh — iOS / visionOS style */
export function MeshBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const update = () => {
      const scroll = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scroll / docHeight : 0;

      root.style.setProperty('--scroll-y', `${scroll}px`);
      root.style.setProperty('--scroll-p', `${progress}`);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="mesh-bg" ref={rootRef} aria-hidden="true">
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
      <div className="mesh-orb mesh-orb-4" />
      <div className="mesh-orb mesh-orb-5" />
      <div className="mesh-noise" />
    </div>
  );
}
