import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import './sticky-cta.css';

export function StickyCTA() {
  const { industryId } = useIndustry();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.story-hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sticky-cta${visible ? ' is-visible' : ''}`}
      role="complementary"
      aria-label="Quick signup"
      aria-hidden={!visible}
    >
      <Link to={`/signup?industry=${industryId}`} className="btn btn-accent sticky-cta-btn">
        {CTA.primary}
      </Link>
    </div>
  );
}
